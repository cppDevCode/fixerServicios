import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormularioCambioPassword } from '../../components/prestadores/FormularioCambioPassword';
import { FormularioPrestador } from '../../components/prestadores/FormularioPrestador';
import {
    cambiarPasswordUsuario,
    validarCambioPassword,
} from '../../services/password.service';

describe('Cambio de contraseña desde Mi Ficha Profesional', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('validarCambioPassword exige todos los campos, longitud mínima de 6, coincidencia y diferencia con la actual', () => {
        expect(
            validarCambioPassword({
                passwordActual: '',
                nuevaPassword: 'nuevaPassword1',
                confirmarPassword: 'nuevaPassword1',
            })
        ).toContain('Debés completar');

        expect(
            validarCambioPassword({
                passwordActual: '123456',
                nuevaPassword: '123',
                confirmarPassword: '123',
            })
        ).toContain('al menos 6 caracteres');

        expect(
            validarCambioPassword({
                passwordActual: '123456',
                nuevaPassword: 'nuevaPassword1',
                confirmarPassword: 'distintaPassword2',
            })
        ).toContain('no coinciden');

        expect(
            validarCambioPassword({
                passwordActual: '123456',
                nuevaPassword: '123456',
                confirmarPassword: '123456',
            })
        ).toContain('diferente');

        expect(
            validarCambioPassword({
                passwordActual: '123456',
                nuevaPassword: 'nuevaPassword1',
                confirmarPassword: 'nuevaPassword1',
            })
        ).toBeNull();
    });

    it('cambiarPasswordUsuario procesa respuestas 200, 401 (intentos restantes) y 423 (bloqueo 30 minutos)', async () => {
        const fetchSpy = vi
            .fn()
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({
                    code: 401,
                    msg: 'La contraseña actual es incorrecta. Te quedan 2 intentos.',
                    data: { intentosRestantes: 2 },
                }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 423,
                json: async () => ({
                    code: 423,
                    msg: 'Cuenta bloqueada por 30 minutos.',
                    data: {
                        bloqueadoHasta: '2026-11-24T23:40:00.000Z',
                        minutosRestantes: 30,
                    },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    code: 200,
                    msg: 'Contraseña actualizada exitosamente',
                    data: { mensaje: 'Contraseña actualizada exitosamente' },
                }),
            });
        vi.stubGlobal('fetch', fetchSpy);

        const res401 = await cambiarPasswordUsuario(2, {
            passwordActual: 'mal',
            nuevaPassword: 'nuevaPassword1',
            confirmarPassword: 'nuevaPassword1',
        });
        expect(res401.ok).toBe(false);
        expect(res401.status).toBe(401);
        expect(res401.intentosRestantes).toBe(2);

        const res423 = await cambiarPasswordUsuario(2, {
            passwordActual: 'mal',
            nuevaPassword: 'nuevaPassword1',
            confirmarPassword: 'nuevaPassword1',
        });
        expect(res423.ok).toBe(false);
        expect(res423.status).toBe(423);
        expect(res423.minutosRestantes).toBe(30);
        expect(res423.bloqueadoHasta).toBe('2026-11-24T23:40:00.000Z');

        const res200 = await cambiarPasswordUsuario(2, {
            passwordActual: '123456',
            nuevaPassword: 'nuevaPassword1',
            confirmarPassword: 'nuevaPassword1',
        });
        expect(res200.ok).toBe(true);
        expect(res200.status).toBe(200);
    });

    it('FormularioCambioPassword renderiza los 3 campos de contraseña y el aviso de bloqueo por 30 minutos', () => {
        const html = renderToStaticMarkup(
            createElement(FormularioCambioPassword, { usuarioId: 2 })
        );

        expect(html).toContain('Cambiar contraseña');
        expect(html).toContain('id="cambio-password-actual"');
        expect(html).toContain('id="cambio-password-nueva"');
        expect(html).toContain('id="cambio-password-confirmar"');
        expect(html).toContain('3 intentos fallidos');
        expect(html).toContain('30 minutos');
        expect(html).toContain('Actualizar contraseña');
    });

    it('deshabilita la edición de FormularioPrestador y FormularioCambioPassword cuando la cuenta está bloqueada', () => {
        const futuro = new Date(Date.now() + 25 * 60 * 1000).toISOString();

        const htmlPasswordBloqueado = renderToStaticMarkup(
            createElement(FormularioCambioPassword, {
                usuarioId: 2,
                bloqueadoHastaInicial: futuro,
            })
        );
        expect(htmlPasswordBloqueado).toContain('Cuenta bloqueada (30 min)');
        expect(htmlPasswordBloqueado).toContain('disabled=""');

        const htmlFichaBloqueada = renderToStaticMarkup(
            createElement(FormularioPrestador, {
                bloqueado: true,
                textoBoton: 'Edición bloqueada (30 min)',
                mensajeBloqueo:
                    'Tu cuenta está bloqueada por 30 minutos. No podés editar tu ficha.',
            })
        );
        expect(htmlFichaBloqueada).toContain(
            'data-testid="prestador-edicion-bloqueada"'
        );
        expect(htmlFichaBloqueada).toContain('No podés editar tu ficha.');
        expect(htmlFichaBloqueada).toContain('Edición bloqueada (30 min)');
        expect(htmlFichaBloqueada).toContain('disabled=""');
    });
});
