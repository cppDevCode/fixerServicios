import ExcelJS from 'exceljs';
import type {
    FormatoExportacion,
    IPrestador,
    ITelefonoPrestador,
} from '../interfaces/prestador.interface';

export interface ResultadoArchivoCatalogo {
    contenido: string | Uint8Array;
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

export async function generarExcelCatalogo(
    prestadores: IPrestador[]
): Promise<ExcelJS.Buffer> {
    const libro = new ExcelJS.Workbook();

    const hojaPrestadores = libro.addWorksheet('Catálogo Prestadores');

    hojaPrestadores.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 18 },
        { header: 'Apellido', key: 'apellido', width: 18 },
        { header: 'Rubro', key: 'rubro', width: 20 },
        { header: 'Matrícula', key: 'matricula', width: 18 },
        { header: 'Experiencia (años)', key: 'experiencia', width: 20 },
        { header: 'Garantía', key: 'garantia', width: 14 },
        { header: 'Teléfono', key: 'telefono', width: 22 },
        { header: 'Calificación', key: 'calificacion', width: 15 },
        { header: 'Acerca de', key: 'acercaDe', width: 45 },
    ];

    prestadores.forEach((p) => {
        hojaPrestadores.addRow({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            rubro: p.categoriaId,
            matricula: p.matricula ?? 'Sin matrícula',
            experiencia: p.aniosExperiencia,
            garantia: p.ofreceGarantia ? 'Sí' : 'No',
            telefono: formatearTelefonoPrestador(p.telefono),
            calificacion:
                p.ratingPromedio !== undefined
                    ? Number(p.ratingPromedio.toFixed(1))
                    : '-',
            acercaDe: p.acercaDe,
        });
    });

    hojaPrestadores.getRow(1).font = { bold: true };
    hojaPrestadores.getRow(1).alignment = {
        vertical: 'middle',
    };

    const hojaResumen = libro.addWorksheet('Resumen');
    const conGarantia = prestadores.filter((p) => p.ofreceGarantia).length;
    const calificados = prestadores.filter(
        (p) => p.ratingPromedio !== undefined
    );
    const promedioGeneral =
        calificados.length === 0
            ? 0
            : Math.round(
                  (calificados.reduce(
                      (acc, p) => acc + (p.ratingPromedio ?? 0),
                      0
                  ) /
                      calificados.length) *
                      10
              ) / 10;

    hojaResumen.addRow(['Métrica', 'Valor']);
    hojaResumen.addRow([
        'Total de prestadores exportados',
        prestadores.length,
    ]);
    hojaResumen.addRow(['Prestadores con garantía', conGarantia]);
    hojaResumen.addRow(['Calificación promedio general', promedioGeneral]);

    hojaResumen.columns = [{ width: 32 }, { width: 18 }];
    hojaResumen.getRow(1).font = { bold: true };

    return libro.xlsx.writeBuffer();
}

export async function generarArchivoCatalogo(
    prestadores: IPrestador[],
    formato: FormatoExportacion
): Promise<ResultadoArchivoCatalogo> {
    if (formato === 'pdf') {
        return {
            contenido: generarContenidoPdf(prestadores),
            mimeType: 'application/pdf',
            nombreArchivo: 'catalogo-prestadores.pdf',
            totalRegistros: prestadores.length,
        };
    }

    const buffer = await generarExcelCatalogo(prestadores);

    return {
        contenido: new Uint8Array(buffer),
        mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        nombreArchivo: 'catalogo-prestadores.xlsx',
        totalRegistros: prestadores.length,
    };
}

export async function exportarCatalogoPrestadores(
    prestadores: IPrestador[],
    formato: FormatoExportacion
): Promise<ResultadoArchivoCatalogo> {
    const archivo = await generarArchivoCatalogo(prestadores, formato);

    if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function'
    ) {
        const blobPart: BlobPart =
            typeof archivo.contenido === 'string'
                ? archivo.contenido
                : new Uint8Array(archivo.contenido);
        const blob = new Blob([blobPart], { type: archivo.mimeType });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = archivo.nombreArchivo;
        enlace.style.display = 'none';
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        if (typeof URL.revokeObjectURL === 'function') {
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }

    return archivo;
}
