import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { crearApp } from './helpers/crearApp';

const app = crearApp();

describe('API Reseñas - Consultas', () => {
    it('GET /api/v1/resenas filtra por prestador y devuelve la estructura unificada', async () => {
        const res = await request(app)
        .get('/api/v1/resenas?prestadorId=1&page=1&limit=5')
        .expect(200);

        expect(res.body.codigo).toBe(200);
        expect(Array.isArray(res.body.datos)).toBe(true);
        expect(res.body.datos.length).toBeGreaterThan(0);
        res.body.datos.forEach((r: { prestadorId: number }) => {
        expect(r.prestadorId).toBe(1);
        });
        expect(res.body.meta).toEqual({ pagina: 1, limit: 5, total: 2, totalPages: 1 });
    });

    it('GET /api/v1/resenas pagina el listado completo', async () => {
        const res = await request(app)
        .get('/api/v1/resenas?page=2&limit=5')
        .expect(200);

        expect(res.body.datos).toHaveLength(5);
        expect(res.body.meta).toEqual({ pagina: 2, limit: 5, total: 30, totalPages: 6 });
    });

    it('GET /api/v1/resenas/:id devuelve la reseña pedida', async () => {
        const res = await request(app).get('/api/v1/resenas/1').expect(200);

        expect(res.body.codigo).toBe(200);
        expect(res.body.datos.id).toBe(1);
    });

    it('GET /api/v1/resenas/:id responde 404 si no existe', async () => {
        const res = await request(app).get('/api/v1/resenas/9999').expect(404);

        expect(res.body.codigo).toBe(404);
        expect(res.body.datos).toBeNull();
    });
});

describe('API Reseñas - Alta y baja', () => {
    const datosValidos = {
        prestadorId: 1,
        usuarioId: 1,
        calificacion: 4,
        comentario: 'Muy buen trabajo',
    };

    it('POST /api/v1/resenas crea la reseña y queda disponible en memoria', async () => {
        const res = await request(app)
        .post('/api/v1/resenas')
        .send(datosValidos)
        .expect(201);

        expect(res.body.codigo).toBe(201);
        expect(res.body.datos).toMatchObject(datosValidos);
        expect(res.body.datos.id).toBeTypeOf('number');

        const consulta = await request(app)
        .get(`/api/v1/resenas/${res.body.datos.id}`)
        .expect(200);

        expect(consulta.body.datos.comentario).toBe(datosValidos.comentario);
    });

    it.each([
        ['calificación fuera de rango', { ...datosValidos, calificacion: 6 }],
        ['calificación no entera', { ...datosValidos, calificacion: 3.5 }],
        ['comentario vacío', { ...datosValidos, comentario: '   ' }],
        ['prestadorId faltante', { usuarioId: 1, calificacion: 4, comentario: 'Bien' }],
    ])('POST /api/v1/resenas responde 400 con %s', async (_caso, body) => {
        const res = await request(app)
        .post('/api/v1/resenas')
        .send(body)
        .expect(400);

        expect(res.body.codigo).toBe(400);
        expect(res.body.datos).toBeNull();
    });

    it('DELETE /api/v1/resenas/:id elimina la reseña y deja de existir', async () => {
        const creada = await request(app)
        .post('/api/v1/resenas')
        .send(datosValidos)
        .expect(201);
        const id = creada.body.datos.id;

        await request(app).delete(`/api/v1/resenas/${id}`).expect(200);
        await request(app).get(`/api/v1/resenas/${id}`).expect(404);
    });

    it('DELETE /api/v1/resenas/:id responde 404 si no existe', async () => {
        const res = await request(app).delete('/api/v1/resenas/9999').expect(404);

        expect(res.body.codigo).toBe(404);
    });
});