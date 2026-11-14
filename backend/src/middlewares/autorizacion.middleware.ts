import { Request, Response, NextFunction } from 'express';
import { RespuestaApi } from '../interfaces/respuestaApi.interface';

function obtenerCabecera(req: Request, nombre: string): string | undefined {
    const valor = req.headers[nombre];
    if (Array.isArray(valor)) {
        return valor[0]?.trim();
    }
    return typeof valor === 'string' && valor.trim() !== ''
        ? valor.trim()
        : undefined;
}

export function verificarPermisoCrearOEliminarPrestador(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const rol = obtenerCabecera(req, 'x-usuario-rol')?.toUpperCase();
    if (!rol) {
        next();
        return;
    }

    if (rol === 'ADMIN') {
        next();
        return;
    }

    const respuesta: RespuestaApi<null> = {
        codigo: 403,
        msj: 'Acceso denegado: solo un usuario con rol ADMIN puede crear o eliminar prestadores',
        datos: null,
    };
    res.status(403).json(respuesta);
}

export function verificarPermisoEditarPrestador(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const rol = obtenerCabecera(req, 'x-usuario-rol')?.toUpperCase();
    if (!rol) {
        next();
        return;
    }

    if (rol === 'ADMIN') {
        next();
        return;
    }

    if (rol === 'PRESTADOR') {
        const prestadorIdSesion = Number(
            obtenerCabecera(req, 'x-prestador-id')
        );
        const prestadorIdObjetivo = Number(req.params.id);

        if (
            Number.isInteger(prestadorIdSesion) &&
            prestadorIdSesion > 0 &&
            prestadorIdSesion === prestadorIdObjetivo
        ) {
            next();
            return;
        }

        const respuestaPropio: RespuestaApi<null> = {
            codigo: 403,
            msj: 'Acceso denegado: el rol PRESTADOR solo puede editar sus propios datos profesionales',
            datos: null,
        };
        res.status(403).json(respuestaPropio);
        return;
    }

    const respuestaDenegada: RespuestaApi<null> = {
        codigo: 403,
        msj: 'Acceso denegado: el perfil de usuario no tiene permisos para modificar datos de prestadores',
        datos: null,
    };
    res.status(403).json(respuestaDenegada);
}

export function verificarPermisoAdminUsuarios(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const rol = obtenerCabecera(req, 'x-usuario-rol')?.toUpperCase();
    if (!rol || rol === 'ADMIN') {
        next();
        return;
    }

    res.status(403).json({
        code: 403,
        msg: 'Acceso denegado: solo el rol ADMIN puede administrar el padrón de usuarios',
        data: null,
    });
}
