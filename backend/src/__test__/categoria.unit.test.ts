import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { CategoriaRepository } from '../repository/categoria.repository';
import { PrestadorRepository } from '../repository/prestador.repository';
import {
    CategoriaService,
    ErrorIntegridadCategoria,
} from '../service/categoria.service';
import { CategoriaController } from '../controller/categoria.controller';

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

describe('Módulo Categorías - Tests Unitarios', () => {
    describe('CategoriaRepository (Persistencia normalizada con ID subrogado + slug)', () => {
        let repository: CategoriaRepository;

        beforeEach(() => {
            repository = new CategoriaRepository();
        });

        it('inicializa el mock en memoria con los 9 rubros con id numérico y slug normalizado', () => {
            const todas = repository.findAll();
            expect(todas).toHaveLength(9);
            expect(todas.find((c) => c.id === 1)).toEqual({
                id: 1,
                slug: 'plomeria',
                nombre: 'Plomería',
            });
            expect(todas.find((c) => c.id === 2)).toEqual({
                id: 2,
                slug: 'electricidad',
                nombre: 'Electricidad',
            });
        });

        it('findAll retorna una copia del arreglo sin exponer la referencia interna', () => {
            const copia = repository.findAll();
            copia.pop();

            expect(repository.findAll()).toHaveLength(9);
        });

        it('findById y resolverPorReferencia resuelven por id numérico, slug o nombre', () => {
            expect(repository.findById(1)).toEqual({
                id: 1,
                slug: 'plomeria',
                nombre: 'Plomería',
            });
            expect(repository.resolverPorReferencia('plomeria')?.id).toBe(1);
            expect(repository.resolverPorReferencia('Plomería')?.id).toBe(1);
            expect(repository.findById(999)).toBeUndefined();
        });

        it('create genera un id subrogado autoincremental y un slug normalizado', () => {
            const creada = repository.create({ nombre: 'Herrería Artística' });
            expect(creada).toEqual({
                id: 10,
                slug: 'herreria-artistica',
                nombre: 'Herrería Artística',
            });
            expect(repository.findAll()).toHaveLength(10);
            expect(repository.findById(10)).toEqual(creada);
        });

        it('create respeta el slug personalizado cuando se envía explícitamente', () => {
            const creada = repository.create({
                slug: 'cat-herreria',
                nombre: 'Herrería Artística',
            });
            expect(creada).toEqual({
                id: 10,
                slug: 'cat-herreria',
                nombre: 'Herrería Artística',
            });
            expect(repository.findBySlug('cat-herreria')).toEqual(creada);
        });

        it('update modifica el nombre preservando su id subrogado inmutable o retorna null si no existe', () => {
            const actualizada = repository.update(3, {
                nombre: 'Gasista Matriculado',
            });
            expect(actualizada).toEqual({
                id: 3,
                slug: 'gasista',
                nombre: 'Gasista Matriculado',
            });
            expect(repository.findById(3)?.nombre).toBe('Gasista Matriculado');

            const noEncontrada = repository.update(999, { nombre: 'Nada' });
            expect(noEncontrada).toBeNull();
        });

        it('delete elimina una categoría existente y retorna true, o false si no existe', () => {
            const eliminada = repository.delete(4);
            expect(eliminada).toBe(true);
            expect(repository.findById(4)).toBeUndefined();
            expect(repository.findAll()).toHaveLength(8);

            expect(repository.delete(4)).toBe(false);
            expect(repository.delete(999)).toBe(false);
        });
    });

    describe('CategoriaService (Búsqueda normalizada, unicidad e integridad referencial)', () => {
        let repository: CategoriaRepository;
        let prestadorRepo: PrestadorRepository;
        let service: CategoriaService;

        beforeEach(() => {
            repository = new CategoriaRepository();
            prestadorRepo = new PrestadorRepository();
            service = new CategoriaService(repository, prestadorRepo);
        });

        it('listar devuelve las categorías ordenadas alfabéticamente por nombre', () => {
            const resultado = service.listar();
            expect(resultado).toHaveLength(9);
            expect(resultado[0].nombre).toBe('Albañilería');
            expect(resultado[resultado.length - 1].nombre).toBe('Refrigeración');
        });

        it('listar filtra por search ignorando tildes y mayúsculas/minúsculas', () => {
            const resultado = service.listar('plomeria');
            expect(resultado).toHaveLength(1);
            expect(resultado[0]).toEqual({
                id: 1,
                slug: 'plomeria',
                nombre: 'Plomería',
            });

            const resultadoMayus = service.listar('  CARPINTERIA ');
            expect(resultadoMayus).toHaveLength(1);
            expect(resultadoMayus[0].id).toBe(5);
        });

        it('impide duplicar nombre o slug y aplica ON DELETE RESTRICT cuando hay prestadores asociados', () => {
            expect(() => service.crear({ nombre: 'Plomería' })).toThrow(
                ErrorIntegridadCategoria
            );

            // Categoría 1 (Plomería) tiene prestadores asociados -> RESTRICT
            expect(() => service.eliminar(1)).toThrow(ErrorIntegridadCategoria);

            // Una categoría nueva sin prestadores sí puede eliminarse
            const nueva = service.crear({ nombre: 'Techista' });
            expect(nueva.id).toBe(10);
            expect(service.eliminar(nueva.id)).toBe(true);
        });

        it('delega obtenerPorId, crear, actualizar y eliminar al repositorio', () => {
            const spyFindById = vi.spyOn(repository, 'findById');
            const spyCreate = vi.spyOn(repository, 'create');
            const spyUpdate = vi.spyOn(repository, 'update');
            const spyDelete = vi.spyOn(repository, 'delete');

            expect(service.obtenerPorId(1)?.nombre).toBe('Plomería');
            expect(spyFindById).toHaveBeenCalledWith(1);

            const nueva = service.crear({ nombre: 'Techista' });
            expect(spyCreate).toHaveBeenCalledWith({
                nombre: 'Techista',
                slug: 'techista',
            });
            expect(nueva.id).toBe(10);

            const editada = service.actualizar(nueva.id, {
                nombre: 'Techos y Zinguería',
            });
            expect(spyUpdate).toHaveBeenCalledWith(nueva.id, {
                nombre: 'Techos y Zinguería',
            });
            expect(editada?.nombre).toBe('Techos y Zinguería');

            const borrada = service.eliminar(nueva.id);
            expect(spyDelete).toHaveBeenCalledWith(nueva.id);
            expect(borrada).toBe(true);
        });
    });

    describe('CategoriaController (Comportamiento aislado de HTTP handlers)', () => {
        let service: CategoriaService;
        let controller: CategoriaController;

        beforeEach(() => {
            service = new CategoriaService(
                new CategoriaRepository(),
                new PrestadorRepository()
            );
            controller = new CategoriaController(service);
        });

        it('listar responde 200 con estructura RespuestaApi y aplica query search opcional', () => {
            const spyListar = vi.spyOn(service, 'listar');
            const req = { query: { search: 'gas' } } as unknown as Request;
            const res = crearResMock();

            controller.listar(req, res);

            expect(spyListar).toHaveBeenCalledWith('gas');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categorías obtenidas correctamente',
                datos: [{ id: 3, slug: 'gasista', nombre: 'Gasista' }],
            });
        });

        it('obtenerPorId responde 200 cuando existe (por id o slug) y 404 cuando no existe', () => {
            const resOk = crearResMock();
            controller.obtenerPorId(
                { params: { id: '1' } } as unknown as Request,
                resOk
            );

            expect(resOk.status).toHaveBeenCalledWith(200);
            expect(resOk.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categoría encontrada',
                datos: { id: 1, slug: 'plomeria', nombre: 'Plomería' },
            });

            const res404 = crearResMock();
            controller.obtenerPorId(
                { params: { id: '999' } } as unknown as Request,
                res404
            );

            expect(res404.status).toHaveBeenCalledWith(404);
            expect(res404.json).toHaveBeenCalledWith({
                codigo: 404,
                msj: 'Categoría con id 999 no encontrada',
                datos: null,
            });
        });

        it('crear responde 400 si falta nombre, 409 si duplica y 201 al crear correctamente', () => {
            const res400 = crearResMock();
            controller.crear({ body: {} } as unknown as Request, res400);
            expect(res400.status).toHaveBeenCalledWith(400);

            const res201 = crearResMock();
            controller.crear(
                { body: { nombre: 'Tapicería' } } as unknown as Request,
                res201
            );
            expect(res201.status).toHaveBeenCalledWith(201);
            expect(res201.json).toHaveBeenCalledWith({
                codigo: 201,
                msj: 'Categoría creada exitosamente',
                datos: { id: 10, slug: 'tapiceria', nombre: 'Tapicería' },
            });

            const res409 = crearResMock();
            controller.crear(
                { body: { nombre: 'Tapicería' } } as unknown as Request,
                res409
            );
            expect(res409.status).toHaveBeenCalledWith(409);
        });

        it('actualizar valida id y nombre (400), no encontrada (404) y actualización exitosa (200)', () => {
            const resSinId = crearResMock();
            controller.actualizar(
                { params: {}, body: { nombre: 'Test' } } as unknown as Request,
                resSinId
            );
            expect(resSinId.status).toHaveBeenCalledWith(400);

            const resSinNombre = crearResMock();
            controller.actualizar(
                { params: { id: '1' }, body: {} } as unknown as Request,
                resSinNombre
            );
            expect(resSinNombre.status).toHaveBeenCalledWith(400);

            const res404 = crearResMock();
            controller.actualizar(
                {
                    params: { id: '999' },
                    body: { nombre: 'Nuevo' },
                } as unknown as Request,
                res404
            );
            expect(res404.status).toHaveBeenCalledWith(404);

            const res200 = crearResMock();
            controller.actualizar(
                {
                    params: {},
                    body: { id: 1, nombre: 'Plomería Integral' },
                } as unknown as Request,
                res200
            );
            expect(res200.status).toHaveBeenCalledWith(200);
            expect(res200.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categoría actualizada exitosamente',
                datos: { id: 1, slug: 'plomeria', nombre: 'Plomería Integral' },
            });
        });

        it('eliminar valida id requerido (400), no encontrada (404), integridad referencial (409) y baja exitosa (200)', () => {
            const res400 = crearResMock();
            controller.eliminar(
                { params: {}, body: {} } as unknown as Request,
                res400
            );
            expect(res400.status).toHaveBeenCalledWith(400);

            const res404 = crearResMock();
            controller.eliminar(
                { params: { id: '999' }, body: {} } as unknown as Request,
                res404
            );
            expect(res404.status).toHaveBeenCalledWith(404);

            // Categoría 1 tiene prestadores -> 409 Conflict
            const res409 = crearResMock();
            controller.eliminar(
                { params: { id: '1' }, body: {} } as unknown as Request,
                res409
            );
            expect(res409.status).toHaveBeenCalledWith(409);

            // Categoría sin prestadores -> 200 OK
            const resCrear = crearResMock();
            controller.crear(
                { body: { nombre: 'SinPrestadores' } } as unknown as Request,
                resCrear
            );

            const res200 = crearResMock();
            controller.eliminar(
                { params: {}, body: { id: 10 } } as unknown as Request,
                res200
            );
            expect(res200.status).toHaveBeenCalledWith(200);
            expect(res200.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categoría eliminada exitosamente',
                datos: null,
            });
        });
    });
});
