import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { IPrestador } from '../../interfaces/prestador.interface';
import {
    actualizarPrestador,
    CATEGORIAS_POR_DEFECTO,
    construirQueryPrestadores,
    crearPrestador,
    eliminarPrestador,
    obtenerCategorias,
    obtenerPrestadores,
    obtenerPrestadorPorId,
} from '../../services/prestador.service';
import {
    escaparXml,
    exportarCatalogoPrestadores,
    formatearTelefonoPrestador,
    generarArchivoCatalogo,
    generarContenidoPdf,
    generarContenidoXlsx,
    sanitizarTextoPdf,
} from '../../services/exportarCatalogo.service';
import { FormularioPrestador } from '../../components/prestadores/FormularioPrestador';
import { ListadoPrestadores } from '../../components/prestadores/ListadoPrestadores';

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

const prestadorMock: IPrestador = {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Gómez',
    matricula: 'MAT-1001',
    aniosExperiencia: 10,
    acercaDe: 'Especialista en cañerías y filtraciones urgentes',
    ofreceGarantia: true,
    categoriaId: 'Plomería',
    telefono: {
        codPais: '+54',
        codArea: '11',
        nroTelefono: '40001001',
    },
    ratingPromedio: 4.8,
};

describe('Módulo Prestadores (Frontend) - Tests Unitarios', () => {
    describe('prestador.service.ts (Construcción de queries y cliente HTTP)', () => {
        beforeEach(() => {
            vi.restoreAllMocks();
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('construirQueryPrestadores serializa solo filtros válidos y omite cadenas vacías', () => {
            expect(construirQueryPrestadores({})).toBe('');

            const query = construirQueryPrestadores({
                page: 2,
                limit: 15,
                rubro: '  Plomería ',
                search: '  Carlos ',
                sortBy: 'aniosExperiencia',
                order: 'desc',
            });

            const params = new URLSearchParams(query);
            expect(params.get('page')).toBe('2');
            expect(params.get('limit')).toBe('15');
            expect(params.get('rubro')).toBe('Plomería');
            expect(params.get('search')).toBe('Carlos');
            expect(params.get('sortBy')).toBe('aniosExperiencia');
            expect(params.get('order')).toBe('desc');
        });

        it('obtenerPrestadores realiza GET con query params y retorna RespuestaApi<IPrestador[]>', async () => {
            const respuestaMock = {
                codigo: 200,
                msj: 'Prestadores obtenidos correctamente',
                datos: [prestadorMock],
                meta: { pagina: 1, limit: 10, total: 1, totalPages: 1 },
            };

            const fetchSpy = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => respuestaMock,
            });
            vi.stubGlobal('fetch', fetchSpy);

            const resultado = await obtenerPrestadores({
                page: 1,
                limit: 10,
                rubro: 'Plomería',
            });

            expect(fetchSpy).toHaveBeenCalledWith(
                '/api/v1/prestadores?page=1&limit=10&rubro=Plomer%C3%ADa'
            );
            expect(resultado).toEqual(respuestaMock);
        });

        it('obtenerPrestadores lanza Error descriptivo cuando la respuesta HTTP no es exitosa', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue({
                    ok: false,
                    json: async () => ({
                        codigo: 500,
                        msj: 'Error interno al consultar catálogo',
                        datos: null,
                    }),
                })
            );

            await expect(obtenerPrestadores()).rejects.toThrow(
                'Error interno al consultar catálogo'
            );
        });

        it('obtenerPrestadorPorId retorna el prestador en 200 y lanza Error en 404', async () => {
            const fetchSpy = vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        codigo: 200,
                        msj: 'Prestador encontrado',
                        datos: prestadorMock,
                    }),
                })
                .mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({
                        codigo: 404,
                        msj: 'Prestador con id 999 no encontrado',
                        datos: null,
                    }),
                });
            vi.stubGlobal('fetch', fetchSpy);

            const ok = await obtenerPrestadorPorId(1);
            expect(ok.datos).toEqual(prestadorMock);

            await expect(obtenerPrestadorPorId(999)).rejects.toThrow(
                'Prestador con id 999 no encontrado'
            );
        });

        it('crearPrestador, actualizarPrestador y eliminarPrestador envían métodos y payloads correctos', async () => {
            const fetchSpy = vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        codigo: 201,
                        msj: 'Prestador creado exitosamente',
                        datos: { ...prestadorMock, id: 17 },
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        codigo: 200,
                        msj: 'Prestador actualizado exitosamente',
                        datos: { ...prestadorMock, id: 17, aniosExperiencia: 14 },
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        codigo: 200,
                        msj: 'Prestador eliminado exitosamente',
                        datos: null,
                    }),
                });
            vi.stubGlobal('fetch', fetchSpy);

            const { id: _id, ...datosCrear } = prestadorMock;
            void _id;

            const creado = await crearPrestador(datosCrear);
            expect(creado.datos.id).toBe(17);
            expect(fetchSpy).toHaveBeenNthCalledWith(1, '/api/v1/prestadores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCrear),
            });

            const actualizado = await actualizarPrestador(17, {
                aniosExperiencia: 14,
            });
            expect(actualizado.datos.aniosExperiencia).toBe(14);
            expect(fetchSpy).toHaveBeenNthCalledWith(
                2,
                '/api/v1/prestadores/17',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ aniosExperiencia: 14 }),
                }
            );

            const eliminado = await eliminarPrestador(17);
            expect(eliminado.codigo).toBe(200);
            expect(fetchSpy).toHaveBeenNthCalledWith(
                3,
                '/api/v1/prestadores/17',
                {
                    method: 'DELETE',
                }
            );
        });

        it('obtenerCategorias consulta /api/v1/categorias con o sin filtro search y dispone de 9 categorías por defecto', async () => {
            expect(CATEGORIAS_POR_DEFECTO).toHaveLength(9);

            const fetchSpy = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    codigo: 200,
                    msj: 'Categorías obtenidas correctamente',
                    datos: [{ id: 'Plomería', nombre: 'Plomería' }],
                }),
            });
            vi.stubGlobal('fetch', fetchSpy);

            const res = await obtenerCategorias('plomeria');
            expect(fetchSpy).toHaveBeenCalledWith(
                '/api/v1/categorias?search=plomeria'
            );
            expect(res.datos).toEqual([{ id: 'Plomería', nombre: 'Plomería' }]);
        });
    });

    describe('exportarCatalogo.service.ts (Formateo y exportación en .pdf y .xlsx)', () => {
        it('formatearTelefonoPrestador formatea teléfono estructurado y maneja teléfonos vacíos', () => {
            expect(
                formatearTelefonoPrestador({
                    codPais: '+54',
                    codArea: '11',
                    nroTelefono: '40001001',
                })
            ).toBe('+54 11 40001001');

            expect(
                formatearTelefonoPrestador({
                    codPais: '+54',
                    codArea: '11',
                    nroTelefono: '   ',
                })
            ).toBe('Sin teléfono');
            expect(formatearTelefonoPrestador(undefined)).toBe('Sin teléfono');
        });

        it('sanitizarTextoPdf y escaparXml normalizan caracteres especiales', () => {
            expect(sanitizarTextoPdf('Plomería (Cañerías)')).toBe(
                'Plomeria \\(Canerias\\)'
            );
            expect(escaparXml('Gas & Agua <24hs> "Urgencias"')).toBe(
                'Gas &amp; Agua &lt;24hs&gt; &quot;Urgencias&quot;'
            );
        });

        it('generarContenidoPdf construye un documento PDF 1.4 válido con los registros del catálogo', () => {
            const pdf = generarContenidoPdf([prestadorMock]);

            expect(pdf.startsWith('%PDF-1.4')).toBe(true);
            expect(pdf.endsWith('%%EOF')).toBe(true);
            expect(pdf).toContain('Fixer Servicios - Catalogo de Prestadores');
            expect(pdf).toContain('#1 Carlos Gomez | Plomeria | Mat: MAT-1001');
        });

        it('generarContenidoXlsx construye un libro SpreadsheetML XML válido con encabezados y filas', () => {
            const xlsx = generarContenidoXlsx([prestadorMock]);

            expect(xlsx).toContain('<?mso-application progid="Excel.Sheet"?>');
            expect(xlsx).toContain('<Worksheet ss:Name="Catálogo Prestadores">');
            expect(xlsx).toContain('<Data ss:Type="String">Carlos</Data>');
            expect(xlsx).toContain('<Data ss:Type="String">Gómez</Data>');
            expect(xlsx).toContain('<Data ss:Type="String">MAT-1001</Data>');
            expect(xlsx).toContain('<Data ss:Type="Number">10</Data>');
        });

        it('generarArchivoCatalogo y exportarCatalogoPrestadores retornan metadatos exactos para .pdf y .xlsx', () => {
            const archivoPdf = generarArchivoCatalogo([prestadorMock], 'pdf');
            expect(archivoPdf.nombreArchivo).toBe('catalogo-prestadores.pdf');
            expect(archivoPdf.mimeType).toBe('application/pdf');
            expect(archivoPdf.totalRegistros).toBe(1);

            const archivoXlsx = exportarCatalogoPrestadores(
                [prestadorMock],
                'xlsx'
            );
            expect(archivoXlsx.nombreArchivo).toBe('catalogo-prestadores.xlsx');
            expect(archivoXlsx.mimeType).toBe(
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            expect(archivoXlsx.totalRegistros).toBe(1);
        });
    });

    describe('Componentes UI (FormularioPrestador y ListadoPrestadores)', () => {
        it('FormularioPrestador renderiza campos vacíos en alta y campos precargados en edición', () => {
            const htmlAlta = renderToStaticMarkup(
                createElement(FormularioPrestador, {
                    titulo: 'Alta de prestador',
                })
            );
            expect(htmlAlta).toContain('Alta de prestador');
            expect(htmlAlta).toContain('Crear prestador');

            const htmlEdicion = renderToStaticMarkup(
                createElement(FormularioPrestador, {
                    prestadorInicial: prestadorMock,
                })
            );
            expect(htmlEdicion).toContain('value="Carlos"');
            expect(htmlEdicion).toContain('value="Gómez"');
            expect(htmlEdicion).toContain('value="MAT-1001"');
            expect(htmlEdicion).toContain('Guardar cambios');
        });

        it('ListadoPrestadores renderiza la tabla paginada, filtros, selector de filas y botón Exportar Catálogo', () => {
            const htmlListado = renderToStaticMarkup(
                createElement(ListadoPrestadores, {
                    prestadoresIniciales: [prestadorMock],
                    categoriasIniciales: CATEGORIAS_POR_DEFECTO,
                })
            );

            expect(htmlListado).toContain('Carlos Gómez');
            expect(htmlListado).toContain('MAT-1001');
            expect(htmlListado).toContain('10 años');
            expect(htmlListado).toContain('+54 11 40001001');
            expect(htmlListado).toContain('Exportar Catálogo');
            expect(htmlListado).toContain('Total: 1 registros');
        });
    });
});
