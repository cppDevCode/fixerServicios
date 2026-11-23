import { describe, it, expect } from 'vitest';
import { UsuarioService } from '../service/usuario.service';

describe('UsuarioService - Validaciones Unitarias', () => {
  const service = new UsuarioService();

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
    await expect(
      service.crearUsuario({ ...datosBase, email: 'correo-invalido' })
    ).rejects.toThrow('Formato de email inválido');
  });

  it('Debe rechazar una contraseña con menos de 6 caracteres', async () => {
    await expect(
      service.crearUsuario({ ...datosBase, passwordHash: '123' })
    ).rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
  });

  it('Debe rechazar una respuesta secreta vacía', async () => {
    await expect(
      service.crearUsuario({ ...datosBase, respuestaSecretaHash: '' })
    ).rejects.toThrow('La respuesta secreta es obligatoria');
  });

  it('Debe aceptar datos válidos y crear el usuario', async () => {
    const nuevoUsuario = await service.crearUsuario(datosBase);
    expect(nuevoUsuario.email).toBe(datosBase.email);
    expect(nuevoUsuario.rol).toBe('USUARIO');
  });
});