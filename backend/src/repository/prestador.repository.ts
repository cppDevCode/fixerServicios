import { IPrestador } from "../interfaces/prestador.interface";

const MOCK_PRESTADORES: IPrestador[] = [
    { id: 1, nombre: 'Carlos', apellido: 'Gómez', matricula: 'MAT-1001', aniosExperiencia: 10, acercaDe: 'Especialista en cañerías y filtraciones urgentes', ofreceGarantia: true, categoriaId: 'Plomería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001001' }, ratingPromedio: 4.8 },
    { id: 2, nombre: 'Lucía', apellido: 'Fernández', matricula: 'MAT-1002', aniosExperiencia: 6, acercaDe: 'Instalaciones eléctricas domiciliarias e industriales', ofreceGarantia: true, categoriaId: 'Electricidad', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001002' }, ratingPromedio: 4.6 },
    { id: 3, nombre: 'Martín', apellido: 'Rodríguez', matricula: 'MAT-1003', aniosExperiencia: 12, acercaDe: 'Gasista matriculado, planos e instalaciones', ofreceGarantia: true, categoriaId: 'Gasista', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001003' }, ratingPromedio: 4.9 },
    { id: 4, nombre: 'Ana', apellido: 'López', aniosExperiencia: 4, acercaDe: 'Pintura interior, exterior y revestimientos plásticos', ofreceGarantia: false, categoriaId: 'Pintura', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001004' }, ratingPromedio: 4.3 },
    { id: 5, nombre: 'Jorge', apellido: 'Martínez', matricula: 'MAT-1005', aniosExperiencia: 15, acercaDe: 'Plomería integral, termotanques y bombas presurizadoras', ofreceGarantia: true, categoriaId: 'Plomería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001005' }, ratingPromedio: 5.0 },
    { id: 6, nombre: 'Sofía', apellido: 'Pérez', aniosExperiencia: 8, acercaDe: 'Muebles a medida y restauración en madera', ofreceGarantia: true, categoriaId: 'Carpintería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001006' }, ratingPromedio: 4.7 },
    { id: 7, nombre: 'Diego', apellido: 'Sánchez', matricula: 'MAT-1007', aniosExperiencia: 5, acercaDe: 'Destapaciones y reparación de pérdidas de agua', ofreceGarantia: true, categoriaId: 'Plomería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001007' }, ratingPromedio: 4.2 },
    { id: 8, nombre: 'Valentina', apellido: 'Romero', matricula: 'MAT-1008', aniosExperiencia: 9, acercaDe: 'Tableros eléctricos, disyuntores y cableado completo', ofreceGarantia: true, categoriaId: 'Electricidad', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001008' }, ratingPromedio: 4.8 },
    { id: 9, nombre: 'Miguel', apellido: 'Torres', aniosExperiencia: 20, acercaDe: 'Albañilería general, refacciones y techos', ofreceGarantia: true, categoriaId: 'Albañilería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001009' }, ratingPromedio: 4.5 },
    { id: 10, nombre: 'Camila', apellido: 'Díaz', aniosExperiencia: 3, acercaDe: 'Mantenimiento de jardines, poda y riego automático', ofreceGarantia: false, categoriaId: 'Jardinería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001010' }, ratingPromedio: 4.1 },
    { id: 11, nombre: 'Ricardo', apellido: 'Ruiz', matricula: 'MAT-1011', aniosExperiencia: 11, acercaDe: 'Cerrajería 24hs, apertura de puertas y cambio de combinación', ofreceGarantia: true, categoriaId: 'Cerrajería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001011' }, ratingPromedio: 4.6 },
    { id: 12, nombre: 'Paula', apellido: 'Flores', matricula: 'MAT-1012', aniosExperiencia: 7, acercaDe: 'Instalación y service de aire acondicionado split', ofreceGarantia: true, categoriaId: 'Refrigeración', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001012' }, ratingPromedio: 4.9 },
    { id: 13, nombre: 'Fernando', apellido: 'Acosta', matricula: 'MAT-1013', aniosExperiencia: 14, acercaDe: 'Plomero y gasista, remodelación de baños y cocinas', ofreceGarantia: true, categoriaId: 'Plomería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001013' }, ratingPromedio: 4.7 },
    { id: 14, nombre: 'Elena', apellido: 'Morales', aniosExperiencia: 6, acercaDe: 'Impermeabilización de terrazas y pintura de frentes', ofreceGarantia: true, categoriaId: 'Pintura', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001014' }, ratingPromedio: 4.4 },
    { id: 15, nombre: 'Roberto', apellido: 'Silva', matricula: 'MAT-1015', aniosExperiencia: 18, acercaDe: 'Instalaciones sanitarias, cloacales y pluviales', ofreceGarantia: true, categoriaId: 'Plomería', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001015' }, ratingPromedio: 4.8 },
    { id: 16, nombre: 'Gabriela', apellido: 'Castro', matricula: 'MAT-1016', aniosExperiencia: 8, acercaDe: 'Iluminación LED, automatización y urgencias eléctricas', ofreceGarantia: true, categoriaId: 'Electricidad', telefono: { codPais: '+54', codArea: '11', nroTelefono: '40001016' }, ratingPromedio: 4.5 }
];

export class PrestadorRepository {
     private prestadores: IPrestador[] = [...MOCK_PRESTADORES];

     findAll(): IPrestador[] {
         return [...this.prestadores];
     }

     findById(id: number): IPrestador | undefined {
         return this.prestadores.find((p) => p.id === id);
     }

     create(datos: Omit<IPrestador, 'id'>): IPrestador {
         const nuevoId: number = (
             this.prestadores.reduce((max: number, p: IPrestador) => Math.max(max, p.id || 0), 0) + 1);
         const nuevoPrestador: IPrestador = {
             id: nuevoId,
             ...datos
         };

         this.prestadores.push(nuevoPrestador);
         return nuevoPrestador;
     }

     update(id: number, datos: Partial<Omit<IPrestador, 'id'>>): IPrestador | null {
         const index:number = this.prestadores.findIndex((p) => p.id === id);
         if (index === -1)
             return null;

         this.prestadores[index] = {
             ...this.prestadores[index],
             ...datos,
             id
         };

         return this.prestadores[index];
     }

     delete(id: number): boolean {
         const index: number = this.prestadores.findIndex((p) => p.id === id);
         if (index === -1)
             return false;

         this.prestadores.splice(index, 1);
         return true;
     }
}
