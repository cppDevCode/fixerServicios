import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { crearApp } from './helpers/crearApp';
import { crearDatosPrestador } from './fixtures/prestadores.fixtures';

const app = crearApp();

describe('API Prestadores - Tests de Integración (/api/v1/prestadores)', () => {
    describe('GET /api/v1/prestadores', () => {
        it('retorna listado paginado por defecto con al menos 15 registros iniciales en total', async () => {
            const res = await request(app).get('/api/v1/prestadores').expect(200);

            expect(res.body.codigo).toBe(200);
            expect(res.body.msj).toBe('Prestadores obtenidos correctamente');
            expect(Array.isArray(res.body.datos)).toBe(true);
            expect(res.body.datos).toHaveLength(10);
            expect(res.body.meta).toEqual({
                pagina: 1,
                limit: 10,
                total: 16,
                totalPages: 2,
            });
            expect(res.body.meta.total).toBeGreaterThanOrEqual(15);
        });

        it('filtra, ordena y pagina con GET /api/v1/prestadores?page=1&limit=10&rubro=Plomería&sortBy=nombre&order=asc', async () => {
            const res = await request(app)
                .get('/api/v1/prestadores')
                .query({
                    page: 1,
                    limit: 10,
                    rubro: 'Plomería',
                    sortBy: 'nombre',
                    order: 'asc',
                })
                .expect(200);

            expect(res.body.codigo).toBe(200);
            expect(res.body.datos).toHaveLength(5);
            expect(res.body.meta).toEqual({
                pagina: 1,
                limit: 10,
                total: 5,
                totalPages: 1,
            });

            const nombres = res.body.datos.map((p: { nombre: string }) => p.nombre);
            expect(nombres).toEqual(['Carlos', 'Diego', 'Fernando', 'Jorge', 'Roberto']);
            expect(
                res.body.datos.every((p: { categoriaId: string }) => p.categoriaId === 'Plomería')
            ).toBe(true);

            const resLocalidad = await request(app)
                .get('/api/v1/prestadores')
                .query({ localidad: 'Córdoba Capital' })
                .expect(200);
            expect(resLocalidad.body.meta.total).toBe(4);
        });

        it('permite búsqueda por texto (search) y ordenamiento descendente por años de experiencia', async () => {
            const res = await request(app)
                .get('/api/v1/prestadores')
                .query({
                    search: 'electric',
                    sortBy: 'aniosExperiencia',
                    order: 'desc',
                })
                .expect(200);

            expect(res.body.codigo).toBe(200);
            expect(res.body.datos).toHaveLength(3);
            const experiencias = res.body.datos.map(
                (p: { aniosExperiencia: number }) => p.aniosExperiencia
            );
            expect(experiencias).toEqual([9, 8, 6]);
        });
    });

    describe('GET /api/v1/prestadores/:id', () => {
        it('retorna 200 y el prestador cuando el id existe', async () => {
            const res = await request(app).get('/api/v1/prestadores/1').expect(200);

            expect(res.body.codigo).toBe(200);
            expect(res.body.msj).toBe('Prestador encontrado');
            expect(res.body.datos).toMatchObject({
                id: 1,
                nombre: 'Carlos',
                apellido: 'Gómez',
                categoriaId: 'Plomería',
            });
        });

        it('retorna 404 cuando el id no existe', async () => {
            const res = await request(app).get('/api/v1/prestadores/9999').expect(404);

            expect(res.body).toEqual({
                codigo: 404,
                msj: 'Prestador con id 9999 no encontrado',
                datos: null,
            });
        });
    });

    describe('POST /api/v1/prestadores', () => {
        it('retorna 400 cuando faltan campos obligatorios (nombre, apellido o categoriaId)', async () => {
            const resSinApellido = await request(app)
                .post('/api/v1/prestadores')
                .send({ nombre: 'Pedro', categoriaId: 'Gasista' })
                .expect(400);

            expect(resSinApellido.body).toEqual({
                codigo: 400,
                msj: 'Los campos nombre, apellido y categoriaId son obligatorios',
                datos: null,
            });
        });

        it('retorna 201 y crea un nuevo prestador correctamente', async () => {
            const nuevoPrestador = crearDatosPrestador({
                nombre: 'Nicolás',
                apellido: 'Cabrera',
                categoriaId: 'Gasista',
            });

            const res = await request(app)
                .post('/api/v1/prestadores')
                .send(nuevoPrestador)
                .expect(201);

            expect(res.body.codigo).toBe(201);
            expect(res.body.msj).toBe('Prestador creado exitosamente');
            expect(res.body.datos).toMatchObject({
                id: expect.any(Number),
                nombre: 'Nicolás',
                apellido: 'Cabrera',
                categoriaId: 'Gasista',
            });

            // Limpieza para mantener el estado en memoria consistente
            await request(app).delete(`/api/v1/prestadores/${res.body.datos.id}`).expect(200);
        });

        it('soporta el ciclo CRUD de fotoUrl (alta con foto, alta sin foto y remoción de foto)', async () => {
            const resConFoto = await request(app)
                .post('/api/v1/prestadores')
                .send(
                    crearDatosPrestador({
                        nombre: 'Ramiro',
                        apellido: 'Foto',
                        fotoUrl: 'https://randomuser.me/api/portraits/men/77.jpg',
                    })
                )
                .expect(201);

            expect(resConFoto.body.datos.fotoUrl).toBe(
                'https://randomuser.me/api/portraits/men/77.jpg'
            );

            // Actualizar quitando la foto (cadena vacía -> undefined)
            const resQuitarFoto = await request(app)
                .put(`/api/v1/prestadores/${resConFoto.body.datos.id}`)
                .send({ fotoUrl: '' })
                .expect(200);

            expect(resQuitarFoto.body.datos.fotoUrl).toBeUndefined();

            await request(app)
                .delete(`/api/v1/prestadores/${resConFoto.body.datos.id}`)
                .expect(200);
        });
    });

    describe('PUT /api/v1/prestadores y PUT /api/v1/prestadores/:id', () => {
        it('actualiza un prestador existente mediante PUT /api/v1/prestadores/:id y PUT /api/v1/prestadores (body.id)', async () => {
            const creado = await request(app)
                .post('/api/v1/prestadores')
                .send(crearDatosPrestador({ nombre: 'Temporal', apellido: 'Update' }))
                .expect(201);

            const idCreado: number = creado.body.datos.id;

            // Vía parámetro en ruta (:id)
            const resPorParam = await request(app)
                .put(`/api/v1/prestadores/${idCreado}`)
                .send({ nombre: 'Temporal Modificado', aniosExperiencia: 11 })
                .expect(200);

            expect(resPorParam.body.codigo).toBe(200);
            expect(resPorParam.body.datos.nombre).toBe('Temporal Modificado');
            expect(resPorParam.body.datos.aniosExperiencia).toBe(11);

            // Vía body en ruta base (/api/v1/prestadores)
            const resPorBody = await request(app)
                .put('/api/v1/prestadores')
                .send({ id: idCreado, ofreceGarantia: false })
                .expect(200);

            expect(resPorBody.body.codigo).toBe(200);
            expect(resPorBody.body.datos.ofreceGarantia).toBe(false);

            // Limpieza
            await request(app).delete(`/api/v1/prestadores/${idCreado}`).expect(200);
        });

        it('retorna 400 si no se envía id y 404 si el prestador a actualizar no existe', async () => {
            const res400 = await request(app)
                .put('/api/v1/prestadores')
                .send({ nombre: 'Sin ID' })
                .expect(400);

            expect(res400.body).toEqual({
                codigo: 400,
                msj: 'Se requiere el id del prestador para actualizar',
                datos: null,
            });

            const res404 = await request(app)
                .put('/api/v1/prestadores/99999')
                .send({ nombre: 'No Existe' })
                .expect(404);

            expect(res404.body).toEqual({
                codigo: 404,
                msj: 'Prestador con id 99999 no encontrado',
                datos: null,
            });
        });
    });

    describe('DELETE /api/v1/prestadores y DELETE /api/v1/prestadores/:id', () => {
        it('elimina un prestador por parámetro :id y por body.id en /api/v1/prestadores', async () => {
            const creado1 = await request(app)
                .post('/api/v1/prestadores')
                .send(crearDatosPrestador({ nombre: 'BorrarPorParam' }))
                .expect(201);

            const resDelParam = await request(app)
                .delete(`/api/v1/prestadores/${creado1.body.datos.id}`)
                .expect(200);

            expect(resDelParam.body).toEqual({
                codigo: 200,
                msj: 'Prestador eliminado exitosamente',
                datos: null,
            });

            const creado2 = await request(app)
                .post('/api/v1/prestadores')
                .send(crearDatosPrestador({ nombre: 'BorrarPorBody' }))
                .expect(201);

            const resDelBody = await request(app)
                .delete('/api/v1/prestadores')
                .send({ id: creado2.body.datos.id })
                .expect(200);

            expect(resDelBody.body).toEqual({
                codigo: 200,
                msj: 'Prestador eliminado exitosamente',
                datos: null,
            });
        });

        it('retorna 400 si no se indica id y 404 si el prestador a eliminar no existe', async () => {
            const res400 = await request(app)
                .delete('/api/v1/prestadores')
                .send({})
                .expect(400);

            expect(res400.body).toEqual({
                codigo: 400,
                msj: 'Se requiere el id del prestador para eliminar',
                datos: null,
            });

            const res404 = await request(app)
                .delete('/api/v1/prestadores/99999')
                .expect(404);

            expect(res404.body).toEqual({
                codigo: 404,
                msj: 'Prestador con id 99999 no encontrado',
                datos: null,
            });
        });
    });
});
