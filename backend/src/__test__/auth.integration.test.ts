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
});