
import ExcelJS from 'exceljs';
import type { IResena } from '../interfaces/resena.interface';
import { obtenerTodasLasResenas } from './resena.service';


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
        hojaValoraciones.addRow(resena);
    });

    hojaValoraciones.getRow(1).font = { bold: true };
    hojaValoraciones.getRow(1).alignment = {
        vertical: 'middle',
    };

    const hojaResumen = libro.addWorksheet('Resumen');

    const total = resenas.length;
    const promedio = total === 0
        ? 0
        : Math.round(
            (resenas.reduce(
                (suma, resena) => suma + resena.calificacion,
                0
            ) / total) * 10
        ) / 10;

    hojaResumen.addRow(['Métrica', 'Valor']);
    hojaResumen.addRow(['Total de valoraciones', total]);
    hojaResumen.addRow(['Calificación promedio', promedio]);

    hojaResumen.columns = [
        { width: 28 },
        { width: 18 },
    ];

    hojaResumen.getRow(1).font = { bold: true };

    return libro.xlsx.writeBuffer();
}


export async function exportarValoraciones(
    prestadorId: number
): Promise<number> {
    const resenas = await obtenerTodasLasResenas(prestadorId);

    if (resenas.length === 0) {
        throw new Error(
            'No hay valoraciones disponibles para exportar.'
        );
    }

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
    enlace.download = `valoraciones-prestador-${prestadorId}.xlsx`;
    enlace.style.display = 'none';

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);

    return resenas.length;
}
