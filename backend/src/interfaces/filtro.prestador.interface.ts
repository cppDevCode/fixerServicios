import { IPrestador } from "./prestador.interface";

export interface IFiltrosPrestador {
    page?: number;
    limit?: number;
    rubro?: string;
    localidad?: string;
    search?: string;
    sortBy?: keyof IPrestador;
    order?: 'asc' | 'desc';
}
