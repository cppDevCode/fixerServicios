
import type {
    IResena,
    RespuestaApi,
} from '../interfaces/resena.interface';

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
