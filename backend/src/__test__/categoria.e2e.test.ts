import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { crearApp } from './helpers/crearApp';
import { ICategoria } from '../interfaces/categoria.interface';
import { RespuestaApi } from '../interfaces/respuestaApi.interface';

describe('Módulo Categorías - Tests End-to-End (E2E)', () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async () => {
        const app = crearApp();
        await new Promise<void>((resolve) => {
            server = app.listen(0, () => {
                const { port } = server.address() as AddressInfo;
                baseUrl = `http://127.0.0.1:${port}/api/v1/categorias`;
                resolve();
            });
        });
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    });

    it('recorre el ciclo de vida completo de una categoría: listado -> alta -> búsqueda -> detalle -> edición -> baja', async () => {
        const resInicial = await fetch(baseUrl);
        expect(resInicial.status).toBe(200);
        const bodyInicial = (await resInicial.json()) as RespuestaApi<ICategoria[]>;
        expect(bodyInicial.datos).toHaveLength(9);

        const resCrear = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'Domotica', nombre: 'Domótica e IoT' }),
        });
        expect(resCrear.status).toBe(201);

        const resBusqueda = await fetch(`${baseUrl}?search=domotica`);
        expect(resBusqueda.status).toBe(200);
        const bodyBusqueda = (await resBusqueda.json()) as RespuestaApi<ICategoria[]>;
        expect(bodyBusqueda.datos).toEqual([{ id: 'Domotica', nombre: 'Domótica e IoT' }]);

        const resDetalle = await fetch(`${baseUrl}/Domotica`);
        expect(resDetalle.status).toBe(200);

        const resActualizar = await fetch(`${baseUrl}/Domotica`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'Domótica Residencial' }),
        });
        expect(resActualizar.status).toBe(200);
        const bodyActualizar = (await resActualizar.json()) as RespuestaApi<ICategoria>;
        expect(bodyActualizar.datos.nombre).toBe('Domótica Residencial');

        const resEliminar = await fetch(`${baseUrl}/Domotica`, {
            method: 'DELETE',
        });
        expect(resEliminar.status).toBe(200);

        const resNoExiste = await fetch(`${baseUrl}/Domotica`);
        expect(resNoExiste.status).toBe(404);
    });
});
