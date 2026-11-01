
export interface RespuestaApi<T> {
    codigo: number;
    msj: string;
    datos: T;
    meta?: {
        pagina: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
