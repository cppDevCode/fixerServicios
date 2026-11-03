import { IResena } from '../interfaces/resena.interface';

const comentarios = [
    'Excelente trabajo, muy prolijo y puntual.',
    'Cumplió con lo acordado, lo recomiendo.',
    'Buen servicio, aunque tardó más de lo previsto.',
    'Muy amable y profesional.',
    'El resultado final no fue lo esperado.',
    'Precio justo y trabajo de calidad.',
];

const calificaciones = [5, 4, 3, 5, 2, 4];

export const resenasMock: IResena[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    prestadorId: (i % 16) + 1,
    usuarioId: (i % 5) + 1,
    calificacion: calificaciones[i % calificaciones.length],
    comentario: comentarios[i % comentarios.length],
    createdAt: new Date(2026, 0, i + 1).toISOString(),
}));