import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { crearApp } from './helpers/crearApp';

const app = crearApp();

describe('API Categorías - Tests de Integración (/api/v1/categorias)', () => {
    describe('GET /api/v1/categorias', () => {
        it('retorna todas las categorías de prestadores ordenadas alfabéticamente', async () => {
            const res = await request(app).get('/api/v1/categorias').expect(200);

            expect(res.body.codigo).toBe(200);
            expect(res.body.msj).toBe('Categorías obtenidas correctamente');
            expect(Array.isArray(res.body.datos)).toBe(true);
            expect(res.body.datos).toHaveLength(9);
            expect(res.body.datos[0]).toEqual({ id: 'Albañilería', nombre: 'Albañilería' });
        });

        it('filtra categorías por parámetro search ignorando tildes y mayúsculas', async () => {
            const res = await request(app)
                .get('/api/v1/categorias')
                .query({ search: 'plomeria' })
                .expect(200);

            expect(res.body.codigo).toBe(200);
            expect(res.body.datos).toEqual([{ id: 'Plomería', nombre: 'Plomería' }]);
        });
    });

    describe('GET /api/v1/categorias/:id', () => {
        it('retorna 200 y la categoría cuando el id existe', async () => {
            const res = await request(app)
                .get(`/api/v1/categorias/${encodeURIComponent('Plomería')}`)
                .expect(200);

            expect(res.body).toEqual({
                codigo: 200,
                msj: 'Categoría encontrada',
                datos: { id: 'Plomería', nombre: 'Plomería' },
            });
        });

        it('retorna 404 cuando la categoría no existe', async () => {
            const res = await request(app).get('/api/v1/categorias/Inexistente').expect(404);

            expect(res.body).toEqual({
                codigo: 404,
                msj: 'Categoría con id Inexistente no encontrada',
                datos: null,
            });
        });
    });

    describe('POST /api/v1/categorias', () => {
        it('retorna 400 cuando falta el campo obligatorio nombre', async () => {
            const res = await request(app).post('/api/v1/categorias').send({}).expect(400);

            expect(res.body).toEqual({
                codigo: 400,
                msj: 'El campo nombre es obligatorio',
                datos: null,
            });
        });

        it('retorna 201 y crea una nueva categoría usando nombre como id por defecto', async () => {
            const res = await request(app)
                .post('/api/v1/categorias')
                .send({ nombre: 'Herrería' })
                .expect(201);

            expect(res.body).toEqual({
                codigo: 201,
                msj: 'Categoría creada exitosamente',
                datos: { id: 'Herrería', nombre: 'Herrería' },
            });

            // Limpieza
            await request(app)
                .delete(`/api/v1/categorias/${encodeURIComponent('Herrería')}`)
                .expect(200);
        });
    });

    describe('PUT /api/v1/categorias y PUT /api/v1/categorias/:id', () => {
        it('actualiza una categoría existente por parámetro :id y por body.id', async () => {
            await request(app)
                .post('/api/v1/categorias')
                .send({ id: 'cat-temp', nombre: 'Temporal' })
                .expect(201);

            const resPorParam = await request(app)
                .put('/api/v1/categorias/cat-temp')
                .send({ nombre: 'Temporal Modificada' })
                .expect(200);

            expect(resPorParam.body.datos).toEqual({
                id: 'cat-temp',
                nombre: 'Temporal Modificada',
            });

            const resPorBody = await request(app)
                .put('/api/v1/categorias')
                .send({ id: 'cat-temp', nombre: 'Temporal Final' })
                .expect(200);

            expect(resPorBody.body.datos).toEqual({
                id: 'cat-temp',
                nombre: 'Temporal Final',
            });

            await request(app).delete('/api/v1/categorias/cat-temp').expect(200);
        });

        it('retorna 400 si falta id o nombre, y 404 si la categoría no existe', async () => {
            await request(app).put('/api/v1/categorias').send({ nombre: 'Sin ID' }).expect(400);
            await request(app).put('/api/v1/categorias/Gasista').send({}).expect(400);
            await request(app)
                .put('/api/v1/categorias/NoExiste')
                .send({ nombre: 'Test' })
                .expect(404);
        });
    });

    describe('DELETE /api/v1/categorias y DELETE /api/v1/categorias/:id', () => {
        it('elimina una categoría por parámetro :id y por body.id', async () => {
            await request(app)
                .post('/api/v1/categorias')
                .send({ id: 'del-1', nombre: 'Borrar 1' })
                .expect(201);

            const resDelParam = await request(app).delete('/api/v1/categorias/del-1').expect(200);
            expect(resDelParam.body).toEqual({
                codigo: 200,
                msj: 'Categoría eliminada exitosamente',
                datos: null,
            });

            await request(app)
                .post('/api/v1/categorias')
                .send({ id: 'del-2', nombre: 'Borrar 2' })
                .expect(201);

            const resDelBody = await request(app)
                .delete('/api/v1/categorias')
                .send({ id: 'del-2' })
                .expect(200);
            expect(resDelBody.body).toEqual({
                codigo: 200,
                msj: 'Categoría eliminada exitosamente',
                datos: null,
            });
        });

        it('retorna 400 si no se indica id y 404 si la categoría no existe', async () => {
            await request(app).delete('/api/v1/categorias').send({}).expect(400);
            await request(app).delete('/api/v1/categorias/NoExiste').expect(404);
        });
    });
});
