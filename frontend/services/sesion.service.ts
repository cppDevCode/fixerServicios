export type RolUsuario = 'ADMIN' | 'PRESTADOR' | 'USUARIO';

export interface IUsuarioSesion {
    id: string;
    nombre: string;
    apellido?: string;
    email: string;
    rol: RolUsuario;
    prestadorId?: number;
}

export const EVENTO_CAMBIO_SESION = 'fixer-sesion-cambiada';

export function obtenerUsuarioActual(): IUsuarioSesion | null {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }

    try {
        const guardado = window.localStorage.getItem('usuario');
        if (!guardado) {
            return null;
        }
        const usuario = JSON.parse(guardado) as Partial<IUsuarioSesion>;
        if (
            !usuario ||
            typeof usuario !== 'object' ||
            !usuario.id ||
            !usuario.rol
        ) {
            return null;
        }

        const rolNormalizado = String(usuario.rol).toUpperCase() as RolUsuario;
        if (
            rolNormalizado !== 'ADMIN' &&
            rolNormalizado !== 'PRESTADOR' &&
            rolNormalizado !== 'USUARIO'
        ) {
            return null;
        }

        return {
            id: String(usuario.id),
            nombre: String(usuario.nombre ?? ''),
            apellido: usuario.apellido ? String(usuario.apellido) : undefined,
            email: String(usuario.email ?? ''),
            rol: rolNormalizado,
            prestadorId:
                usuario.prestadorId !== undefined
                    ? Number(usuario.prestadorId)
                    : undefined,
        };
    } catch {
        return null;
    }
}

export function guardarSesionUsuario(
    token: string,
    usuario: IUsuarioSesion
): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    window.localStorage.setItem('token', token);
    window.localStorage.setItem('usuario', JSON.stringify(usuario));
    window.dispatchEvent(new Event(EVENTO_CAMBIO_SESION));
}

export function cerrarSesionUsuario(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    window.localStorage.removeItem('token');
    window.localStorage.removeItem('usuario');
    window.dispatchEvent(new Event(EVENTO_CAMBIO_SESION));
}

export function esAdmin(usuario: IUsuarioSesion | null): boolean {
    return usuario?.rol === 'ADMIN';
}

export function esPrestador(usuario: IUsuarioSesion | null): boolean {
    return usuario?.rol === 'PRESTADOR';
}

export function esUsuarioFinal(usuario: IUsuarioSesion | null): boolean {
    return usuario?.rol === 'USUARIO';
}

export function puedeGestionarCatalogoPrestadores(
    usuario: IUsuarioSesion | null
): boolean {
    return esAdmin(usuario);
}

export function puedeAdministrarUsuarios(
    usuario: IUsuarioSesion | null
): boolean {
    return esAdmin(usuario);
}

export function puedeEditarPrestador(
    usuario: IUsuarioSesion | null,
    prestadorId: number
): boolean {
    if (!usuario) {
        return false;
    }
    if (usuario.rol === 'ADMIN') {
        return true;
    }
    if (usuario.rol === 'PRESTADOR') {
        const idPropio = Number(usuario.prestadorId ?? usuario.id);
        return Number.isInteger(idPropio) && idPropio === Number(prestadorId);
    }
    return false;
}

export function puedeEliminarPrestador(
    usuario: IUsuarioSesion | null
): boolean {
    return esAdmin(usuario);
}

export function puedeAgregarResena(
    usuario: IUsuarioSesion | null,
    prestadorId?: number
): boolean {
    if (!usuario) {
        return false;
    }
    if (usuario.rol === 'USUARIO' || usuario.rol === 'ADMIN') {
        return true;
    }
    if (usuario.rol === 'PRESTADOR') {
        const idPropio = Number(usuario.prestadorId ?? usuario.id);
        return prestadorId === undefined || idPropio !== Number(prestadorId);
    }
    return false;
}

export function obtenerRutaInicioPorRol(usuario: IUsuarioSesion): string {
    if (usuario.rol === 'ADMIN') {
        return '/prestadores';
    }
    if (usuario.rol === 'PRESTADOR') {
        const idPrestador = Number(usuario.prestadorId ?? 1);
        return `/prestadores/${Number.isInteger(idPrestador) && idPrestador > 0 ? idPrestador : 1}`;
    }
    return '/prestadores/catalogo';
}

export function construirHeadersAutenticacion(
    usuario: IUsuarioSesion | null = obtenerUsuarioActual()
): Record<string, string> {
    if (!usuario) {
        return {};
    }

    const headers: Record<string, string> = {
        'x-usuario-id': String(usuario.id),
        'x-usuario-rol': usuario.rol,
    };

    if (usuario.prestadorId !== undefined) {
        headers['x-prestador-id'] = String(usuario.prestadorId);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}
