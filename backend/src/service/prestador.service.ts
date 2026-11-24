import { IFiltrosPrestador } from '../interfaces/filtro.prestador.interface';
import { IPrestador, IPrestadorEntidad } from '../interfaces/prestador.interface';
import {
    CategoriaRepository,
    categoriaRepositorySingleton,
} from '../repository/categoria.repository';
import {
    PrestadorRepository,
    prestadorRepositorySingleton,
} from '../repository/prestador.repository';
import {
    ResenaRepository,
    resenaRepositorySingleton,
} from '../repository/resena.repository';
import {
    UbicacionRepository,
    ubicacionRepositorySingleton,
} from '../repository/ubicacion.repository';

export class ErrorValidacionPrestador extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ErrorValidacionPrestador';
    }
}

export type DatosCrearPrestador = Omit<
    IPrestador,
    'id' | 'categoriaId' | 'categoriaNombre' | 'ratingPromedio'
> & {
    categoriaId: number | string;
    ratingPromedio?: number;
};

export type DatosActualizarPrestador = Partial<
    Omit<IPrestador, 'id' | 'categoriaId' | 'categoriaNombre'>
> & {
    categoriaId?: number | string;
};

export class PrestadorService {
    constructor(
        private readonly repository: PrestadorRepository = prestadorRepositorySingleton,
        private readonly categoriaRepo: CategoriaRepository = categoriaRepositorySingleton,
        private readonly ubicacionRepo: UbicacionRepository = ubicacionRepositorySingleton,
        private readonly resenaRepo: ResenaRepository = resenaRepositorySingleton
    ) {}

    public listar(filtros: IFiltrosPrestador) {
        const page = Math.max(1, filtros.page || 1);
        const limit = Math.max(1, filtros.limit || 10);
        const order = filtros.order === 'desc' ? 'desc' : 'asc';
        const sortBy = filtros.sortBy || 'nombre';

        let resultado = this.repository
            .findAll()
            .map((entidad) => this.enriquecerPrestador(entidad));

        // Filtro por rubro: acepta ID numérico, slug o nombre (insensible a tildes y mayúsculas)
        if (filtros.rubro) {
            const rubroBuscado = this.normalizarTexto(filtros.rubro);
            const categoriaResuelta = this.categoriaRepo.resolverPorReferencia(
                filtros.rubro
            );

            resultado = resultado.filter((p) => {
                if (categoriaResuelta && p.categoriaId === categoriaResuelta.id) {
                    return true;
                }
                return (
                    String(p.categoriaId) === rubroBuscado ||
                    this.normalizarTexto(p.categoriaNombre || '') === rubroBuscado
                );
            });
        }

        // Filtro por provincia (insensible a tildes y mayúsculas)
        if (filtros.provincia) {
            const provinciaBuscada = this.normalizarTexto(filtros.provincia);
            resultado = resultado.filter(
                (p) =>
                    this.normalizarTexto(p.provincia || '') === provinciaBuscada
            );
        }

        // Filtro por localidad (insensible a tildes y mayúsculas)
        if (filtros.localidad) {
            const localidadBuscada = this.normalizarTexto(filtros.localidad);
            resultado = resultado.filter(
                (p) =>
                    this.normalizarTexto(p.localidad || '') === localidadBuscada
            );
        }

        if (filtros.search) {
            const termino = this.normalizarTexto(filtros.search);
            resultado = resultado.filter(
                (p) =>
                    this.normalizarTexto(p.nombre).includes(termino) ||
                    this.normalizarTexto(p.apellido).includes(termino) ||
                    this.normalizarTexto(`${p.nombre} ${p.apellido}`).includes(
                        termino
                    ) ||
                    this.normalizarTexto(p.acercaDe).includes(termino) ||
                    this.normalizarTexto(p.categoriaNombre || '').includes(
                        termino
                    ) ||
                    this.normalizarTexto(p.localidad || '').includes(termino)
            );
        }

        resultado.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];

            if (valA === undefined) return 1;
            if (valB === undefined) return -1;

