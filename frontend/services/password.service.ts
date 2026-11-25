import { construirHeadersAutenticacion } from './sesion.service';

export const PREGUNTAS_SECRETAS_OPCIONES = [
    '¿Nombre de tu primera mascota?',
    '¿Ciudad de nacimiento?',
    '¿Nombre de tu mejor amigo de la infancia?',
] as const;

export interface IDatosCambioPassword {
    passwordActual: string;
    nuevaPassword: string;
    confirmarPassword: string;
    preguntaSecreta?: string;
    respuestaSecreta?: string;
}

export interface IResultadoCambioPassword {
    ok: boolean;
    status: number;
    mensaje: string;
    intentosRestantes?: number;
    bloqueadoHasta?: string;
    minutosRestantes?: number;
}

export function validarCambioPassword(
    datos: IDatosCambioPassword,
    opciones?: { exigirPreguntaSecreta?: boolean }
): string | null {
    if (
        !datos.passwordActual ||
        !datos.nuevaPassword ||
        !datos.confirmarPassword
    ) {
        return 'Debés completar la contraseña actual, la nueva contraseña y su confirmación.';
    }

    if (datos.nuevaPassword.length < 6) {
        return 'La nueva contraseña debe tener al menos 6 caracteres.';
    }

    if (datos.nuevaPassword !== datos.confirmarPassword) {
        return 'La nueva contraseña y su confirmación no coinciden.';
    }

    if (datos.nuevaPassword === datos.passwordActual) {
        return 'La nueva contraseña debe ser diferente a la contraseña actual.';
    }

    if (opciones?.exigirPreguntaSecreta) {
        if (!datos.preguntaSecreta || !datos.preguntaSecreta.trim()) {
            return 'Debés seleccionar una pregunta secreta de recuperación.';
        }

        if (!datos.respuestaSecreta || !datos.respuestaSecreta.trim()) {
            return 'Debés ingresar tu respuesta secreta de recuperación.';
        }
    }

    return null;
}

export async function cambiarPasswordUsuario(
    usuarioId: number,
    datos: IDatosCambioPassword,
    baseUrl: string = '/api/v1'
): Promise<IResultadoCambioPassword> {
    const respuesta = await fetch(`${baseUrl}/usuarios/${usuarioId}/password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...construirHeadersAutenticacion(),
        },
        body: JSON.stringify(datos),
    });

    const body = (await respuesta.json()) as {
        code?: number;
        msg?: string;
        data?: {
            intentosRestantes?: number;
            bloqueadoHasta?: string;
            minutosRestantes?: number;
        } | null;
    };

    return {
        ok: respuesta.ok,
        status: respuesta.status,
        mensaje:
            body.msg ||
            (respuesta.ok
                ? 'Contraseña actualizada exitosamente.'
                : 'No se pudo actualizar la contraseña.'),
        intentosRestantes: body.data?.intentosRestantes,
        bloqueadoHasta: body.data?.bloqueadoHasta,
        minutosRestantes: body.data?.minutosRestantes,
    };
}
