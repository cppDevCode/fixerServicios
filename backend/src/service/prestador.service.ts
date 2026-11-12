import { IFiltrosPrestador } from "../interfaces/filtro.prestador.interface";
import { IPrestador } from "../interfaces/prestador.interface";
import { PrestadorRepository } from "../repository/prestador.repository";

export class PrestadorService {
    
    constructor (private readonly repository = new PrestadorRepository()) {}

    public listar(filtros: IFiltrosPrestador) {
        const page = Math.max(1, filtros.page || 1);
        const limit = Math.max(1, filtros.limit || 10);
        const order = filtros.order === 'desc' ? 'desc' : 'asc';
        const sortBy = filtros.sortBy || 'nombre';

        let resultado = this.repository.findAll();

        // Filtro por rubro (no casesensitive)
        if (filtros.rubro) {
            const rubroBuscado: string = this.normalizarTexto(filtros.rubro);
            resultado = resultado.filter(
                (p) => this.normalizarTexto(p.categoriaId) === rubroBuscado
            );
        }

        // Filtro por localidad (no casesensitive ni tildes)
        if (filtros.localidad) {
            const localidadBuscada: string = this.normalizarTexto(filtros.localidad);
            resultado = resultado.filter(
                (p) => this.normalizarTexto(p.localidad || '') === localidadBuscada
            );
        }

        if (filtros.search) {
            const termino = this.normalizarTexto(filtros.search);
            resultado = resultado.filter(
                (p) => 
                    this.normalizarTexto(p.nombre).includes(termino) ||
                    this.normalizarTexto(p.apellido).includes(termino) ||
                    this.normalizarTexto(p.acercaDe).includes(termino) ||
                    this.normalizarTexto(p.categoriaId).includes(termino)
            );
        }
        resultado.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];

            if (valA === undefined) 
                return 1;
            if (valB === undefined)
                return -1;

            let comparacion = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparacion = valA.localeCompare(valB, 'es', { sensitivity: 'base'});
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparacion = valA - valB;
            } else {
                comparacion = String(valA).localeCompare(String(valB));
            }
            return order === 'desc' ? -comparacion : comparacion;
        });

        const total = resultado.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const offset = (page - 1) * limit;
        const datos = resultado.slice(offset, offset + limit);

        return {
            datos,
            meta: {
                pagina: page,
                limit,
                total,
                totalPages
            }
        };
    }

    public obtenerPorId(id: number): IPrestador | undefined {
        return this.repository.findById(id);
    }

    public crear (datos: Omit<IPrestador, 'id'>): IPrestador {
        return this.repository.create(datos);
    }

    public actualizar(id: number, datos: Partial<Omit<IPrestador, 'id'>>): IPrestador | null {
        return this.repository.update(id, datos);
    }

    public eliminar(id:number): boolean {
        return this.repository.delete(id);
    }

    private normalizarTexto(texto: string): string {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }
} 
