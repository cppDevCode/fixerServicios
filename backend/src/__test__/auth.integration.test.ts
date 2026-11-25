import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Servidor } from '../core/Servidor';

const app = new Servidor().obtenerApp();

describe('Auth API - Integración', () => {
  it('POST /api/v1/auth/login debe devolver 200 con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bruna@example.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.usuario).toHaveProperty('email', 'bruna@example.com');
  });

  it('POST /api/v1/auth/login debe devolver 401 con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bruna@example.com', password: 'contraseña-incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 401);
    expect(res.body.msg).toBe('Credenciales inválidas');
  });

  it('POST /api/v1/auth/login debe devolver 400 si faltan datos', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bruna@example.com' }); // Sin contraseña

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
  });

  it('PATCH /api/v1/usuarios/:id/password verifica contraseña actual, bloquea 30 min al 3er fallo y exige coincidencia de la nueva clave', async () => {
    const emailPrueba = `prestador.lockout.${Date.now()}@example.com`;
    const registro = await request(app)
      .post('/api/v1/usuarios')
      .send({
        nombre: 'Matías',
        apellido: 'Seguridad',
        email: emailPrueba,
        password: 'claveInicial1',
        preguntaSecreta: '¿Mascota?',
        respuestaSecreta: 'Rex',
        esPrestador: true,
        especialidad: 'Plomería',
      })
      .expect(201);

    const userId: number = registro.body.data.usuario.id;

    // Otro usuario no ADMIN no puede cambiar la contraseña -> 403
    await request(app)
      .patch(`/api/v1/usuarios/${userId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', '999')
      .send({
        passwordActual: 'claveInicial1',
        nuevaPassword: 'nuevaPassword1',
        confirmarPassword: 'nuevaPassword1',
      })
      .expect(403);

    // Nueva contraseña y confirmación distintas -> 400 (no consume intento de bloqueo)
    await request(app)
      .patch(`/api/v1/usuarios/${userId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(userId))
      .send({
        passwordActual: 'claveInicial1',
        nuevaPassword: 'nuevaPassword1',
        confirmarPassword: 'otraPassword2',
      })
      .expect(400);

    // Fallo 1 -> 401 (2 intentos restantes)
    const fallo1 = await request(app)
      .patch(`/api/v1/usuarios/${userId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(userId))
      .send({
        passwordActual: 'erronea1',
        nuevaPassword: 'nuevaPassword1',
        confirmarPassword: 'nuevaPassword1',
      })
      .expect(401);
    expect(fallo1.body.data.intentosRestantes).toBe(2);

    // Fallo 2 -> 401 (1 intento restante)
    const fallo2 = await request(app)
      .patch(`/api/v1/usuarios/${userId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(userId))
      .send({
        passwordActual: 'erronea2',
        nuevaPassword: 'nuevaPassword1',
        confirmarPassword: 'nuevaPassword1',
      })
      .expect(401);
    expect(fallo2.body.data.intentosRestantes).toBe(1);

    // Fallo 3 -> 423 Locked (bloqueo 30 minutos)
    const fallo3 = await request(app)
      .patch(`/api/v1/usuarios/${userId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(userId))
      .send({
        passwordActual: 'erronea3',
        nuevaPassword: 'nuevaPassword1',
        confirmarPassword: 'nuevaPassword1',
      })
      .expect(423);
    expect(fallo3.body.data.minutosRestantes).toBe(30);
    expect(fallo3.body.data.bloqueadoHasta).toBeTruthy();

    // Mientras está bloqueada, el login también responde 423
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: emailPrueba, password: 'claveInicial1' })
      .expect(423);
  });

  it('PATCH /api/v1/usuarios/:id/password actualiza la contraseña cuando todos los datos son válidos', async () => {
    const emailOk = `prestador.cambio.${Date.now()}@example.com`;
    const registro = await request(app)
      .post('/api/v1/usuarios')
      .send({
        nombre: 'Laura',
        apellido: 'Clave',
        email: emailOk,
        password: 'passwordVieja1',
        preguntaSecreta: '¿Ciudad?',
        respuestaSecreta: 'Rosario',
        esPrestador: true,
        especialidad: 'Electricidad',
      })
      .expect(201);

    const userId: number = registro.body.data.usuario.id;

    await request(app)
      .patch(`/api/v1/usuarios/${userId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(userId))
      .send({
        passwordActual: 'passwordVieja1',
        nuevaPassword: 'passwordNueva2',
        confirmarPassword: 'passwordNueva2',
      })
      .expect(200);

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: emailOk, password: 'passwordVieja1' })
      .expect(401);

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: emailOk, password: 'passwordNueva2' })
      .expect(200);
  });
});