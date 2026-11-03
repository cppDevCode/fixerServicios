import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { crearApp } from './helpers/crearApp';
import { IPrestador } from '../interfaces/prestador.interface';
import { RespuestaApi } from '../interfaces/respuestaApi.interface';

describe('Módulo Prestadores - Tests End-to-End (E2E)', () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async () => {
        const app = crearApp();
        await new Promise<void>((resolve) => {
            server = app.listen(0, () => {
                const { port } = server.address() as AddressInfo;
                baseUrl = `http://127.0.0.1:${port}/api/v1/prestadores`;
                resolve();
            });
        });
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    });

    it('recorre el ciclo de vida completo de un prestador: listado inicial -> alta -> búsqueda y filtro -> detalle -> edición -> baja', async () => {
        // 1. Verificar estado inicial paginado (>= 15 registros iniciales)
        const resInicial = await fetch(`${baseUrl}?page=1&limit=10`);
        expect(resInicial.status).toBe(200);
        const bodyInicial = (await resInicial.json()) as RespuestaApi<IPrestador[]>;
        expect(bodyInicial.meta?.total).toBe(16);
        expect(bodyInicial.meta?.totalPages).toBe(2);
        expect(bodyInicial.datos).toHaveLength(10);

        // 2. Dar de alta un nuevo prestador de Plomería (POST /api/v1/prestadores)
        const nuevoPrestadorPayload = {
            nombre: 'Aarón',
            apellido: 'Zeballos',
            matricula: 'MAT-2099',
            aniosExperiencia: 19,
            acercaDe: 'Termofusión de alta presión y detección ultrasónica de fugas',
            ofreceGarantia: true,
            categoriaId: 'Plomería',
            telefono: {
                codPais: '+54',
                codArea: '11',
                nroTelefono: '49998888',
            },
            ratingPromedio: 4.95,
        };

        const resCrear = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPrestadorPayload),
        });
        expect(resCrear.status).toBe(201);
        const bodyCrear = (await resCrear.json()) as RespuestaApi<IPrestador>;
        const idCreado = bodyCrear.datos.id;
        expect(idCreado).toBeGreaterThanOrEqual(17);

        // 3. Consultar con los filtros del enunciado:
        // GET /api/v1/prestadores?page=1&limit=10&rubro=Plomería&sortBy=nombre&order=asc
        const queryEnunciado = new URLSearchParams({
            page: '1',
            limit: '10',
            rubro: 'Plomería',
            sortBy: 'nombre',
            order: 'asc',
        });
        const resRubro = await fetch(`${baseUrl}?${queryEnunciado.toString()}`);
        expect(resRubro.status).toBe(200);
        const bodyRubro = (await resRubro.json()) as RespuestaApi<IPrestador[]>;
        expect(bodyRubro.meta?.total).toBe(6);
        // "Aarón" debe ubicarse primero al ordenar ascendentemente por nombre
        expect(bodyRubro.datos[0].id).toBe(idCreado);
        expect(bodyRubro.datos[0].nombre).toBe('Aarón');

        // 4. Buscar por texto libre (search) ignorando tildes y mayúsculas
        const resBusqueda = await fetch(`${baseUrl}?search=ultrasonica`);
        expect(resBusqueda.status).toBe(200);
        const bodyBusqueda = (await resBusqueda.json()) as RespuestaApi<IPrestador[]>;
        expect(bodyBusqueda.meta?.total).toBe(1);
        expect(bodyBusqueda.datos[0].id).toBe(idCreado);

        // 5. Consultar detalle por ID (GET /api/v1/prestadores/:id)
        const resDetalle = await fetch(`${baseUrl}/${idCreado}`);
        expect(resDetalle.status).toBe(200);
        const bodyDetalle = (await resDetalle.json()) as RespuestaApi<IPrestador>;
        expect(bodyDetalle.datos).toMatchObject(nuevoPrestadorPayload);

        // 6. Actualizar el prestador (PUT /api/v1/prestadores/:id)
        const resActualizar = await fetch(`${baseUrl}/${idCreado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aniosExperiencia: 22,
                acercaDe: 'Especialista senior en termofusión y bombas presurizadoras',
            }),
        });
        expect(resActualizar.status).toBe(200);
        const bodyActualizar = (await resActualizar.json()) as RespuestaApi<IPrestador>;
        expect(bodyActualizar.datos.aniosExperiencia).toBe(22);

        // Confirmar que la actualización persiste en memoria al volver a consultar por ID
        const resDetalleActualizado = await fetch(`${baseUrl}/${idCreado}`);
        const bodyDetalleActualizado =
            (await resDetalleActualizado.json()) as RespuestaApi<IPrestador>;
        expect(bodyDetalleActualizado.datos.aniosExperiencia).toBe(22);
        expect(bodyDetalleActualizado.datos.acercaDe).toContain('Especialista senior');

        // 7. Eliminar el prestador (DELETE /api/v1/prestadores/:id)
        const resEliminar = await fetch(`${baseUrl}/${idCreado}`, {
            method: 'DELETE',
        });
        expect(resEliminar.status).toBe(200);

        // Confirmar que ya no existe (404) y que el total volvió a 16
        const resDetalleEliminado = await fetch(`${baseUrl}/${idCreado}`);
        expect(resDetalleEliminado.status).toBe(404);

        const resFinal = await fetch(`${baseUrl}?page=1&limit=10`);
        const bodyFinal = (await resFinal.json()) as RespuestaApi<IPrestador[]>;
        expect(bodyFinal.meta?.total).toBe(16);
    });

    it('recorre todas las páginas manteniendo consistencia de ordenamiento y sin duplicar registros', async () => {
        const limit = 5;
        const acumulado: IPrestador[] = [];

        for (let page = 1; page <= 4; page++) {
            const res = await fetch(
                `${baseUrl}?page=${page}&limit=${limit}&sortBy=aniosExperiencia&order=desc`
            );
            expect(res.status).toBe(200);
            const body = (await res.json()) as RespuestaApi<IPrestador[]>;
            expect(body.meta?.pagina).toBe(page);
            expect(body.meta?.totalPages).toBe(4);
            acumulado.push(...body.datos);
        }

        expect(acumulado).toHaveLength(16);

        // Verificar que todos los IDs son únicos entre páginas
        const idsUnicos = new Set(acumulado.map((p) => p.id));
        expect(idsUnicos.size).toBe(16);

        // Verificar que el orden descendente por años de experiencia se mantiene en toda la secuencia
        for (let i = 1; i < acumulado.length; i++) {
            expect(acumulado[i - 1].aniosExperiencia).toBeGreaterThanOrEqual(
                acumulado[i].aniosExperiencia
            );
        }
    });
});
