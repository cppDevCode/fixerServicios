
export interface IResena {
    id: number;
    prestadorId: number;
    usuarioId: number;
    calificacion: number;
    comentario: string;
    createdAt: string;
}

export interface RespuestaApi<T> {
    codigo: number;
    msj: string;
    datos: T;
    meta?: {
        pagina: number;
        limit: number;
        total: number;
        totalPages: number;
        promedio?: number;
    };
}
