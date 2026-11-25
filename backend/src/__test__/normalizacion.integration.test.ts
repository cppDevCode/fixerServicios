import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { crearApp } from './helpers/crearApp';

const app = crearApp();

describe('Normalización 3FN e Integridad Referencial - Tests de Integración', () => {
    it('[⚠1] unifica PK/FK numéricas entre USUARIO, UBICACION, PRESTADOR y RESENA y valida FKs al crear reseñas', async () => {
        const resUsuarios = await request(app)
            .get('/api/v1/usuarios')
            .set('x-usuario-rol', 'ADMIN')
            .expect(200);

        expect(resUsuarios.body.data.length).toBeGreaterThanOrEqual(7);
        for (const u of resUsuarios.body.data) {
            expect(typeof u.id).toBe('number');
            expect(u.passwordHash).toBeUndefined();
            expect(u.respuestaSecretaHash).toBeUndefined();
            if (u.ubicacionId !== undefined) {
                expect(typeof u.ubicacionId).toBe('number');
            }
        }

        // Integridad referencial: rechaza reseña con usuarioId o prestadorId inexistente
        await request(app)
            .post('/api/v1/resenas')
            .send({
                prestadorId: 9999,
                usuarioId: 3,
                calificacion: 5,
                comentario: 'Prestador inexistente',
            })
            .expect(400);

        await request(app)
            .post('/api/v1/resenas')
            .send({
                prestadorId: 1,
                usuarioId: 9999,
                calificacion: 5,
                comentario: 'Usuario inexistente',
            })
            .expect(400);
    });

    it('[⚠2] normaliza geografía en UBICACION compartida por USUARIO y PRESTADOR', async () => {
        // Actualizar códigoPostal y radio en usuario actualiza su ubicacionId normalizada
        const resUpdateUser = await request(app)
            .patch('/api/v1/usuarios/3')
            .send({ codigoPostal: '2001', radio: 25 })
            .expect(200);

        expect(typeof resUpdateUser.body.data.ubicacionId).toBe('number');
        expect(resUpdateUser.body.data.codigoPostal).toBe('2001');
        expect(resUpdateUser.body.data.radio).toBe(25);
        expect(resUpdateUser.body.data.ubicacion).toMatchObject({
            codigoPostal: '2001',
            radio: 25,
        });
        expect(resUpdateUser.body.data.codigopostal).toBeUndefined();

        // Restaurar usuario 3 a ubicación 3 original
        await request(app)
            .patch('/api/v1/usuarios/3')
            .send({ ubicacionId: 3 })
            .expect(200);

        // Crear prestador con provincia/localidad/radio crea o enlaza una ubicacionId normalizada
        const resCrearPrest = await request(app)
            .post('/api/v1/prestadores')
            .send({
                nombre: 'Germán',
                apellido: 'Lagos',
                categoriaId: 2,
                provincia: 'Mendoza',
                localidad: 'San Rafael',
                codigoPostal: '5600',
                radio: 18,
                aniosExperiencia: 7,
                acercaDe: 'Instalaciones domiciliarias',
                ofreceGarantia: true,
                telefono: { codPais: '+54', codArea: '260', nroTelefono: '4551234' },
            })
            .expect(201);

        expect(typeof resCrearPrest.body.datos.ubicacionId).toBe('number');
        expect(resCrearPrest.body.datos.provincia).toBe('Mendoza');
        expect(resCrearPrest.body.datos.localidad).toBe('San Rafael');
        expect(resCrearPrest.body.datos.codigoPostal).toBe('5600');
        expect(resCrearPrest.body.datos.radio).toBe(18);

        await request(app)
            .delete(`/api/v1/prestadores/${resCrearPrest.body.datos.id}`)
            .expect(200);
    });

    it('[⚠3] CATEGORIA usa clave subrogada inmutable (id: number) + slug único y aplica ON DELETE RESTRICT', async () => {
        // No permite borrar categoría en uso por prestadores
        await request(app).delete('/api/v1/categorias/1').expect(409);

        // Crear prestador con categoría inexistente -> 400
        await request(app)
            .post('/api/v1/prestadores')
            .send({
                nombre: 'SinCat',
                apellido: 'Test',
                categoriaId: 9999,
                aniosExperiencia: 1,
                acercaDe: 'Prueba',
                ofreceGarantia: false,
                telefono: { codPais: '+54', codArea: '11', nroTelefono: '40009999' },
            })
            .expect(400);
    });

    it('[⚠4] ratingPromedio de PRESTADOR se calcula dinámicamente desde RESENA y no se persiste manualmente', async () => {
        // Crear prestador intentando inyectar ratingPromedio: 5.0 -> debe ignorarse (sin reseñas => undefined)
        const creado = await request(app)
            .post('/api/v1/prestadores')
            .send({
                nombre: 'Rating',
                apellido: 'Dinamico',
                categoriaId: 1,
                ubicacionId: 1,
                aniosExperiencia: 5,
                acercaDe: 'Test rating derivado',
                ofreceGarantia: true,
                ratingPromedio: 5.0,
                telefono: { codPais: '+54', codArea: '11', nroTelefono: '41112222' },
            })
            .expect(201);

        const prestadorId = creado.body.datos.id;
        expect(creado.body.datos.ratingPromedio).toBeUndefined();

        // Agregar dos reseñas (5 y 4) -> promedio dinámico = 4.5
        const r1 = await request(app)
            .post('/api/v1/resenas')
            .send({
                prestadorId,
                usuarioId: 3,
                calificacion: 5,
                comentario: 'Impecable',
            })
            .expect(201);

        const r2 = await request(app)
            .post('/api/v1/resenas')
            .send({
                prestadorId,
                usuarioId: 4,
                calificacion: 4,
                comentario: 'Muy bien',
            })
            .expect(201);

        const detalle = await request(app)
            .get(`/api/v1/prestadores/${prestadorId}`)
            .expect(200);
        expect(detalle.body.datos.ratingPromedio).toBe(4.5);

        // Editar r2 a calificación 3 -> promedio dinámico = 4.0
        await request(app)
            .put(`/api/v1/resenas/${r2.body.datos.id}`)
            .send({ calificacion: 3, comentario: 'Correcto' })
            .expect(200);

        const detalleEditado = await request(app)
            .get(`/api/v1/prestadores/${prestadorId}`)
            .expect(200);
        expect(detalleEditado.body.datos.ratingPromedio).toBe(4);

        // Eliminar prestador elimina en cascada sus reseñas (ON DELETE CASCADE)
        await request(app).delete(`/api/v1/prestadores/${prestadorId}`).expect(200);
        await request(app).get(`/api/v1/resenas/${r1.body.datos.id}`).expect(404);
        await request(app).get(`/api/v1/resenas/${r2.body.datos.id}`).expect(404);
    });
});
