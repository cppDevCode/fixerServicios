export type RolUsuario = 'ADMIN' | 'PRESTADOR' | 'USUARIO';

export interface ITelefonoUsuario {
    codPais: string;
    codArea: string;
    nroTelefono: string;
}

export interface IUbicacion {
    id: number;
    pais: string;
    provincia: string;
    localidad: string;
    codigoPostal: string;
    radio: number;
}

// Entidad principal alineada 1:1 con IUsuarioPublico del Backend
export interface IUsuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: RolUsuario;

    // Datos de ubicación y cobertura normalizados (FK -> UBICACION)
    ubicacionId?: number;
    ubicacion?: IUbicacion;
    codigoPostal?: string;
    radio?: number;

    // Datos de seguridad (solo pregunta y estado de bloqueo; nunca hashes en cliente)
    preguntaSecreta?: string;
    bloqueadoHasta?: string;

    // Vínculo con la entidad Prestador (si el rol es PRESTADOR)
    prestadorId?: number;

    // Datos opcionales de perfil
    telefono?: ITelefonoUsuario;
    fechaNacimiento?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ICrearUsuario = Omit<IUsuario, 'id' | 'createdAt' | 'updatedAt' | 'ubicacion'>;

export type IActualizarUsuario = Partial<
    Omit<IUsuario, 'id' | 'createdAt' | 'updatedAt' | 'ubicacion'>
>;

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

export interface IFiltrosUsuario {
    page?: number;
    limit?: number;
    search?: string; // Busca por nombre, email o localidad/provincia
    rol?: RolUsuario;
    sortBy?: keyof IUsuario;
    order?: 'asc' | 'desc';
}
