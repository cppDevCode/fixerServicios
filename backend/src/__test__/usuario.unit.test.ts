import { describe, it, expect } from 'vitest';
import { UsuarioRepository } from '../repository/usuario.repository';
import {
    DURACION_BLOQUEO_MS,
    ErrorCredencialesInvalidas,
    ErrorCuentaBloqueada,
    ErrorValidacionUsuario,
    UsuarioService,
} from '../service/usuario.service';

describe('UsuarioService - Validaciones Unitarias', () => {
    const crearServicioAislado = () =>
        new UsuarioService(new UsuarioRepository());

    const datosBase = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        passwordHash: '123456',
        rol: 'USUARIO' as const,
        preguntaSecreta: '¿Nombre de tu primera mascota?',
        respuestaSecretaHash: 'Firulais',
        ubicacionId: undefined,
    };

    it('Debe rechazar un email con formato inválido', async () => {
        const service = crearServicioAislado();
        await expect(
            service.crearUsuario({ ...datosBase, email: 'correo-invalido' })
        ).rejects.toThrow('Formato de email inválido');
    });

    it('Debe rechazar una contraseña con menos de 6 caracteres', async () => {
        const service = crearServicioAislado();
        await expect(
            service.crearUsuario({ ...datosBase, passwordHash: '123' })
        ).rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('Debe rechazar una respuesta secreta vacía', async () => {
        const service = crearServicioAislado();
        await expect(
            service.crearUsuario({ ...datosBase, respuestaSecretaHash: '' })
        ).rejects.toThrow('La respuesta secreta es obligatoria');
    });

    it('Debe aceptar datos válidos y crear el usuario', async () => {
        const service = crearServicioAislado();
        const nuevoUsuario = await service.crearUsuario(datosBase);
        expect(nuevoUsuario.email).toBe(datosBase.email);
        expect(nuevoUsuario.rol).toBe('USUARIO');
    });

    describe('cambiarPasswordAutenticado y política de bloqueo por 30 minutos', () => {
        it('valida que la nueva contraseña tenga al menos 6 caracteres, coincida en ambas entradas y difiera de la actual', async () => {
            const service = crearServicioAislado();

            await expect(
                service.cambiarPasswordAutenticado(2, {
                    passwordActual: '123456',
                    nuevaPassword: 'abc',
                    confirmarPassword: 'abc',
                })
            ).rejects.toThrow(ErrorValidacionUsuario);

            await expect(
                service.cambiarPasswordAutenticado(2, {
                    passwordActual: '123456',
                    nuevaPassword: 'nuevaClave1',
                    confirmarPassword: 'otraClave2',
                })
            ).rejects.toThrow('La nueva contraseña y su confirmación no coinciden');

            await expect(
                service.cambiarPasswordAutenticado(2, {
                    passwordActual: '123456',
                    nuevaPassword: '123456',
                    confirmarPassword: '123456',
                })
            ).rejects.toThrow(
                'La nueva contraseña debe ser diferente a la contraseña actual'
            );
        });

        it('actualiza la contraseña cuando la actual coincide y permite iniciar sesión con la nueva', async () => {
            const service = crearServicioAislado();

            const resultado = await service.cambiarPasswordAutenticado(2, {
                passwordActual: '123456',
                nuevaPassword: 'NuevaClave2026',
                confirmarPassword: 'NuevaClave2026',
            });

            expect(resultado.mensaje).toBe('Contraseña actualizada exitosamente');

            await expect(
                service.login('carlos@example.com', '123456')
            ).rejects.toThrow('Credenciales inválidas');

            const sesion = await service.login(
                'carlos@example.com',
                'NuevaClave2026'
            );
            expect(sesion.usuario.id).toBe(2);
        });

        it('bloquea la cuenta por 30 minutos tras 3 intentos fallidos de contraseña actual y la desbloquea al expirar el plazo', async () => {
            const service = crearServicioAislado();
            const t0 = new Date('2026-11-24T20:00:00.000Z').getTime();

            // Intento fallido 1 -> quedan 2 intentos
            try {
                await service.cambiarPasswordAutenticado(
                    2,
                    {
                        passwordActual: 'incorrecta1',
                        nuevaPassword: 'NuevaClave2026',
                        confirmarPassword: 'NuevaClave2026',
                    },
                    t0
                );
                expect.unreachable('Debía lanzar ErrorCredencialesInvalidas');
            } catch (err) {
                expect(err).toBeInstanceOf(ErrorCredencialesInvalidas);
                expect((err as ErrorCredencialesInvalidas).intentosRestantes).toBe(2);
            }

            // Intento fallido 2 -> queda 1 intento
            try {
                await service.cambiarPasswordAutenticado(
                    2,
                    {
                        passwordActual: 'incorrecta2',
                        nuevaPassword: 'NuevaClave2026',
                        confirmarPassword: 'NuevaClave2026',
                    },
                    t0 + 1000
                );
                expect.unreachable('Debía lanzar ErrorCredencialesInvalidas');
            } catch (err) {
                expect(err).toBeInstanceOf(ErrorCredencialesInvalidas);
                expect((err as ErrorCredencialesInvalidas).intentosRestantes).toBe(1);
            }

            // Intento fallido 3 -> cuenta bloqueada por 30 minutos
            try {
                await service.cambiarPasswordAutenticado(
                    2,
                    {
                        passwordActual: 'incorrecta3',
                        nuevaPassword: 'NuevaClave2026',
                        confirmarPassword: 'NuevaClave2026',
                    },
                    t0 + 2000
                );
                expect.unreachable('Debía lanzar ErrorCuentaBloqueada');
            } catch (err) {
                expect(err).toBeInstanceOf(ErrorCuentaBloqueada);
                expect((err as ErrorCuentaBloqueada).minutosRestantes).toBe(30);
            }

            // A los 10 minutos sigue bloqueada incluso enviando la contraseña correcta (tanto cambio como login)
            const aLos10Min = t0 + 2000 + 10 * 60 * 1000;
            await expect(
                service.cambiarPasswordAutenticado(
                    2,
                    {
                        passwordActual: '123456',
                        nuevaPassword: 'NuevaClave2026',
                        confirmarPassword: 'NuevaClave2026',
                    },
                    aLos10Min
                )
            ).rejects.toThrow(ErrorCuentaBloqueada);

            await expect(
                service.login('carlos@example.com', '123456', aLos10Min)
            ).rejects.toThrow(ErrorCuentaBloqueada);

            // Pasados los 30 minutos, el bloqueo expira y permite cambiar la contraseña y loguearse
            const trasDesbloqueo = t0 + 2000 + DURACION_BLOQUEO_MS + 1000;
            const res = await service.cambiarPasswordAutenticado(
                2,
                {
                    passwordActual: '123456',
                    nuevaPassword: 'ClaveDesbloqueada1',
                    confirmarPassword: 'ClaveDesbloqueada1',
                },
                trasDesbloqueo
            );
            expect(res.mensaje).toBe('Contraseña actualizada exitosamente');

            const loginOk = await service.login(
                'carlos@example.com',
                'ClaveDesbloqueada1',
                trasDesbloqueo + 1000
            );
            expect(loginOk.usuario.id).toBe(2);
        });
    });
});
