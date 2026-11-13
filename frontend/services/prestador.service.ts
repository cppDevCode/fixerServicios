import type {
    IActualizarPrestador,
    ICategoria,
    ICrearPrestador,
    IFiltrosPrestador,
    IPrestador,
    RespuestaApi,
} from '../interfaces/prestador.interface';

export const API_BASE_URL = '/api/v1';

export const CATEGORIAS_POR_DEFECTO: ICategoria[] = [
    { id: 'Albañilería', nombre: 'Albañilería' },
    { id: 'Carpintería', nombre: 'Carpintería' },
    { id: 'Cerrajería', nombre: 'Cerrajería' },
    { id: 'Electricidad', nombre: 'Electricidad' },
    { id: 'Gasista', nombre: 'Gasista' },
    { id: 'Jardinería', nombre: 'Jardinería' },
    { id: 'Pintura', nombre: 'Pintura' },
    { id: 'Plomería', nombre: 'Plomería' },
    { id: 'Refrigeración', nombre: 'Refrigeración' },
];

export const LOCALIDADES_POR_DEFECTO: string[] = [
    'CABA',
    'Córdoba Capital',
    'La Plata',
    'Mendoza',
    'Rosario',
];

export function construirQueryPrestadores(filtros: IFiltrosPrestador = {}): string {
    const parametros = new URLSearchParams();

    if (filtros.page !== undefined) {
        parametros.set('page', String(filtros.page));
    }
    if (filtros.limit !== undefined) {
        parametros.set('limit', String(filtros.limit));
    }
    if (filtros.rubro && filtros.rubro.trim() !== '') {
        parametros.set('rubro', filtros.rubro.trim());
    }
    if (filtros.provincia && filtros.provincia.trim() !== '') {
        parametros.set('provincia', filtros.provincia.trim());
    }
    if (filtros.localidad && filtros.localidad.trim() !== '') {
        parametros.set('localidad', filtros.localidad.trim());
    }
    if (filtros.search && filtros.search.trim() !== '') {
        parametros.set('search', filtros.search.trim());
    }
    if (filtros.sortBy) {
        parametros.set('sortBy', String(filtros.sortBy));
    }
    if (filtros.order) {
        parametros.set('order', filtros.order);
    }

    return parametros.toString();
}

export async function obtenerPrestadores(
    filtros: IFiltrosPrestador = {},
    baseUrl: string = API_BASE_URL
): Promise<RespuestaApi<IPrestador[]>> {
    const query = construirQueryPrestadores(filtros);
    const url = query ? `${baseUrl}/prestadores?${query}` : `${baseUrl}/prestadores`;

    const respuesta = await fetch(url);
    const resultado = (await respuesta.json()) as RespuestaApi<IPrestador[]>;

    if (!respuesta.ok) {
        throw new Error(resultado.msj || 'No se pudieron cargar los prestadores');
    }

    return resultado;
}

export async function obtenerPrestadorPorId(
    id: number,
    baseUrl: string = API_BASE_URL
): Promise<RespuestaApi<IPrestador>> {
    const respuesta = await fetch(`${baseUrl}/prestadores/${id}`);
    const resultado = (await respuesta.json()) as RespuestaApi<IPrestador>;

    if (!respuesta.ok) {
        throw new Error(resultado.msj || `No se encontró el prestador con ID ${id}`);
    }

    return resultado;
}

export async function crearPrestador(
    datos: ICrearPrestador,
    baseUrl: string = API_BASE_URL
): Promise<RespuestaApi<IPrestador>> {
    const respuesta = await fetch(`${baseUrl}/prestadores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
    });

    const resultado = (await respuesta.json()) as RespuestaApi<IPrestador>;

    if (!respuesta.ok) {
        throw new Error(resultado.msj || 'No se pudo crear el prestador');
    }

    return resultado;
}

export async function actualizarPrestador(
    id: number,
    datos: IActualizarPrestador,
    baseUrl: string = API_BASE_URL
): Promise<RespuestaApi<IPrestador>> {
    const respuesta = await fetch(`${baseUrl}/prestadores/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
    });

    const resultado = (await respuesta.json()) as RespuestaApi<IPrestador>;

    if (!respuesta.ok) {
        throw new Error(resultado.msj || 'No se pudo actualizar el prestador');
    }

    return resultado;
}

export async function eliminarPrestador(
    id: number,
    baseUrl: string = API_BASE_URL
): Promise<RespuestaApi<null>> {
    const respuesta = await fetch(`${baseUrl}/prestadores/${id}`, {
        method: 'DELETE',
    });

    const resultado = (await respuesta.json()) as RespuestaApi<null>;

    if (!respuesta.ok) {
        throw new Error(resultado.msj || 'No se pudo eliminar el prestador');
    }

    return resultado;
}

export async function obtenerCategorias(
    search?: string,
    baseUrl: string = API_BASE_URL
): Promise<RespuestaApi<ICategoria[]>> {
    const query =
        search && search.trim() !== ''
            ? `?search=${encodeURIComponent(search.trim())}`
            : '';
    const respuesta = await fetch(`${baseUrl}/categorias${query}`);
    const resultado = (await respuesta.json()) as RespuestaApi<ICategoria[]>;

    if (!respuesta.ok) {
        throw new Error(resultado.msj || 'No se pudieron cargar las categorías');
    }

    return resultado;
}
