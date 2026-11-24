export interface ITelefonoPrestador {
    codPais: string;
    codArea: string;
    nroTelefono: string;
}

export interface IPrestador {
    id: number;
    nombre: string;
    apellido: string;
    matricula?: string;
    aniosExperiencia: number;
    acercaDe: string;
    ofreceGarantia: boolean;
    categoriaId: number;
    categoriaNombre?: string;
    ubicacionId?: number;
    provincia?: string;
    localidad?: string;
    codigoPostal?: string;
    radio?: number;
    telefono: ITelefonoPrestador;
    ratingPromedio?: number;
    fotoUrl?: string;
}

export interface ICategoria {
    id: number;
    slug: string;
    nombre: string;
}

export interface IFiltrosPrestador {
    page?: number;
    limit?: number;
    rubro?: string;
    provincia?: string;
    localidad?: string;
    search?: string;
    sortBy?: keyof IPrestador;
    order?: 'asc' | 'desc';
}

export type ICrearPrestador = Omit<
    IPrestador,
    'id' | 'categoriaNombre' | 'ratingPromedio'
>;

export type IActualizarPrestador = Partial<
    Omit<IPrestador, 'id' | 'categoriaNombre' | 'ratingPromedio'>
>;

export type FormatoExportacion = 'pdf' | 'xlsx';

export interface IMetaPaginacion {
    pagina: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RespuestaApi<T> {
    codigo: number;
    msj: string;
    datos: T;
    meta?: IMetaPaginacion;
}
