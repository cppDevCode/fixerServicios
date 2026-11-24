import { IPrestadorEntidad } from '../interfaces/prestador.interface';

/**
 * Datos iniciales normalizados (3FN):
 * - categoriaId referencia a CATEGORIA.id (1=Plomería, 2=Electricidad, 3=Gasista,
 *   4=Pintura, 5=Carpintería, 6=Albañilería, 7=Jardinería, 8=Cerrajería, 9=Refrigeración).
 * - ubicacionId referencia a UBICACION.id (1=Córdoba Capital, 2=La Plata, 3=Rosario,
 *   4=CABA, 5=Mendoza, 6=9 de Julio).
 * - ratingPromedio NO se persiste aquí: se deriva dinámicamente desde RESENA.
 */
const MOCK_PRESTADORES: IPrestadorEntidad[] = [
    { id: 1, nombre: 'Carlos', apellido: 'Gómez', fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg', matricula: 'MAT-1001', aniosExperiencia: 10, acercaDe: 'Especialista en cañerías y filtraciones urgentes', ofreceGarantia: true, categoriaId: 1, ubicacionId: 1, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001001' } },
    { id: 2, nombre: 'Lucía', apellido: 'Fernández', fotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg', matricula: 'MAT-1002', aniosExperiencia: 6, acercaDe: 'Instalaciones eléctricas domiciliarias e industriales', ofreceGarantia: true, categoriaId: 2, ubicacionId: 2, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001002' } },
    { id: 3, nombre: 'Martín', apellido: 'Rodríguez', fotoUrl: 'https://randomuser.me/api/portraits/men/45.jpg', matricula: 'MAT-1003', aniosExperiencia: 12, acercaDe: 'Gasista matriculado, planos e instalaciones', ofreceGarantia: true, categoriaId: 3, ubicacionId: 3, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001003' } },
    { id: 4, nombre: 'Ana', apellido: 'López', aniosExperiencia: 4, acercaDe: 'Pintura interior, exterior y revestimientos plásticos', ofreceGarantia: false, categoriaId: 4, ubicacionId: 1, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001004' } },
    { id: 5, nombre: 'Jorge', apellido: 'Martínez', fotoUrl: 'https://randomuser.me/api/portraits/men/52.jpg', matricula: 'MAT-1005', aniosExperiencia: 15, acercaDe: 'Plomería integral, termotanques y bombas presurizadoras', ofreceGarantia: true, categoriaId: 1, ubicacionId: 4, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001005' } },
    { id: 6, nombre: 'Sofía', apellido: 'Pérez', fotoUrl: 'https://randomuser.me/api/portraits/women/68.jpg', aniosExperiencia: 8, acercaDe: 'Muebles a medida y restauración en madera', ofreceGarantia: true, categoriaId: 5, ubicacionId: 5, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001006' } },
    { id: 7, nombre: 'Diego', apellido: 'Sánchez', fotoUrl: 'https://randomuser.me/api/portraits/men/22.jpg', matricula: 'MAT-1007', aniosExperiencia: 5, acercaDe: 'Destapaciones y reparación de pérdidas de agua', ofreceGarantia: true, categoriaId: 1, ubicacionId: 6, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001007' } },
    { id: 8, nombre: 'Valentina', apellido: 'Romero', fotoUrl: 'https://randomuser.me/api/portraits/women/33.jpg', matricula: 'MAT-1008', aniosExperiencia: 9, acercaDe: 'Tableros eléctricos, disyuntores y cableado completo', ofreceGarantia: true, categoriaId: 2, ubicacionId: 3, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001008' } },
    { id: 9, nombre: 'Miguel', apellido: 'Torres', fotoUrl: 'https://randomuser.me/api/portraits/men/61.jpg', aniosExperiencia: 20, acercaDe: 'Albañilería general, refacciones y techos', ofreceGarantia: true, categoriaId: 6, ubicacionId: 4, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001009' } },
    { id: 10, nombre: 'Camila', apellido: 'Díaz', aniosExperiencia: 3, acercaDe: 'Mantenimiento de jardines, poda y riego automático', ofreceGarantia: false, categoriaId: 7, ubicacionId: 1, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001010' } },
    { id: 11, nombre: 'Ricardo', apellido: 'Ruiz', fotoUrl: 'https://randomuser.me/api/portraits/men/75.jpg', matricula: 'MAT-1011', aniosExperiencia: 11, acercaDe: 'Cerrajería 24hs, apertura de puertas y cambio de combinación', ofreceGarantia: true, categoriaId: 8, ubicacionId: 5, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001011' } },
    { id: 12, nombre: 'Paula', apellido: 'Flores', fotoUrl: 'https://randomuser.me/api/portraits/women/26.jpg', matricula: 'MAT-1012', aniosExperiencia: 7, acercaDe: 'Instalación y service de aire acondicionado split', ofreceGarantia: true, categoriaId: 9, ubicacionId: 2, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001012' } },
    { id: 13, nombre: 'Fernando', apellido: 'Acosta', fotoUrl: 'https://randomuser.me/api/portraits/men/83.jpg', matricula: 'MAT-1013', aniosExperiencia: 14, acercaDe: 'Plomero y gasista, remodelación de baños y cocinas', ofreceGarantia: true, categoriaId: 1, ubicacionId: 3, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001013' } },
    { id: 14, nombre: 'Elena', apellido: 'Morales', fotoUrl: 'https://randomuser.me/api/portraits/women/55.jpg', aniosExperiencia: 6, acercaDe: 'Impermeabilización de terrazas y pintura de frentes', ofreceGarantia: true, categoriaId: 4, ubicacionId: 4, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001014' } },
    { id: 15, nombre: 'Roberto', apellido: 'Silva', fotoUrl: 'https://randomuser.me/api/portraits/men/18.jpg', matricula: 'MAT-1015', aniosExperiencia: 18, acercaDe: 'Instalaciones sanitarias, cloacales y pluviales', ofreceGarantia: true, categoriaId: 1, ubicacionId: 1, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001015' } },
    { id: 16, nombre: 'Gabriela', apellido: 'Castro', fotoUrl: 'https://randomuser.me/api/portraits/women/12.jpg', matricula: 'MAT-1016', aniosExperiencia: 8, acercaDe: 'Iluminación LED, automatización y urgencias eléctricas', ofreceGarantia: true, categoriaId: 2, ubicacionId: 5, telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001016' } },
];

export class PrestadorRepository {
    private prestadores: IPrestadorEntidad[] = MOCK_PRESTADORES.map((p) => ({
        ...p,
        telefono: { ...p.telefono },
    }));

    findAll(): IPrestadorEntidad[] {
        return this.prestadores.map((p) => ({
            ...p,
            telefono: { ...p.telefono },
        }));
    }

    findById(id: number): IPrestadorEntidad | undefined {
        const encontrado = this.prestadores.find((p) => p.id === id);
        return encontrado
            ? { ...encontrado, telefono: { ...encontrado.telefono } }
            : undefined;
    }

    existsByCategoriaId(categoriaId: number): boolean {
        return this.prestadores.some((p) => p.categoriaId === categoriaId);
    }

    create(datos: Omit<IPrestadorEntidad, 'id'>): IPrestadorEntidad {
        const nuevoId =
            this.prestadores.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
        const fotoNormalizada =
            typeof datos.fotoUrl === 'string' && datos.fotoUrl.trim() !== ''
                ? datos.fotoUrl.trim()
                : undefined;

        const nuevoPrestador: IPrestadorEntidad = {
            id: nuevoId,
            nombre: datos.nombre,
            apellido: datos.apellido,
            fotoUrl: fotoNormalizada,
            matricula: datos.matricula,
            aniosExperiencia: datos.aniosExperiencia,
            acercaDe: datos.acercaDe,
            ofreceGarantia: datos.ofreceGarantia,
            categoriaId: datos.categoriaId,
            ubicacionId: datos.ubicacionId,
            telefono: { ...datos.telefono },
        };

        this.prestadores.push(nuevoPrestador);
        return { ...nuevoPrestador, telefono: { ...nuevoPrestador.telefono } };
    }

    update(
        id: number,
        datos: Partial<Omit<IPrestadorEntidad, 'id'>>
    ): IPrestadorEntidad | null {
        const index = this.prestadores.findIndex((p) => p.id === id);
        if (index === -1) return null;

        const actual = this.prestadores[index];
        const tieneCampoFoto = Object.prototype.hasOwnProperty.call(datos, 'fotoUrl');
        const fotoActualizada = tieneCampoFoto
            ? typeof datos.fotoUrl === 'string' && datos.fotoUrl.trim() !== ''
                ? datos.fotoUrl.trim()
                : undefined
            : actual.fotoUrl;

        const actualizado: IPrestadorEntidad = {
            id,
            nombre: datos.nombre ?? actual.nombre,
            apellido: datos.apellido ?? actual.apellido,
            fotoUrl: fotoActualizada,
            matricula: Object.prototype.hasOwnProperty.call(datos, 'matricula')
                ? datos.matricula
                : actual.matricula,
            aniosExperiencia: datos.aniosExperiencia ?? actual.aniosExperiencia,
            acercaDe: datos.acercaDe ?? actual.acercaDe,
            ofreceGarantia: datos.ofreceGarantia ?? actual.ofreceGarantia,
            categoriaId: datos.categoriaId ?? actual.categoriaId,
            ubicacionId: Object.prototype.hasOwnProperty.call(datos, 'ubicacionId')
                ? datos.ubicacionId
                : actual.ubicacionId,
            telefono: datos.telefono ? { ...datos.telefono } : { ...actual.telefono },
        };

        this.prestadores[index] = actualizado;
        return { ...actualizado, telefono: { ...actualizado.telefono } };
    }

    delete(id: number): boolean {
        const index = this.prestadores.findIndex((p) => p.id === id);
        if (index === -1) return false;

        this.prestadores.splice(index, 1);
        return true;
    }
}

export const prestadorRepositorySingleton = new PrestadorRepository();
