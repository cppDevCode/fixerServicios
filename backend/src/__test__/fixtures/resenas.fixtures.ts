import { IResena } from '../../interfaces/resena.interface';

export const crearResena = (overrides: Partial<IResena> = {}): IResena => ({
    id: 1,
    prestadorId: 1,
    usuarioId: 1,
    calificacion: 5,
    comentario: 'Excelente trabajo',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
});

export const resenasFixture: IResena[] = [
    crearResena({ id: 1, calificacion: 5 }),
    crearResena({ id: 2, calificacion: 4 }),
    crearResena({ id: 3, calificacion: 3, prestadorId: 2 }),
];