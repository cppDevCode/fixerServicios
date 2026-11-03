import { ICategoria } from '../../interfaces/categoria.interface';
import { IPrestador } from '../../interfaces/prestador.interface';

export const crearCategoria = (overrides: Partial<ICategoria> = {}): ICategoria => ({
    id: 'Plomería',
    nombre: 'Plomería',
    ...overrides,
});

export const categoriasFixture: ICategoria[] = [
    crearCategoria({ id: 'Plomería', nombre: 'Plomería' }),
    crearCategoria({ id: 'Electricidad', nombre: 'Electricidad' }),
    crearCategoria({ id: 'Gasista', nombre: 'Gasista' }),
    crearCategoria({ id: 'Pintura', nombre: 'Pintura' }),
];

export const crearDatosPrestador = (
    overrides: Partial<Omit<IPrestador, 'id'>> = {}
): Omit<IPrestador, 'id'> => ({
    nombre: 'Juan',
    apellido: 'Pérez',
    matricula: 'MAT-9001',
    aniosExperiencia: 8,
    acercaDe: 'Especialista en instalaciones sanitarias y plomería general',
    ofreceGarantia: true,
    categoriaId: 'Plomería',
    telefono: {
        codPais: '+54',
        codArea: '11',
        nroTelefono: '45556666',
    },
    ratingPromedio: 4.7,
    ...overrides,
});

export const crearPrestador = (overrides: Partial<IPrestador> = {}): IPrestador => ({
    id: 1,
    ...crearDatosPrestador(overrides),
    ...overrides,
});

export const prestadoresFixture: IPrestador[] = [
    crearPrestador({
        id: 1,
        nombre: 'Carlos',
        apellido: 'Gómez',
        categoriaId: 'Plomería',
        aniosExperiencia: 10,
        ratingPromedio: 4.8,
    }),
    crearPrestador({
        id: 2,
        nombre: 'Lucía',
        apellido: 'Fernández',
        categoriaId: 'Electricidad',
        aniosExperiencia: 6,
        ratingPromedio: 4.6,
    }),
    crearPrestador({
        id: 3,
        nombre: 'Ana',
        apellido: 'López',
        matricula: undefined,
        categoriaId: 'Pintura',
        aniosExperiencia: 4,
        ofreceGarantia: false,
        ratingPromedio: 4.3,
    }),
];
