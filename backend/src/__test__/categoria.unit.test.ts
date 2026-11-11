import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { CategoriaRepository } from '../repository/categoria.repository';
import { CategoriaService } from '../service/categoria.service';
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
    describe('CategoriaRepository (Persistencia en memoria)', () => {
        let repository: CategoriaRepository;

        beforeEach(() => {
            repository = new CategoriaRepository();
        });

        it('inicializa el mock en memoria con los 9 rubros de prestadores', () => {
            const todas = repository.findAll();
            expect(todas).toHaveLength(9);
            expect(todas.map((c) => c.id)).toContain('Plomería');
            expect(todas.map((c) => c.id)).toContain('Electricidad');
        });

        it('findAll retorna una copia del arreglo sin exponer la referencia interna', () => {
            const copia = repository.findAll();
            copia.pop();

            expect(repository.findAll()).toHaveLength(9);
        });

        it('findById retorna la categoría cuando existe y undefined cuando no existe', () => {
            const existente = repository.findById('Plomería');
            expect(existente).toEqual({ id: 'Plomería', nombre: 'Plomería' });

            const inexistente = repository.findById('Inexistente');
            expect(inexistente).toBeUndefined();
        });

        it('create usa el nombre como id por defecto cuando no se envía id', () => {
            const creada = repository.create({ nombre: 'Herrería' });
            expect(creada).toEqual({ id: 'Herrería', nombre: 'Herrería' });
            expect(repository.findAll()).toHaveLength(10);
            expect(repository.findById('Herrería')).toEqual(creada);
        });

        it('create respeta el id personalizado cuando se envía explícitamente', () => {
            const creada = repository.create({ id: 'cat-herreria', nombre: 'Herrería Artística' });
            expect(creada).toEqual({ id: 'cat-herreria', nombre: 'Herrería Artística' });
            expect(repository.findById('cat-herreria')).toEqual(creada);
        });

        it('update modifica el nombre de una categoría existente preservando su id o retorna null si no existe', () => {
            const actualizada = repository.update('Gasista', { nombre: 'Gasista Matriculado' });
            expect(actualizada).toEqual({ id: 'Gasista', nombre: 'Gasista Matriculado' });
            expect(repository.findById('Gasista')?.nombre).toBe('Gasista Matriculado');

            const noEncontrada = repository.update('Inexistente', { nombre: 'Nada' });
            expect(noEncontrada).toBeNull();
        });

        it('delete elimina una categoría existente y retorna true, o false si no existe', () => {
            const eliminada = repository.delete('Pintura');
            expect(eliminada).toBe(true);
            expect(repository.findById('Pintura')).toBeUndefined();
            expect(repository.findAll()).toHaveLength(8);

            expect(repository.delete('Pintura')).toBe(false);
            expect(repository.delete('Inexistente')).toBe(false);
        });
    });

    describe('CategoriaService (Búsqueda normalizada, ordenamiento y delegación CRUD)', () => {
        let repository: CategoriaRepository;
        let service: CategoriaService;

        beforeEach(() => {
            repository = new CategoriaRepository();
            service = new CategoriaService(repository);
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
            expect(resultado[0]).toEqual({ id: 'Plomería', nombre: 'Plomería' });

            const resultadoMayus = service.listar('  CARPINTERIA ');
            expect(resultadoMayus).toHaveLength(1);
            expect(resultadoMayus[0].id).toBe('Carpintería');
        });

        it('delega obtenerPorId, crear, actualizar y eliminar al repositorio', () => {
            const spyFindById = vi.spyOn(repository, 'findById');
            const spyCreate = vi.spyOn(repository, 'create');
            const spyUpdate = vi.spyOn(repository, 'update');
            const spyDelete = vi.spyOn(repository, 'delete');

            expect(service.obtenerPorId('Plomería')?.nombre).toBe('Plomería');
            expect(spyFindById).toHaveBeenCalledWith('Plomería');

            const nueva = service.crear({ nombre: 'Techista' });
            expect(spyCreate).toHaveBeenCalledWith({ nombre: 'Techista' });
            expect(nueva.id).toBe('Techista');

            const editada = service.actualizar('Techista', { nombre: 'Techos y Zinguería' });
            expect(spyUpdate).toHaveBeenCalledWith('Techista', { nombre: 'Techos y Zinguería' });
            expect(editada?.nombre).toBe('Techos y Zinguería');

            const borrada = service.eliminar('Techista');
            expect(spyDelete).toHaveBeenCalledWith('Techista');
            expect(borrada).toBe(true);
        });
    });

    describe('CategoriaController (Comportamiento aislado de HTTP handlers)', () => {
        let service: CategoriaService;
        let controller: CategoriaController;

        beforeEach(() => {
            service = new CategoriaService(new CategoriaRepository());
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
                datos: [{ id: 'Gasista', nombre: 'Gasista' }],
            });
        });

        it('obtenerPorId responde 200 cuando existe y 404 cuando no existe', () => {
            const resOk = crearResMock();
            controller.obtenerPorId({ params: { id: 'Plomería' } } as unknown as Request, resOk);

            expect(resOk.status).toHaveBeenCalledWith(200);
            expect(resOk.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categoría encontrada',
                datos: { id: 'Plomería', nombre: 'Plomería' },
            });

            const res404 = crearResMock();
            controller.obtenerPorId({ params: { id: 'NoExiste' } } as unknown as Request, res404);

            expect(res404.status).toHaveBeenCalledWith(404);
            expect(res404.json).toHaveBeenCalledWith({
                codigo: 404,
                msj: 'Categoría con id NoExiste no encontrada',
                datos: null,
            });
        });

        it('crear responde 400 si falta nombre y 201 al crear correctamente', () => {
            const res400 = crearResMock();
            controller.crear({ body: {} } as unknown as Request, res400);
            expect(res400.status).toHaveBeenCalledWith(400);
            expect(res400.json).toHaveBeenCalledWith({
                codigo: 400,
                msj: 'El campo nombre es obligatorio',
                datos: null,
            });

            const res201 = crearResMock();
            controller.crear(
                { body: { nombre: 'Tapicería' } } as unknown as Request,
                res201
            );
            expect(res201.status).toHaveBeenCalledWith(201);
            expect(res201.json).toHaveBeenCalledWith({
                codigo: 201,
                msj: 'Categoría creada exitosamente',
                datos: { id: 'Tapicería', nombre: 'Tapicería' },
            });
        });

        it('actualizar valida id y nombre (400), no encontrada (404) y actualización exitosa (200)', () => {
            const resSinId = crearResMock();
            controller.actualizar({ params: {}, body: { nombre: 'Test' } } as unknown as Request, resSinId);
            expect(resSinId.status).toHaveBeenCalledWith(400);

            const resSinNombre = crearResMock();
            controller.actualizar({ params: { id: 'Plomería' }, body: {} } as unknown as Request, resSinNombre);
            expect(resSinNombre.status).toHaveBeenCalledWith(400);

            const res404 = crearResMock();
            controller.actualizar(
                { params: { id: 'Inexistente' }, body: { nombre: 'Nuevo' } } as unknown as Request,
                res404
            );
            expect(res404.status).toHaveBeenCalledWith(404);

            const res200 = crearResMock();
            controller.actualizar(
                { params: {}, body: { id: 'Plomería', nombre: 'Plomería Integral' } } as unknown as Request,
                res200
            );
            expect(res200.status).toHaveBeenCalledWith(200);
            expect(res200.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categoría actualizada exitosamente',
                datos: { id: 'Plomería', nombre: 'Plomería Integral' },
            });
        });

        it('eliminar valida id requerido (400), no encontrada (404) y eliminación exitosa (200)', () => {
            const res400 = crearResMock();
            controller.eliminar({ params: {}, body: {} } as unknown as Request, res400);
            expect(res400.status).toHaveBeenCalledWith(400);

            const res404 = crearResMock();
            controller.eliminar({ params: { id: 'NoExiste' }, body: {} } as unknown as Request, res404);
            expect(res404.status).toHaveBeenCalledWith(404);

            const res200 = crearResMock();
            controller.eliminar({ params: {}, body: { id: 'Plomería' } } as unknown as Request, res200);
            expect(res200.status).toHaveBeenCalledWith(200);
            expect(res200.json).toHaveBeenCalledWith({
                codigo: 200,
                msj: 'Categoría eliminada exitosamente',
                datos: null,
            });
        });
    });
});
