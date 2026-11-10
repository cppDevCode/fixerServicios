import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Servidor } from '../../../backend/src/core/Servidor';
import {
    actualizarPrestador,
    crearPrestador,
    eliminarPrestador,
    obtenerCategorias,
    obtenerPrestadores,
    obtenerPrestadorPorId,
} from '../../services/prestador.service';
import { generarArchivoCatalogo } from '../../services/exportarCatalogo.service';

describe('Módulo Prestadores (Frontend <-> Backend) - Tests de Integración', () => {
    let server: Server;
    let apiBaseUrl: string;

    beforeAll(async () => {
        const app = new Servidor().obtenerApp();
        await new Promise<void>((resolve) => {
            server = app.listen(0, () => {
                const { port } = server.address() as AddressInfo;
                apiBaseUrl = `http://127.0.0.1:${port}/api/v1`;
                resolve();
            });
        });
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    });

    it('integra obtenerCategorias con GET /api/v1/categorias y filtrado normalizado', async () => {
        const todas = await obtenerCategorias(undefined, apiBaseUrl);
        expect(todas.codigo).toBe(200);
        expect(todas.datos).toHaveLength(9);

        const filtrada = await obtenerCategorias('plomeria', apiBaseUrl);
        expect(filtrada.datos).toEqual([{ id: 'Plomería', nombre: 'Plomería' }]);
    });

    it('integra obtenerPrestadores con paginación dinámica, filtro de rubro, búsqueda y ordenamiento', async () => {
        const paginaInicial = await obtenerPrestadores(
            { page: 1, limit: 5 },
            apiBaseUrl
        );
        expect(paginaInicial.codigo).toBe(200);
        expect(paginaInicial.datos).toHaveLength(5);
        expect(paginaInicial.meta).toEqual({
            pagina: 1,
            limit: 5,
            total: 16,
            totalPages: 4,
        });

        const plomerosPorExp = await obtenerPrestadores(
            {
                rubro: 'Plomería',
                sortBy: 'aniosExperiencia',
                order: 'desc',
            },
            apiBaseUrl
        );
        expect(plomerosPorExp.meta?.total).toBe(5);
        expect(plomerosPorExp.datos[0].nombre).toBe('Roberto');
        expect(plomerosPorExp.datos[0].aniosExperiencia).toBe(18);

        const busquedaSinTilde = await obtenerPrestadores(
            { search: 'gomez' },
            apiBaseUrl
        );
        expect(busquedaSinTilde.meta?.total).toBe(1);
        expect(busquedaSinTilde.datos[0].id).toBe(1);
    });

    it('integra el ciclo completo de alta, detalle, actualización, baja y manejo de errores (400/404)', async () => {
        const creado = await crearPrestador(
            {
                nombre: 'Luciano',
                apellido: 'Peralta',
                matricula: 'MAT-3050',
                aniosExperiencia: 9,
                acercaDe: 'Instalación de tableros trifásicos y puesta a tierra',
                ofreceGarantia: true,
                categoriaId: 'Electricidad',
                telefono: {
                    codPais: '+54',
                    codArea: '11',
                    nroTelefono: '47778888',
                },
                ratingPromedio: 4.9,
            },
            apiBaseUrl
        );

        expect(creado.codigo).toBe(201);
        const idNuevo = creado.datos.id;

        const detalle = await obtenerPrestadorPorId(idNuevo, apiBaseUrl);
        expect(detalle.codigo).toBe(200);
        expect(detalle.datos.nombre).toBe('Luciano');
        expect(detalle.datos.matricula).toBe('MAT-3050');

        const editado = await actualizarPrestador(
            idNuevo,
            { aniosExperiencia: 12, ofreceGarantia: false },
            apiBaseUrl
        );
        expect(editado.codigo).toBe(200);
        expect(editado.datos.aniosExperiencia).toBe(12);
        expect(editado.datos.ofreceGarantia).toBe(false);

        const eliminado = await eliminarPrestador(idNuevo, apiBaseUrl);
        expect(eliminado.codigo).toBe(200);

        await expect(
            obtenerPrestadorPorId(idNuevo, apiBaseUrl)
        ).rejects.toThrow(`Prestador con id ${idNuevo} no encontrado`);
    });

    it('integra la consulta filtrada de prestadores con la generación de archivos .pdf y .xlsx', async () => {
        const respuesta = await obtenerPrestadores(
            { rubro: 'Plomería', sortBy: 'nombre', order: 'asc' },
            apiBaseUrl
        );

        const reportePdf = generarArchivoCatalogo(respuesta.datos, 'pdf');
        expect(reportePdf.nombreArchivo).toBe('catalogo-prestadores.pdf');
        expect(reportePdf.totalRegistros).toBe(5);
        expect(reportePdf.contenido).toContain('Carlos Gomez');
        expect(reportePdf.contenido).toContain('Roberto Silva');

        const reporteXlsx = generarArchivoCatalogo(respuesta.datos, 'xlsx');
        expect(reporteXlsx.nombreArchivo).toBe('catalogo-prestadores.xlsx');
        expect(reporteXlsx.totalRegistros).toBe(5);
        expect(reporteXlsx.contenido).toContain('<Data ss:Type="String">Carlos</Data>');
        expect(reporteXlsx.contenido).toContain('<Data ss:Type="String">Roberto</Data>');
    });
});
