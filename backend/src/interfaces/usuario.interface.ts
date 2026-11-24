import { ITelefono } from './prestador.interface';
import { IUbicacion } from './ubicacion.interface';

export type RolUsuario = 'USUARIO' | 'PRESTADOR' | 'ADMIN';

/**
 * Entidad normalizada almacenada en el repositorio de Usuarios.
 * La geografía (código postal, localidad, provincia y radio de cobertura)
 * se referencia exclusivamente mediante ubicacionId -> UBICACION.id.
 */
export interface IUsuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    passwordHash: string;
    rol: RolUsuario;
    prestadorId?: number;
    ubicacionId?: number;
    telefono?: ITelefono;
    fechaNacimiento?: string;
    preguntaSecreta?: string;
    respuestaSecretaHash?: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Proyección segura de Usuario para respuestas HTTP (sin hashes sensibles)
 * enriquecida con datos de su UBICACION asociada.
 */
export interface IUsuarioPublico
    extends Omit<IUsuario, 'passwordHash' | 'respuestaSecretaHash'> {
    ubicacion?: IUbicacion;
    codigoPostal?: string;
    radio?: number;
}

export interface IActualizarUsuarioPayload
    extends Partial<Omit<IUsuario, 'id' | 'createdAt'>> {
    codigoPostal?: string;
    radio?: number;
    provincia?: string;
    localidad?: string;
}
