import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ExcelJS from 'exceljs';
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
    exportarCatalogoPrestadores,
    formatearTelefonoPrestador,
    generarArchivoCatalogo,
    generarContenidoPdf,
    generarExcelCatalogo,
    sanitizarTextoPdf,
} from '../../services/exportarCatalogo.service';
import {
    AvatarPrestador,
    SILUETA_PERSONA_DATA_URI,
} from '../../components/prestadores/AvatarPrestador';
import { CatalogoPrestadoresUsuario } from '../../components/prestadores/CatalogoPrestadoresUsuario';
import { FormularioPrestador } from '../../components/prestadores/FormularioPrestador';
import { ListadoPrestadores } from '../../components/prestadores/ListadoPrestadores';
import {
    calcularCantidadResenas,
    obtenerTituloEspecialidad,
    TarjetaCatalogoPrestador,
} from '../../components/prestadores/TarjetaCatalogoPrestador';
import {
    inferirProvinciaDeLocalidad,
    obtenerLocalidadesPorProvincia,
    PROVINCIAS_ARGENTINA,
    TODAS_LAS_LOCALIDADES_ARGENTINA,
} from '../../services/ubicacionesArgentina';
import {
    calcularCategoriasMasBuscadas,
    HomePage,
} from '../../pages/HomePage';

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
    localidad: 'Córdoba Capital',
    telefono: {
        codPais: '+54',
        codArea: '11',
        nroTelefono: '40001001',
    },
    ratingPromedio: 4.8,
    fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
};

