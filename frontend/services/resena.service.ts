
import type { IResena, ICrearResena, RespuestaApi, } from '../interfaces/resena.interface';

const API_URL = '/api/v1/resenas';

export async function obtenerResenas(
    prestadorId: number,
    pagina = 1,
    limite = 5
): Promise<RespuestaApi<IResena[]>> {
    const parametros = new URLSearchParams({
        prestadorId: String(prestadorId),
        page: String(pagina),
        limit: String(limite),
    });

    const respuesta = await fetch(
        `${API_URL}?${parametros}`
    );

    if (!respuesta.ok) {
        throw new Error('No se pudieron cargar las reseñas');
    }

    return respuesta.json() as Promise<RespuestaApi<IResena[]>>;
}

export async function crearResena(
    datos: ICrearResena
): Promise<RespuestaApi<IResena>> {
    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json() as RespuestaApi<IResena>;

    if (!respuesta.ok) {
        throw new Error(
            resultado.msj || 'No se pudo crear la reseña'
        );
    }

    return resultado;
}

export async function actualizarResena(
    id: number,
    datos: Pick<ICrearResena, 'calificacion' | 'comentario'>
): Promise<RespuestaApi<IResena>> {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json() as RespuestaApi<IResena>;

    if (!respuesta.ok) {
        throw new Error(
            resultado.msj || 'No se pudo actualizar la reseña'
        );
    }

    return resultado;
}


export async function obtenerTodasLasResenas(
    prestadorId: number
): Promise<IResena[]> {
    const limite = 100;
    const primeraPagina = await obtenerResenas(prestadorId, 1, limite);

    const resenas = [...primeraPagina.datos];
    const totalPaginas = primeraPagina.meta?.totalPages ?? 1;

    for (let pagina = 2; pagina <= totalPaginas; pagina++) {
        const respuesta = await obtenerResenas(
            prestadorId,
            pagina,
            limite
        );

        resenas.push(...respuesta.datos);
    }

    return resenas;
}
