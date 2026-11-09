import type {
    FormatoExportacion,
    IPrestador,
    ITelefonoPrestador,
} from '../interfaces/prestador.interface';

export interface ResultadoArchivoCatalogo {
    contenido: string;
    mimeType: string;
    nombreArchivo: string;
    totalRegistros: number;
}

export function formatearTelefonoPrestador(telefono?: ITelefonoPrestador): string {
    if (!telefono || !telefono.nroTelefono || !telefono.nroTelefono.trim()) {
        return 'Sin teléfono';
    }

    const partes = [
        telefono.codPais?.trim(),
        telefono.codArea?.trim(),
        telefono.nroTelefono?.trim(),
    ].filter(Boolean);

    return partes.join(' ');
}

export function sanitizarTextoPdf(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

export function escaparXml(texto: string): string {
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function generarContenidoPdf(prestadores: IPrestador[]): string {
    const lineas: string[] = [
        'Fixer Servicios - Catalogo de Prestadores',
        `Total de registros exportados: ${prestadores.length}`,
        '------------------------------------------------------------------------',
    ];

    if (prestadores.length === 0) {
        lineas.push('Sin registros para los criterios seleccionados.');
    } else {
        for (const p of prestadores) {
            const matricula = p.matricula ? p.matricula : 'S/M';
            const garantia = p.ofreceGarantia ? 'Si' : 'No';
            const rating = p.ratingPromedio !== undefined ? p.ratingPromedio.toFixed(1) : '-';
            const tel = formatearTelefonoPrestador(p.telefono);
            lineas.push(
                `#${p.id} ${p.nombre} ${p.apellido} | ${p.categoriaId} | Mat: ${matricula} | Exp: ${p.aniosExperiencia}a | Garantia: ${garantia} | Tel: ${tel} | Rating: ${rating}`
            );
        }
    }

    const instruccionesTexto = lineas
        .slice(0, 45)
        .map((linea, indice) => {
            const posY = 790 - indice * 16;
            return `1 0 0 1 40 ${posY} Tm (${sanitizarTextoPdf(linea)}) Tj`;
        })
        .join('\n');

    const stream = `BT\n/F1 9 Tf\n${instruccionesTexto}\nET`;

    const objetos = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj',
        `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
        '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    ];

    return [
        '%PDF-1.4',
        ...objetos,
        'trailer\n<< /Size 6 /Root 1 0 R >>',
        '%%EOF',
    ].join('\n');
}

export function generarContenidoXlsx(prestadores: IPrestador[]): string {
    const encabezados = [
        'ID',
        'Nombre',
        'Apellido',
        'Rubro',
        'Matrícula',
        'Experiencia (años)',
        'Garantía',
        'Teléfono',
        'Calificación',
        'Acerca de',
    ];

    const filaEncabezado = `<Row>${encabezados
        .map((col) => `<Cell><Data ss:Type="String">${escaparXml(col)}</Data></Cell>`)
        .join('')}</Row>`;

    const filasDatos = prestadores
        .map((p) => {
            const matricula = p.matricula ?? 'Sin matrícula';
            const garantia = p.ofreceGarantia ? 'Sí' : 'No';
            const telefono = formatearTelefonoPrestador(p.telefono);
            const rating = p.ratingPromedio !== undefined ? p.ratingPromedio.toFixed(1) : '-';

            return [
                '<Row>',
                `<Cell><Data ss:Type="Number">${p.id}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(p.nombre)}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(p.apellido)}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(p.categoriaId)}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(matricula)}</Data></Cell>`,
                `<Cell><Data ss:Type="Number">${p.aniosExperiencia}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(garantia)}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(telefono)}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(rating)}</Data></Cell>`,
                `<Cell><Data ss:Type="String">${escaparXml(p.acercaDe)}</Data></Cell>`,
                '</Row>',
            ].join('');
        })
        .join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<?mso-application progid="Excel.Sheet"?>',
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
        '<Worksheet ss:Name="Catálogo Prestadores">',
        '<Table>',
        filaEncabezado,
        filasDatos,
        '</Table>',
        '</Worksheet>',
        '</Workbook>',
    ].join('\n');
}

export function generarArchivoCatalogo(
    prestadores: IPrestador[],
    formato: FormatoExportacion
): ResultadoArchivoCatalogo {
    if (formato === 'pdf') {
        return {
            contenido: generarContenidoPdf(prestadores),
            mimeType: 'application/pdf',
            nombreArchivo: 'catalogo-prestadores.pdf',
            totalRegistros: prestadores.length,
        };
    }

    return {
        contenido: generarContenidoXlsx(prestadores),
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        nombreArchivo: 'catalogo-prestadores.xlsx',
        totalRegistros: prestadores.length,
    };
}

export function exportarCatalogoPrestadores(
    prestadores: IPrestador[],
    formato: FormatoExportacion
): ResultadoArchivoCatalogo {
    const archivo = generarArchivoCatalogo(prestadores, formato);

    if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function'
    ) {
        const blob = new Blob([archivo.contenido], { type: archivo.mimeType });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo.nombreArchivo;
        enlace.style.display = 'none';
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        if (typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
        }
    }

    return archivo;
}
