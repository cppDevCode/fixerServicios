import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { Servidor } from '../core/Servidor';
import { emailServiceSingleton } from '../service/email.service';

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

    // Mientras está bloqueada, no permite editar los datos de Mi Ficha Profesional (423)
    const prestadorId: number = registro.body.data.prestador.id;
    const resEdicionBloqueada = await request(app)
      .put(`/api/v1/prestadores/${prestadorId}`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(userId))
      .set('x-prestador-id', String(prestadorId))
      .send({ aniosExperiencia: 25 })
      .expect(423);
    expect(resEdicionBloqueada.body.codigo).toBe(423);

    // Confirmar que el perfil de usuario informa bloqueadoHasta para persistir el bloqueo en UI
    const resUsuario = await request(app)
      .get(`/api/v1/usuarios/${userId}`)
      .expect(200);
    expect(resUsuario.body.data.bloqueadoHasta).toBeTruthy();

    // Limpieza del prestador creado para no alterar conteo global de prestadores
    await request(app)
      .delete(`/api/v1/prestadores/${prestadorId}`)
      .set('x-usuario-rol', 'ADMIN')
      .expect(200);
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

    // Limpieza del prestador temporal creado
    const prestadorIdOk: number = registro.body.data.prestador.id;
    await request(app)
      .delete(`/api/v1/prestadores/${prestadorIdOk}`)
      .set('x-usuario-rol', 'ADMIN')
      .expect(200);
  });

  it('Alta de prestador desde ADMIN solicita email, genera contraseña segura aleatoria, la envía por correo y obliga a cambiarla al iniciar sesión', async () => {
    const emailPro = `alta.admin.${Date.now()}@example.com`;

    // ADMIN sin email -> 400
    await request(app)
      .post('/api/v1/prestadores')
      .set('x-usuario-rol', 'ADMIN')
      .send({
        nombre: 'Ignacio',
        apellido: 'Paz',
        categoriaId: 1,
        aniosExperiencia: 8,
        acercaDe: 'Plomero matriculado',
        ofreceGarantia: true,
        telefono: { codPais: '+54', codArea: '351', nroTelefono: '4123456' },
      })
      .expect(400);

    // ADMIN con email válido -> 201 + cuenta PRESTADOR + envío de correo con contraseña temporal
    const altaRes = await request(app)
      .post('/api/v1/prestadores')
      .set('x-usuario-rol', 'ADMIN')
      .send({
        nombre: 'Ignacio',
        apellido: 'Paz',
        email: emailPro,
        categoriaId: 1,
        provincia: 'Córdoba',
        localidad: 'Córdoba Capital',
        aniosExperiencia: 8,
        acercaDe: 'Plomero matriculado',
        ofreceGarantia: true,
        telefono: { codPais: '+54', codArea: '351', nroTelefono: '4123456' },
      })
      .expect(201);

    const prestadorId: number = altaRes.body.datos.id;
    expect(altaRes.body.credenciales).toMatchObject({
      email: emailPro,
      enviado: true,
      debeCambiarPassword: true,
    });

    // Correo duplicado -> 409 Conflict
    await request(app)
      .post('/api/v1/prestadores')
      .set('x-usuario-rol', 'ADMIN')
      .send({
        nombre: 'Otro',
        apellido: 'Pro',
        email: emailPro,
        categoriaId: 2,
        aniosExperiencia: 2,
        acercaDe: 'Test duplicado',
        ofreceGarantia: false,
        telefono: { codPais: '+54', codArea: '11', nroTelefono: '40009999' },
      })
      .expect(409);

    // Verificar correo enviado con contraseña segura aleatoria
    const correoEnviado = emailServiceSingleton.obtenerUltimoCorreoPara(emailPro);
    expect(correoEnviado).toBeDefined();
    const passwordTemporal = correoEnviado!.passwordTemporal;
    expect(passwordTemporal.length).toBeGreaterThanOrEqual(12);

    // Login con la contraseña temporal -> exige cambio obligatorio (debeCambiarPassword: true)
    const loginTemporal = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: emailPro, password: passwordTemporal })
      .expect(200);

    expect(loginTemporal.body.data.usuario.debeCambiarPassword).toBe(true);
    expect(loginTemporal.body.data.usuario.prestadorId).toBe(prestadorId);
    const usuarioId: number = loginTemporal.body.data.usuario.id;

    // Antes de cambiar la contraseña temporal no puede editar su ficha -> 403
    await request(app)
      .put(`/api/v1/prestadores/${prestadorId}`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(usuarioId))
      .set('x-prestador-id', String(prestadorId))
      .send({ aniosExperiencia: 9 })
      .expect(403);

    // Intentar cambiar la contraseña temporal sin definir pregunta/respuesta secreta -> 400
    await request(app)
      .patch(`/api/v1/usuarios/${usuarioId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(usuarioId))
      .send({
        passwordActual: passwordTemporal,
        nuevaPassword: 'MiClaveDefinitiva#2026',
        confirmarPassword: 'MiClaveDefinitiva#2026',
      })
      .expect(400);

    // Cambia obligatoriamente su contraseña e ingresa pregunta y respuesta secreta
    await request(app)
      .patch(`/api/v1/usuarios/${usuarioId}/password`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(usuarioId))
      .send({
        passwordActual: passwordTemporal,
        nuevaPassword: 'MiClaveDefinitiva#2026',
        confirmarPassword: 'MiClaveDefinitiva#2026',
        preguntaSecreta: '¿Ciudad de nacimiento?',
        respuestaSecreta: 'Córdoba',
      })
      .expect(200);

    // Verificar que la pregunta y respuesta secreta quedaron guardadas para recuperación
    const preguntaRes = await request(app)
      .post('/api/v1/auth/pregunta-secreta')
      .send({ email: emailPro })
      .expect(200);
    expect(preguntaRes.body.data.preguntaSecreta).toBe('¿Ciudad de nacimiento?');

    await request(app)
      .post('/api/v1/auth/recuperar-password')
      .send({ email: emailPro, respuesta: 'Córdoba' })
      .expect(200);

    // Re-login con nueva clave -> debeCambiarPassword: false y ficha habilitada
    const loginDefinitivo = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: emailPro, password: 'MiClaveDefinitiva#2026' })
      .expect(200);
    expect(loginDefinitivo.body.data.usuario.debeCambiarPassword).toBe(false);

    await request(app)
      .put(`/api/v1/prestadores/${prestadorId}`)
      .set('x-usuario-rol', 'PRESTADOR')
      .set('x-usuario-id', String(usuarioId))
      .set('x-prestador-id', String(prestadorId))
      .send({ aniosExperiencia: 9 })
      .expect(200);

    // Limpieza del prestador creado
    await request(app)
      .delete(`/api/v1/prestadores/${prestadorId}`)
      .set('x-usuario-rol', 'ADMIN')
      .expect(200);
  });
});