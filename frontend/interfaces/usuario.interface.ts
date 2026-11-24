export type RolUsuario = 'ADMIN' | 'PRESTADOR' | 'USUARIO';

export interface ITelefonoUsuario {
    codPais: string;
    codArea: string;
    nroTelefono: string;
}

// Entidad principal
export interface IUsuario {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: RolUsuario;
    
    // Datos de ubicación y cobertura
    ubicacionId?: string;
    codigoPostal?: string;
    radio?: number; // Solo aplica a prestadores
    
    // Datos de seguridad
    preguntaSecreta?: string;
    respuestaSecreta?: string;
    
    // Vínculo con la entidad Prestador (si el rol es PRESTADOR)
    prestadorId?: number;
    
    // Datos opcionales de perfil
    telefono?: ITelefonoUsuario;
    fechaNacimiento?: string;
    createdAt?: string;
}

export type ICrearUsuario = Omit<IUsuario, 'id' | 'createdAt'>;

export type IActualizarUsuario = Partial<Omit<IUsuario, 'id' | 'createdAt'>>;

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
    search?: string; // Busca por nombre, email o ciudad
    rol?: RolUsuario;
    sortBy?: keyof IUsuario;
    order?: 'asc' | 'desc';
}