const prestadorSinFotoMock: IPrestador = {
    ...prestadorMock,
    id: 4,
    nombre: 'Ana',
    apellido: 'López',
    fotoUrl: undefined,
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
                localidad: '  Córdoba Capital ',
                search: '  Carlos ',
                sortBy: 'aniosExperiencia',
                order: 'desc',
            });

            const params = new URLSearchParams(query);
            expect(params.get('page')).toBe('2');
            expect(params.get('limit')).toBe('15');
            expect(params.get('rubro')).toBe('Plomería');
            expect(params.get('localidad')).toBe('Córdoba Capital');
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

    describe('exportarCatalogo.service.ts (Formateo y exportación en .pdf y .xlsx con ExcelJS)', () => {
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

        it('sanitizarTextoPdf normaliza tildes y escapa delimitadores PDF', () => {
            expect(sanitizarTextoPdf('Plomería (Cañerías)')).toBe(
                'Plomeria \\(Canerias\\)'
            );
        });

        it('generarContenidoPdf construye un documento PDF 1.4 válido con los registros del catálogo', () => {
            const pdf = generarContenidoPdf([prestadorMock]);

            expect(pdf.startsWith('%PDF-1.4')).toBe(true);
            expect(pdf.endsWith('%%EOF')).toBe(true);
            expect(pdf).toContain('Fixer Servicios - Catalogo de Prestadores');
            expect(pdf).toContain('#1 Carlos Gomez | Plomeria | Mat: MAT-1001');
        });

        it('generarExcelCatalogo construye un libro ExcelJS binario válido con hojas Catálogo Prestadores y Resumen', async () => {
            const buffer = await generarExcelCatalogo([prestadorMock]);

            const libro = new ExcelJS.Workbook();
            await libro.xlsx.load(buffer);

            const hojaCatalogo = libro.getWorksheet('Catálogo Prestadores');
            expect(hojaCatalogo).toBeDefined();
            expect(hojaCatalogo?.getRow(1).font?.bold).toBe(true);
            expect(hojaCatalogo?.getRow(2).getCell(1).value).toBe(1);
            expect(hojaCatalogo?.getRow(2).getCell(2).value).toBe('Carlos');
            expect(hojaCatalogo?.getRow(2).getCell(3).value).toBe('Gómez');
            expect(hojaCatalogo?.getRow(2).getCell(4).value).toBe('Plomería');
            expect(hojaCatalogo?.getRow(2).getCell(5).value).toBe('MAT-1001');
            expect(hojaCatalogo?.getRow(2).getCell(6).value).toBe(10);

            const hojaResumen = libro.getWorksheet('Resumen');
            expect(hojaResumen).toBeDefined();
            expect(hojaResumen?.getRow(2).getCell(2).value).toBe(1);
        });

        it('generarArchivoCatalogo y exportarCatalogoPrestadores retornan metadatos exactos para .pdf y .xlsx', async () => {
            const archivoPdf = await generarArchivoCatalogo(
                [prestadorMock],
                'pdf'
            );
            expect(archivoPdf.nombreArchivo).toBe('catalogo-prestadores.pdf');
            expect(archivoPdf.mimeType).toBe('application/pdf');
            expect(archivoPdf.totalRegistros).toBe(1);

            const archivoXlsx = await exportarCatalogoPrestadores(
                [prestadorMock],
                'xlsx'
            );
            expect(archivoXlsx.nombreArchivo).toBe('catalogo-prestadores.xlsx');
            expect(archivoXlsx.mimeType).toBe(
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            expect(archivoXlsx.totalRegistros).toBe(1);
            expect(archivoXlsx.contenido).toBeInstanceOf(Uint8Array);
        });
    });

    describe('Componentes UI (AvatarPrestador, FormularioPrestador y ListadoPrestadores)', () => {
        it('AvatarPrestador muestra la foto del profesional cuando tiene fotoUrl y la silueta de persona cuando no tiene foto', () => {
            const htmlConFoto = renderToStaticMarkup(
                createElement(AvatarPrestador, {
                    nombre: 'Carlos',
                    apellido: 'Gómez',
                    fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
                    tamano: 'md',
                })
            );
            expect(htmlConFoto).toContain('data-tiene-foto="true"');
            expect(htmlConFoto).toContain(
                'src="https://randomuser.me/api/portraits/men/32.jpg"'
            );
            expect(htmlConFoto).toContain('alt="Foto de Carlos Gómez"');

            const htmlSinFoto = renderToStaticMarkup(
                createElement(AvatarPrestador, {
                    nombre: 'Ana',
                    apellido: 'López',
                    fotoUrl: undefined,
                    tamano: 'lg',
                })
            );
            expect(htmlSinFoto).toContain('data-tiene-foto="false"');
            expect(htmlSinFoto).toContain(`src="${SILUETA_PERSONA_DATA_URI}"`);
            expect(htmlSinFoto).toContain('alt="Silueta de Ana López"');
        });

        it('FormularioPrestador renderiza campos vacíos con silueta en alta y campos precargados con foto en edición', () => {
            const htmlAlta = renderToStaticMarkup(
                createElement(FormularioPrestador, {
                    titulo: 'Alta de prestador',
                })
            );
            expect(htmlAlta).toContain('Alta de prestador');
            expect(htmlAlta).toContain('Crear prestador');
            expect(htmlAlta).toContain('data-tiene-foto="false"');
            expect(htmlAlta).not.toContain('Quitar foto');
            expect(PROVINCIAS_ARGENTINA).toHaveLength(24);
            expect(TODAS_LAS_LOCALIDADES_ARGENTINA.length).toBeGreaterThan(200);
            expect(obtenerLocalidadesPorProvincia('Tucumán')).toContain(
                'San Miguel de Tucumán'
            );
            expect(inferirProvinciaDeLocalidad('Ushuaia')).toBe(
                'Tierra del Fuego'
            );
            expect(htmlAlta).toContain('id="prestador-provincia"');
            expect(htmlAlta).toContain('id="prestador-localidad"');
            expect(htmlAlta).toContain('Tierra del Fuego');
            expect(htmlAlta).toContain('Ushuaia');
            expect(htmlAlta).toContain('San Miguel de Tucumán');

            const htmlEdicion = renderToStaticMarkup(
                createElement(FormularioPrestador, {
                    prestadorInicial: prestadorMock,
                })
            );
            expect(htmlEdicion).toContain('value="Carlos"');
            expect(htmlEdicion).toContain('value="Gómez"');
            expect(htmlEdicion).toContain('value="MAT-1001"');
            expect(htmlEdicion).toContain(
                'value="https://randomuser.me/api/portraits/men/32.jpg"'
            );
            expect(htmlEdicion).toContain('data-tiene-foto="true"');
            expect(htmlEdicion).toContain('Quitar foto');
            expect(htmlEdicion).toContain('Guardar cambios');
        });

        it('ListadoPrestadores renderiza la tabla paginada con fotos, siluetas por defecto y botón Exportar Catálogo', () => {
            const htmlListado = renderToStaticMarkup(
                createElement(ListadoPrestadores, {
                    prestadoresIniciales: [prestadorMock, prestadorSinFotoMock],
                    categoriasIniciales: CATEGORIAS_POR_DEFECTO,
                })
            );

            expect(htmlListado).toContain('Carlos Gómez');
            expect(htmlListado).toContain('Ana López');
            expect(htmlListado).toContain('data-tiene-foto="true"');
            expect(htmlListado).toContain('data-tiene-foto="false"');
            expect(htmlListado).toContain('MAT-1001');
            expect(htmlListado).toContain('10 años');
            expect(htmlListado).toContain('+54 11 40001001');
            expect(htmlListado).toContain('Exportar Catálogo');
            expect(htmlListado).toContain('Total: 2 registros');
        });

        it('TarjetaCatalogoPrestador y CatalogoPrestadoresUsuario renderizan la vista de catálogo para el usuario con filtros rápidos, tarjetas, fotos y siluetas', () => {
            expect(obtenerTituloEspecialidad(prestadorMock)).toBe(
                'Plomería Integral e Instalaciones Sanitarias'
            );
            expect(calcularCantidadResenas(prestadorMock)).toBeGreaterThan(80);

            const htmlTarjeta = renderToStaticMarkup(
                createElement(TarjetaCatalogoPrestador, {
                    prestador: prestadorMock,
                    onVerPerfil: vi.fn(),
                })
            );
            expect(htmlTarjeta).toContain('Carlos Gómez');
            expect(htmlTarjeta).toContain('Matrícula MAT-1001');
            expect(htmlTarjeta).toContain('Córdoba Capital');
            expect(htmlTarjeta).toContain('Ofrece garantía');
            expect(htmlTarjeta).toContain('Ver Perfil');
            expect(htmlTarjeta).toContain('Contactar');
            expect(htmlTarjeta).toContain('data-tiene-foto="true"');
            expect(htmlTarjeta).not.toContain('Tarifa orientativa');
            expect(htmlTarjeta).not.toContain('Verificado Fixer');

            const htmlCatalogo = renderToStaticMarkup(
                createElement(CatalogoPrestadoresUsuario, {
                    prestadoresIniciales: [prestadorMock, prestadorSinFotoMock],
                    categoriasIniciales: CATEGORIAS_POR_DEFECTO,
                })
            );
            expect(htmlCatalogo).toContain('CRITERIO DE BÚSQUEDA');
            expect(htmlCatalogo).toContain('2 disponibles');
            expect(htmlCatalogo).toContain('Todas las localidades');
            expect(htmlCatalogo).toContain('Córdoba Capital');
            expect(htmlCatalogo).toContain('Matriculados');
            expect(htmlCatalogo).toContain('Mejor calificados (4.8+)');
            expect(htmlCatalogo).toContain('Actualizado en tiempo real');
            expect(htmlCatalogo).toContain('data-tiene-foto="true"');
            expect(htmlCatalogo).toContain('data-tiene-foto="false"');
            expect(htmlCatalogo).not.toContain('Palermo &amp; Zona Norte');
            expect(htmlCatalogo).not.toContain('Garantía Fixer Care');
        });

        it('HomePage y calcularCategoriasMasBuscadas renderizan la vista de inicio con buscador y sugerencia de categorías más buscadas', () => {
            const sugerencias = calcularCategoriasMasBuscadas(
                [
                    prestadorMock,
                    { ...prestadorMock, id: 2, categoriaId: 'Plomería' },
                    { ...prestadorMock, id: 3, categoriaId: 'Electricidad' },
                ],
                CATEGORIAS_POR_DEFECTO,
                { Gasista: 4 },
                4
            );

            expect(sugerencias).toHaveLength(4);
            expect(sugerencias[0].categoriaId).toBe('Gasista');
            expect(sugerencias[1].categoriaId).toBe('Plomería');
            expect(sugerencias[1].etiqueta).toBe('Plomería de urgencia');

            const htmlHome = renderToStaticMarkup(
                createElement(HomePage, {
                    prestadoresIniciales: [prestadorMock, prestadorSinFotoMock],
                    categoriasIniciales: CATEGORIAS_POR_DEFECTO,
                })
            );

            expect(htmlHome).toContain(
                'Encontrá al profesional ideal para tu hogar'
            );
            expect(htmlHome).toContain('id="home-busqueda-texto"');
            expect(htmlHome).toContain('id="home-busqueda-rubro"');
            expect(htmlHome).toContain('id="home-busqueda-localidad"');
            expect(htmlHome).toContain('Buscar profesionales');
            expect(htmlHome).toContain('FRECUENTES:');
            expect(htmlHome).toContain('Plomería de urgencia');
            expect(htmlHome).toContain('Instalación de aire acondicionado');
            expect(htmlHome).toContain('Pintura de interiores');
            expect(htmlHome).toContain('Electricistas matriculados');
            expect(htmlHome).toContain('data-testid="sugerencia-categoria"');
        });
    });
});
