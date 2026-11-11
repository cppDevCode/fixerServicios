
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IResena } from '../interfaces/resena.interface';
import { obtenerTodasLasResenas } from './resena.service';

export type FormatoExportacion = 'xlsx' | 'pdf';

interface ResumenValoraciones {
    total: number;
    promedio: number;
}

function calcularResumen(
    resenas: IResena[]
): ResumenValoraciones {
    const total = resenas.length;

    const promedio =
        total === 0
            ? 0
            : Math.round(
                    (resenas.reduce(
                        (suma, resena) =>
                            suma + resena.calificacion,
                        0
                    ) /
                        total) *
                        10
                ) / 10;

    return { total, promedio };
}

function formatearFecha(fecha: string): string {
    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return fecha;
    }

    return fechaConvertida.toLocaleDateString('es-AR');
}

// Generación del Excel

export async function generarExcelValoraciones(
    resenas: IResena[]
): Promise<ExcelJS.Buffer> {
    const libro = new ExcelJS.Workbook();

    const hojaValoraciones = libro.addWorksheet('Valoraciones');

    hojaValoraciones.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Profesional ID', key: 'prestadorId', width: 18 },
        { header: 'Usuario ID', key: 'usuarioId', width: 15 },
        { header: 'Calificación', key: 'calificacion', width: 15 },
        { header: 'Comentario', key: 'comentario', width: 45 },
        { header: 'Fecha', key: 'createdAt', width: 25 },
    ];

    resenas.forEach((resena) => {
        hojaValoraciones.addRow({
            id: resena.id,
            prestadorId: resena.prestadorId,
            usuarioId: resena.usuarioId,
            calificacion: resena.calificacion,
            comentario: resena.comentario,
            createdAt: formatearFecha(resena.createdAt),
        });
    });

    hojaValoraciones.getRow(1).font = { bold: true };
    hojaValoraciones.getRow(1).alignment = {
        vertical: 'middle',
    };

    const hojaResumen = libro.addWorksheet('Resumen');
    const resumen = calcularResumen(resenas);

    hojaResumen.addRow(['Métrica', 'Valor']);
    hojaResumen.addRow([
        'Total de valoraciones',
        resumen.total,
    ]);
    hojaResumen.addRow([
        'Calificación promedio',
        resumen.promedio,
    ]);

    hojaResumen.columns = [
        { width: 28 },
        { width: 18 },
    ];

    hojaResumen.getRow(1).font = { bold: true };

    return libro.xlsx.writeBuffer();
}

// Descarga del Excel

async function descargarExcel(
    resenas: IResena[],
    prestadorId: number
): Promise<void> {
    const contenido = await generarExcelValoraciones(resenas);

    const blob = new Blob(
        [new Uint8Array(contenido)],
        {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download =
        `valoraciones-prestador-${prestadorId}.xlsx`;

    enlace.style.display = 'none';

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generación y descarga del PDF

function descargarPdf(
    resenas: IResena[],
    prestadorId: number
): void {
    const documento = new jsPDF();
    const resumen = calcularResumen(resenas);

    documento.setFontSize(18);
    documento.setTextColor(40, 96, 136);

    documento.text(
        'Fixer - Reporte de valoraciones',
        14,
        20
    );

    documento.setFontSize(11);
    documento.setTextColor(36, 52, 71);

    documento.text(
        `Profesional ID: ${prestadorId}`,
        14,
        32
    );

    documento.text(
        `Total de valoraciones: ${resumen.total}`,
        14,
        39
    );

    documento.text(
        `Calificacion promedio: ${resumen.promedio.toFixed(1)}`,
        14,
        46
    );

    autoTable(documento, {
        startY: 55,

        head: [[
            'Usuario ID',
            'Calificacion',
            'Comentario',
            'Fecha',
        ]],

        body: resenas.map((resena) => [
            String(resena.usuarioId),
            String(resena.calificacion),
            resena.comentario,
            formatearFecha(resena.createdAt),
        ]),

        theme: 'grid',

        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
        },

        headStyles: {
            fillColor: [40, 96, 136],
            textColor: [255, 255, 255],
        },

        margin: {
            left: 14,
            right: 14,
            bottom: 20,
        },

        didDrawPage: () => {
            const pagina =
                documento.getCurrentPageInfo().pageNumber;

            const alto =
                documento.internal.pageSize.getHeight();

            documento.setFontSize(9);
            documento.setTextColor(100, 116, 139);

            documento.text(
                `Pagina ${pagina}`,
                14,
                alto - 10
            );
        },
    });

    documento.save(
        `valoraciones-prestador-${prestadorId}.pdf`
    );
}

// Función principal: exportación según formato

export async function exportarValoraciones(
    prestadorId: number,
    formato: FormatoExportacion
): Promise<number> {
    const resenas =
        await obtenerTodasLasResenas(prestadorId);

    if (resenas.length === 0) {
        throw new Error(
            'No hay valoraciones disponibles para exportar.'
        );
    }

    if (formato === 'xlsx') {
        await descargarExcel(resenas, prestadorId);
    } else {
        descargarPdf(resenas, prestadorId);
    }

    return resenas.length;
}
