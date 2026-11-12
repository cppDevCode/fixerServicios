import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { PrestadorRepository } from '../repository/prestador.repository';
import { PrestadorService } from '../service/prestador.service';
import { PrestadorController } from '../controller/prestador.controller';
import {
    crearCategoria,
    categoriasFixture,
    crearDatosPrestador,
    crearPrestador,
    prestadoresFixture,
} from './fixtures/prestadores.fixtures';

const crearResMock = () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res as unknown as Response & {
        status: ReturnType<typeof vi.fn>;
        json: ReturnType<typeof vi.fn>;
    };
};

describe('Módulo Prestadores - Tests Unitarios', () => {
    describe('Interfaces y Fixtures (ICategoria e IPrestador)', () => {
        it('crearCategoria genera una categoría válida y permite sobrescribir campos', () => {
            const categoriaBase = crearCategoria();
            expect(categoriaBase).toEqual({ id: 'Plomería', nombre: 'Plomería' });

            const categoriaCustom = crearCategoria({ id: 'cat-gas', nombre: 'Gasista Matriculado' });
            expect(categoriaCustom.id).toBe('cat-gas');
            expect(categoriaCustom.nombre).toBe('Gasista Matriculado');
            expect(categoriasFixture.length).toBeGreaterThanOrEqual(4);
        });

        it('crearPrestador genera un prestador válido y permite sobrescribir propiedades', () => {
            const prestador = crearPrestador({
                id: 99,
                nombre: 'Roberto',
                ofreceGarantia: false,
                aniosExperiencia: 20,
            });

            expect(prestador.id).toBe(99);
            expect(prestador.nombre).toBe('Roberto');
            expect(prestador.ofreceGarantia).toBe(false);
            expect(prestador.aniosExperiencia).toBe(20);
            expect(prestador.telefono).toEqual({
                codPais: '+54',
                codArea: '11',
                nroTelefono: '45556666',
            });
            expect(prestadoresFixture).toHaveLength(3);
        });
    });

    describe('PrestadorRepository (Persistencia en memoria)', () => {
        let repository: PrestadorRepository;

        beforeEach(() => {
            repository = new PrestadorRepository();
        });

        it('inicializa el mock en memoria con un mínimo de 15 registros para paginado', () => {
            const todos = repository.findAll();
            expect(todos.length).toBeGreaterThanOrEqual(15);
            expect(todos).toHaveLength(16);
        });

        it('findAll retorna una copia del arreglo sin exponer la referencia interna', () => {
            const copia = repository.findAll();
            copia.pop();

            expect(repository.findAll()).toHaveLength(16);
        });

        it('findById retorna el prestador correcto cuando existe y undefined cuando no existe', () => {
            const existente = repository.findById(1);
            expect(existente).toBeDefined();
            expect(existente?.nombre).toBe('Carlos');
            expect(existente?.apellido).toBe('Gómez');
            expect(existente?.categoriaId).toBe('Plomería');

            const inexistente = repository.findById(9999);
            expect(inexistente).toBeUndefined();
        });

        it('create asigna un id autoincremental y persiste el nuevo prestador en memoria', () => {
            const nuevosDatos = crearDatosPrestador({
                nombre: 'Mariano',
                apellido: 'Ibarra',
                categoriaId: 'Cerrajería',
            });

            const creado = repository.create(nuevosDatos);

            expect(creado.id).toBe(17);
            expect(creado.nombre).toBe('Mariano');
            expect(repository.findAll()).toHaveLength(17);
            expect(repository.findById(17)).toEqual(creado);
        });

        it('create asigna id 1 cuando el repositorio se queda sin registros previos', () => {
            for (const p of repository.findAll()) {
                repository.delete(p.id);
            }
            expect(repository.findAll()).toHaveLength(0);

            const primero = repository.create(crearDatosPrestador({ nombre: 'Primero' }));
            expect(primero.id).toBe(1);
        });

        it('update modifica parcialmente un prestador existente preservando su id', () => {
            const actualizado = repository.update(1, {
                nombre: 'Carlos Alberto',
                aniosExperiencia: 12,
            });

            expect(actualizado).not.toBeNull();
            expect(actualizado?.id).toBe(1);
            expect(actualizado?.nombre).toBe('Carlos Alberto');
            expect(actualizado?.apellido).toBe('Gómez');
            expect(actualizado?.aniosExperiencia).toBe(12);
            expect(repository.findById(1)?.nombre).toBe('Carlos Alberto');
        });

        it('update retorna null cuando el id no existe', () => {
            const resultado = repository.update(9999, { nombre: 'Inexistente' });
            expect(resultado).toBeNull();
        });

        it('create y update normalizan fotoUrl: recortan espacios y convierten cadenas vacías en undefined', () => {
            const conFotoEspacios = repository.create(
                crearDatosPrestador({
                    nombre: 'ConFoto',
                    fotoUrl: '  https://randomuser.me/api/portraits/men/50.jpg  ',
                })
            );
            expect(conFotoEspacios.fotoUrl).toBe('https://randomuser.me/api/portraits/men/50.jpg');

            const sinFoto = repository.create(
                crearDatosPrestador({
                    nombre: 'SinFoto',
                    fotoUrl: '   ',
                })
            );
            expect(sinFoto.fotoUrl).toBeUndefined();

            // Limpiar foto existente mediante cadena vacía en update
            const fotoEliminada = repository.update(conFotoEspacios.id, { fotoUrl: '' });
            expect(fotoEliminada?.fotoUrl).toBeUndefined();
        });

        it('delete elimina un prestador existente y retorna true, o false si no existe', () => {
            const eliminado = repository.delete(1);
            expect(eliminado).toBe(true);
            expect(repository.findById(1)).toBeUndefined();
            expect(repository.findAll()).toHaveLength(15);

            const eliminadoDeNuevo = repository.delete(1);
            expect(eliminadoDeNuevo).toBe(false);
            expect(repository.delete(9999)).toBe(false);
        });
    });

    describe('PrestadorService (Paginación, búsqueda, filtrado y ordenamiento)', () => {
        let repository: PrestadorRepository;
        let service: PrestadorService;

        beforeEach(() => {
            repository = new PrestadorRepository();
            service = new PrestadorService(repository);
        });

        it('listar aplica valores por defecto (page=1, limit=10, sortBy=nombre, order=asc)', () => {
            const resultado = service.listar({});

            expect(resultado.datos).toHaveLength(10);
            expect(resultado.meta).toEqual({
                pagina: 1,
                limit: 10,
                total: 16,
                totalPages: 2,
            });
            // Primeros por orden alfabético de nombre: Ana, Camila, Carlos...
            expect(resultado.datos[0].nombre).toBe('Ana');
            expect(resultado.datos[1].nombre).toBe('Camila');
            expect(resultado.datos[2].nombre).toBe('Carlos');
        });

        it('listar devuelve la segunda página correctamente', () => {
            const pagina2 = service.listar({ page: 2, limit: 10 });

            expect(pagina2.datos).toHaveLength(6);
            expect(pagina2.meta).toEqual({
                pagina: 2,
                limit: 10,
                total: 16,
                totalPages: 2,
            });
        });

        it('listar normaliza valores menores a 1 en page y limit', () => {
            const resultado = service.listar({ page: -3, limit: 0 });

            expect(resultado.meta.pagina).toBe(1);
            expect(resultado.meta.limit).toBe(10);
            expect(resultado.datos).toHaveLength(10);
        });

        it('listar filtra por rubro ignorando mayúsculas/minúsculas y tildes', () => {
            const conTilde = service.listar({ rubro: 'Plomería' });
            const sinTildeMinuscula = service.listar({ rubro: 'plomeria' });
            const enMayusculas = service.listar({ rubro: '  PLOMERÍA  ' });

            expect(conTilde.meta.total).toBe(5);
            expect(sinTildeMinuscula.meta.total).toBe(5);
            expect(enMayusculas.meta.total).toBe(5);
            expect(conTilde.datos.every((p) => p.categoriaId === 'Plomería')).toBe(true);
            expect(conTilde.datos.map((p) => p.nombre)).toEqual([
                'Carlos',
                'Diego',
                'Fernando',
                'Jorge',
                'Roberto',
            ]);
        });

        it('listar devuelve totalPages = 1 y lista vacía cuando ningún registro coincide', () => {
            const sinResultados = service.listar({ rubro: 'RubroInexistente' });

            expect(sinResultados.datos).toEqual([]);
            expect(sinResultados.meta).toEqual({
                pagina: 1,
                limit: 10,
                total: 0,
                totalPages: 1,
            });
        });

        it('listar busca por texto (search) en nombre, apellido, acercaDe y categoriaId sin distinguir tildes', () => {
            // Búsqueda por nombre/apellido con tilde omitida ("Gomez" -> Carlos Gómez)
            const porApellido = service.listar({ search: 'gomez' });
            expect(porApellido.meta.total).toBe(1);
            expect(porApellido.datos[0].id).toBe(1);

            // Búsqueda en acercaDe ("termotanques" -> Jorge Martínez)
            const porDescripcion = service.listar({ search: 'TERMOTANQUES' });
            expect(porDescripcion.meta.total).toBe(1);
            expect(porDescripcion.datos[0].nombre).toBe('Jorge');

            // Búsqueda por categoría ("electricidad" -> 3 electricistas)
            const porCategoria = service.listar({ search: 'electricidad' });
            expect(porCategoria.meta.total).toBe(3);
        });

        it('listar combina filtro por rubro, búsqueda por texto, ordenamiento y paginación', () => {
            const resultado = service.listar({
                rubro: 'Plomería',
                search: 'instalaciones',
                sortBy: 'aniosExperiencia',
                order: 'desc',
                page: 1,
                limit: 5,
            });

            expect(resultado.meta.total).toBe(1);
            expect(resultado.datos[0].nombre).toBe('Roberto');
        });

        it('listar ordena por campos numéricos (aniosExperiencia) en asc y desc', () => {
            const asc = service.listar({ sortBy: 'aniosExperiencia', order: 'asc', limit: 16 });
            const desc = service.listar({ sortBy: 'aniosExperiencia', order: 'desc', limit: 16 });

            expect(asc.datos[0].aniosExperiencia).toBe(3); // Camila (3 años)
            expect(asc.datos[asc.datos.length - 1].aniosExperiencia).toBe(20); // Miguel (20 años)

            expect(desc.datos[0].aniosExperiencia).toBe(20);
            expect(desc.datos[desc.datos.length - 1].aniosExperiencia).toBe(3);
        });

        it('listar ordena por campos booleanos y envía campos undefined al final', () => {
            const porGarantia = service.listar({
                sortBy: 'ofreceGarantia',
                order: 'asc',
                limit: 16,
            });
            // 'false' viene antes que 'true' al comparar como string
            expect(porGarantia.datos[0].ofreceGarantia).toBe(false);
            expect(porGarantia.datos[porGarantia.datos.length - 1].ofreceGarantia).toBe(true);

            // Ordenando por matricula (algunos no tienen matrícula -> undefined va al final)
            const porMatricula = service.listar({
                sortBy: 'matricula',
                order: 'asc',
                limit: 16,
            });
            expect(porMatricula.datos[0].matricula).toBe('MAT-1001');
            expect(porMatricula.datos[porMatricula.datos.length - 1].matricula).toBeUndefined();
        });

        it('delega correctamente obtenerPorId, crear, actualizar y eliminar al repositorio', () => {
            const spyFindById = vi.spyOn(repository, 'findById');
            const spyCreate = vi.spyOn(repository, 'create');
            const spyUpdate = vi.spyOn(repository, 'update');
            const spyDelete = vi.spyOn(repository, 'delete');

            const obtenido = service.obtenerPorId(2);
            expect(spyFindById).toHaveBeenCalledWith(2);
            expect(obtenido?.nombre).toBe('Lucía');

            const datosNuevo = crearDatosPrestador({ nombre: 'Nuevo Prestador' });
            const creado = service.crear(datosNuevo);
            expect(spyCreate).toHaveBeenCalledWith(datosNuevo);
            expect(creado.id).toBe(17);

            const actualizado = service.actualizar(17, { aniosExperiencia: 99 });
            expect(spyUpdate).toHaveBeenCalledWith(17, { aniosExperiencia: 99 });
            expect(actualizado?.aniosExperiencia).toBe(99);

            const eliminado = service.eliminar(17);
            expect(spyDelete).toHaveBeenCalledWith(17);
            expect(eliminado).toBe(true);
        });
    });

    describe('PrestadorController (Comportamiento aislado de HTTP handlers)', () => {
        let service: PrestadorService;
        let controller: PrestadorController;

        beforeEach(() => {
            service = new PrestadorService(new PrestadorRepository());
            controller = new PrestadorController(service);
        });

        it('listar convierte query params y responde 200 con estructura RespuestaApi', () => {
            const spyListar = vi.spyOn(service, 'listar');
            const req = {
                query: {
                    page: '1',
                    limit: '5',
                    rubro: 'Plomería',
                    search: 'Carlos',
                    sortBy: 'nombre',
                    order: 'desc',
                },
            } as unknown as Request;
            const res = crearResMock();

            controller.listar(req, res);

            expect(spyListar).toHaveBeenCalledWith({
                page: 1,
                limit: 5,
                rubro: 'Plomería',
                search: 'Carlos',
                sortBy: 'nombre',
                order: 'desc',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: 200,
                    msj: 'Prestadores obtenidos correctamente',
                    datos: expect.any(Array),
                    meta: expect.objectContaining({
                        pagina: 1,
                        limit: 5,
                        total: 1,
                        totalPages: 1,
                    }),
                })
            );
        });

        it('obtenerPorId responde 200 cuando el prestador existe y 404 cuando no existe', () => {
            const resOk = crearResMock();
            controller.obtenerPorId({ params: { id: '1' } } as unknown as Request, resOk);

            expect(resOk.status).toHaveBeenCalledWith(200);
            expect(resOk.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: 200,
                    msj: 'Prestador encontrado',
                    datos: expect.objectContaining({ id: 1, nombre: 'Carlos' }),
                })
            );

            const res404 = crearResMock();
            controller.obtenerPorId({ params: { id: '999' } } as unknown as Request, res404);

            expect(res404.status).toHaveBeenCalledWith(404);
            expect(res404.json).toHaveBeenCalledWith({
                codigo: 404,
                msj: 'Prestador con id 999 no encontrado',
                datos: null,
            });
        });

        it('crear responde 400 si faltan campos obligatorios y 201 aplicando valores por defecto', () => {
            const res400 = crearResMock();
            controller.crear(
                { body: { nombre: 'SoloNombre' } } as unknown as Request,
                res400
            );
            expect(res400.status).toHaveBeenCalledWith(400);
            expect(res400.json).toHaveBeenCalledWith({
                codigo: 400,
                msj: 'Los campos nombre, apellido y categoriaId son obligatorios',
                datos: null,
            });

            const res201 = crearResMock();
            controller.crear(
                {
                    body: {
                        nombre: 'Esteban',
                        apellido: 'Quito',
                        categoriaId: 'Carpintería',
                    },
                } as unknown as Request,
                res201
            );
            expect(res201.status).toHaveBeenCalledWith(201);
            expect(res201.json).toHaveBeenCalledWith({
                codigo: 201,
                msj: 'Prestador creado exitosamente',
                datos: expect.objectContaining({
                    id: 17,
                    nombre: 'Esteban',
                    apellido: 'Quito',
                    categoriaId: 'Carpintería',
                    aniosExperiencia: 0,
                    acercaDe: '',
                    ofreceGarantia: false,
                    telefono: { codPais: '+54', codArea: '11', nroTelefono: '' },
                    fotoUrl: undefined,
                }),
            });

            const res201ConFoto = crearResMock();
            controller.crear(
                {
                    body: {
                        nombre: 'Valeria',
                        apellido: 'Sosa',
                        categoriaId: 'Pintura',
                        fotoUrl: '  https://randomuser.me/api/portraits/women/22.jpg  ',
                    },
                } as unknown as Request,
                res201ConFoto
            );
            expect(res201ConFoto.status).toHaveBeenCalledWith(201);
            expect(res201ConFoto.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: 201,
                    datos: expect.objectContaining({
                        nombre: 'Valeria',
                        fotoUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
                    }),
                })
            );
        });

        it('actualizar valida id requerido (400), no encontrado (404) y actualización exitosa (200)', () => {
            const res400 = crearResMock();
            controller.actualizar({ params: {}, body: {} } as unknown as Request, res400);
            expect(res400.status).toHaveBeenCalledWith(400);

            const res404 = crearResMock();
            controller.actualizar(
                { params: { id: '888' }, body: { nombre: 'Test' } } as unknown as Request,
                res404
            );
            expect(res404.status).toHaveBeenCalledWith(404);

            const res200 = crearResMock();
            controller.actualizar(
                { params: {}, body: { id: 1, acercaDe: 'Actualizado por body' } } as unknown as Request,
                res200
            );
            expect(res200.status).toHaveBeenCalledWith(200);
            expect(res200.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    codigo: 200,
                    msj: 'Prestador actualizado exitosamente',
                    datos: expect.objectContaining({
                        id: 1,
                        acercaDe: 'Actualizado por body',
                    }),
                })
            );
        });

        it('eliminar valida id requerido (400), no encontrado (404) y eliminación exitosa (200)', () => {
            const res400 = crearResMock();
            controller.eliminar({ params: {}, body: {} } as unknown as Request, res400);
            expect(res400.status).toHaveBeenCalledWith(400);

            const res404 = crearResMock();
            controller.eliminar({ params: { id: '888' }, body: {} } as unknown as Request, res404);
            expect(res404.status).toHaveBeenCalledWith(404);

            const res200 = crearResMock();
            controller.eliminar({ params: {}, body: { id: 1 } } as unknown as Request, res200);
            expect(res200.status).toHaveBeenCalledWith(200);
            expect(res200.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Prestador eliminado exitosamente',
                datos: null,
            });
        });
    });
});
