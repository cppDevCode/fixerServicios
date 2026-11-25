import { ICategoria } from '../../interfaces/categoria.interface';
import { IPrestador, IPrestadorEntidad } from '../../interfaces/prestador.interface';

export const crearCategoria = (
    overrides: Partial<ICategoria> = {}
): ICategoria => ({
    id: 1,
    slug: 'plomeria',
    nombre: 'Plomería',
    ...overrides,
});

export const categoriasFixture: ICategoria[] = [
    crearCategoria({ id: 1, slug: 'plomeria', nombre: 'Plomería' }),
    crearCategoria({ id: 2, slug: 'electricidad', nombre: 'Electricidad' }),
    crearCategoria({ id: 3, slug: 'gasista', nombre: 'Gasista' }),
    crearCategoria({ id: 4, slug: 'pintura', nombre: 'Pintura' }),
];

export const crearDatosPrestador = (
    overrides: Partial<Omit<IPrestadorEntidad, 'id'>> = {}
): Omit<IPrestadorEntidad, 'id'> => ({
    nombre: 'Juan',
    apellido: 'Pérez',
    matricula: 'MAT-9001',
    aniosExperiencia: 8,
    acercaDe: 'Especialista en instalaciones sanitarias y plomería general',
    ofreceGarantia: true,
    categoriaId: 1,
    ubicacionId: 1,
    telefono: {
        codPais: '+54',
        codArea: '11',
        nroTelefono: '45556666',
    },
    fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    ...overrides,
});

export const crearPrestador = (
    overrides: Partial<IPrestador> = {}
): IPrestador => ({
    id: 1,
    ...crearDatosPrestador(overrides),
    categoriaNombre: 'Plomería',
    provincia: 'Córdoba',
    localidad: 'Córdoba Capital',
    codigoPostal: '5000',
    radio: 10,
    ratingPromedio: 4.7,
    ...overrides,
});

export const prestadoresFixture: IPrestador[] = [
    crearPrestador({
        id: 1,
        nombre: 'Carlos',
        apellido: 'Gómez',
        categoriaId: 1,
        categoriaNombre: 'Plomería',
        aniosExperiencia: 10,
        ratingPromedio: 3.5,
        fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    }),
    crearPrestador({
        id: 2,
        nombre: 'Lucía',
        apellido: 'Fernández',
        categoriaId: 2,
        categoriaNombre: 'Electricidad',
        aniosExperiencia: 6,
        ratingPromedio: 4.0,
        fotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    }),
    crearPrestador({
        id: 3,
        nombre: 'Ana',
        apellido: 'López',
        matricula: undefined,
        categoriaId: 4,
        categoriaNombre: 'Pintura',
        aniosExperiencia: 4,
        ofreceGarantia: false,
        ratingPromedio: 4.5,
        fotoUrl: undefined,
    }),
];