            let comparacion = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparacion = valA.localeCompare(valB, 'es', {
                    sensitivity: 'base',
                });
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
                totalPages,
            },
        };
    }

    public obtenerPorId(id: number): IPrestador | undefined {
        const entidad = this.repository.findById(id);
        return entidad ? this.enriquecerPrestador(entidad) : undefined;
    }

    public crear(datos: DatosCrearPrestador): IPrestador {
        const categoria = this.categoriaRepo.resolverPorReferencia(
            datos.categoriaId
        );
        if (!categoria) {
            throw new ErrorValidacionPrestador(
                `La categoría '${datos.categoriaId}' no existe`
            );
        }

        const ubicacionId = this.resolverUbicacionId({
            ubicacionId: datos.ubicacionId,
            provincia: datos.provincia,
            localidad: datos.localidad,
            codigoPostal: datos.codigoPostal,
            radio: datos.radio,
        });

        // ratingPromedio no se persiste: es un atributo derivado desde RESENA
        const entidadCreada = this.repository.create({
            nombre: datos.nombre,
            apellido: datos.apellido,
            fotoUrl: datos.fotoUrl,
            matricula: datos.matricula,
            aniosExperiencia: datos.aniosExperiencia,
            acercaDe: datos.acercaDe,
            ofreceGarantia: datos.ofreceGarantia,
            categoriaId: categoria.id,
            ubicacionId,
            telefono: datos.telefono,
        });

        return this.enriquecerPrestador(entidadCreada);
    }

    public actualizar(
        id: number,
        datos: DatosActualizarPrestador
    ): IPrestador | null {
        const actual = this.repository.findById(id);
        if (!actual) return null;

        let categoriaIdResuelta: number | undefined;
        if (datos.categoriaId !== undefined) {
            const categoria = this.categoriaRepo.resolverPorReferencia(
                datos.categoriaId
            );
            if (!categoria) {
                throw new ErrorValidacionPrestador(
                    `La categoría '${datos.categoriaId}' no existe`
                );
            }
            categoriaIdResuelta = categoria.id;
        }

        const tieneCambioUbicacion =
            datos.ubicacionId !== undefined ||
            datos.provincia !== undefined ||
            datos.localidad !== undefined ||
            datos.codigoPostal !== undefined ||
            datos.radio !== undefined;

        let ubicacionIdResuelta = actual.ubicacionId;
        if (tieneCambioUbicacion) {
            const ubicacionActual = actual.ubicacionId
                ? this.ubicacionRepo.findById(actual.ubicacionId)
                : undefined;

            ubicacionIdResuelta = this.resolverUbicacionId({
                ubicacionId: datos.ubicacionId,
                provincia: datos.provincia ?? ubicacionActual?.provincia,
                localidad: datos.localidad ?? ubicacionActual?.localidad,
                codigoPostal:
                    datos.codigoPostal ?? ubicacionActual?.codigoPostal,
                radio: datos.radio ?? ubicacionActual?.radio,
            });
        }

        const patch: Partial<Omit<IPrestadorEntidad, 'id'>> = {
            ...(datos.nombre !== undefined ? { nombre: datos.nombre } : {}),
            ...(datos.apellido !== undefined ? { apellido: datos.apellido } : {}),
            ...(Object.prototype.hasOwnProperty.call(datos, 'fotoUrl')
                ? { fotoUrl: datos.fotoUrl }
                : {}),
            ...(Object.prototype.hasOwnProperty.call(datos, 'matricula')
                ? { matricula: datos.matricula }
                : {}),
            ...(datos.aniosExperiencia !== undefined
                ? { aniosExperiencia: datos.aniosExperiencia }
                : {}),
            ...(datos.acercaDe !== undefined ? { acercaDe: datos.acercaDe } : {}),
            ...(datos.ofreceGarantia !== undefined
                ? { ofreceGarantia: datos.ofreceGarantia }
                : {}),
            ...(categoriaIdResuelta !== undefined
                ? { categoriaId: categoriaIdResuelta }
                : {}),
            ...(tieneCambioUbicacion ? { ubicacionId: ubicacionIdResuelta } : {}),
            ...(datos.telefono !== undefined ? { telefono: datos.telefono } : {}),
        };

        const actualizada = this.repository.update(id, patch);
        return actualizada ? this.enriquecerPrestador(actualizada) : null;
    }

    public eliminar(id: number): boolean {
        const eliminado = this.repository.delete(id);
        if (eliminado) {
            // Integridad referencial ON DELETE CASCADE hacia RESENA
            this.resenaRepo.deleteByPrestadorId(id);
        }
        return eliminado;
    }

    private resolverUbicacionId(datos: {
        ubicacionId?: number;
        provincia?: string;
        localidad?: string;
        codigoPostal?: string;
        radio?: number;
    }): number | undefined {
        if (datos.ubicacionId !== undefined) {
            const existente = this.ubicacionRepo.findById(datos.ubicacionId);
            if (!existente) {
                throw new ErrorValidacionPrestador(
                    `La ubicación con id ${datos.ubicacionId} no existe`
                );
            }
            return existente.id;
        }

        const tieneDatosGeo = Boolean(
            (datos.provincia && datos.provincia.trim() !== '') ||
                (datos.localidad && datos.localidad.trim() !== '') ||
                (datos.codigoPostal && datos.codigoPostal.trim() !== '') ||
                (datos.radio !== undefined &&
                    Number.isFinite(datos.radio) &&
                    datos.radio > 0)
        );

        if (!tieneDatosGeo) {
            return undefined;
        }

        const ubicacion = this.ubicacionRepo.findOrCreate({
            provincia: datos.provincia,
            localidad: datos.localidad,
            codigoPostal: datos.codigoPostal,
            radio: datos.radio,
        });
        return ubicacion.id;
    }

    private enriquecerPrestador(entidad: IPrestadorEntidad): IPrestador {
        const categoria = this.categoriaRepo.findById(entidad.categoriaId);
        const ubicacion =
            entidad.ubicacionId !== undefined
                ? this.ubicacionRepo.findById(entidad.ubicacionId)
                : undefined;
        const resenas = this.resenaRepo.findByPrestadorId(entidad.id);
        const ratingPromedio = this.calcularPromedioResenas(resenas);

        return {
            ...entidad,
            categoriaNombre: categoria?.nombre,
            provincia: ubicacion?.provincia,
            localidad: ubicacion?.localidad,
            codigoPostal: ubicacion?.codigoPostal,
            radio: ubicacion?.radio,
            ...(ratingPromedio !== undefined ? { ratingPromedio } : {}),
        };
    }

    private calcularPromedioResenas(
        resenas: { calificacion: number }[]
    ): number | undefined {
        if (resenas.length === 0) return undefined;
        const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
        return Math.round((suma / resenas.length) * 10) / 10;
    }

    private normalizarTexto(texto: string): string {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }
}
