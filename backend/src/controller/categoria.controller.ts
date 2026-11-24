import { Request, Response } from 'express';
import { ICategoria } from '../interfaces/categoria.interface';
import { RespuestaApi } from '../interfaces/respuestaApi.interface';
import {
    CategoriaService,
    ErrorIntegridadCategoria,
} from '../service/categoria.service';

export class CategoriaController {
    constructor(private readonly service = new CategoriaService()) {}

    public listar = (req: Request, res: Response): void => {
        const { search } = req.query;
        const datos = this.service.listar(search ? String(search) : undefined);

        const respuesta: RespuestaApi<ICategoria[]> = {
            codigo: 200,
            msj: 'Categorías obtenidas correctamente',
            datos,
        };

        res.status(200).json(respuesta);
    };

    public obtenerPorId = (req: Request, res: Response): void => {
        const referencia = String(req.params.id ?? '').trim();
        const categoria = this.service.resolverPorReferencia(referencia);

        if (!categoria) {
            res.status(404).json({
                codigo: 404,
                msj: `Categoría con id ${referencia} no encontrada`,
                datos: null,
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Categoría encontrada',
            datos: categoria,
        });
    };

    public crear = (req: Request, res: Response): void => {
        const { slug, nombre } = req.body ?? {};

        if (!nombre || !String(nombre).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'El campo nombre es obligatorio',
                datos: null,
            });
            return;
        }

        try {
            const nueva: ICategoria = this.service.crear({
                slug: slug ? String(slug) : undefined,
                nombre: String(nombre),
            });

            res.status(201).json({
                codigo: 201,
                msj: 'Categoría creada exitosamente',
                datos: nueva,
            });
        } catch (error: unknown) {
            if (error instanceof ErrorIntegridadCategoria) {
                res.status(error.statusCode).json({
                    codigo: error.statusCode,
                    msj: error.message,
                    datos: null,
                });
                return;
            }
            throw error;
        }
    };

    public actualizar = (req: Request, res: Response): void => {
        const rawId = req.params.id ?? req.body?.id;

        if (rawId === undefined || rawId === null || !String(rawId).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id de la categoría para actualizar',
                datos: null,
            });
            return;
        }

        if (!req.body?.nombre || !String(req.body.nombre).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'El campo nombre es obligatorio para actualizar',
                datos: null,
            });
            return;
        }

        const existente = this.service.resolverPorReferencia(String(rawId));
        if (!existente) {
            res.status(404).json({
                codigo: 404,
                msj: `Categoría con id ${rawId} no encontrada`,
                datos: null,
            });
            return;
        }

        try {
            const actualizada: ICategoria | null = this.service.actualizar(
                existente.id,
                {
                    nombre: String(req.body.nombre),
                    ...(req.body.slug !== undefined
                        ? { slug: String(req.body.slug) }
                        : {}),
                }
            );

            if (!actualizada) {
                res.status(404).json({
                    codigo: 404,
                    msj: `Categoría con id ${rawId} no encontrada`,
                    datos: null,
                });
                return;
            }

            res.status(200).json({
                codigo: 200,
                msj: 'Categoría actualizada exitosamente',
                datos: actualizada,
            });
        } catch (error: unknown) {
            if (error instanceof ErrorIntegridadCategoria) {
                res.status(error.statusCode).json({
                    codigo: error.statusCode,
                    msj: error.message,
                    datos: null,
                });
                return;
            }
            throw error;
        }
    };

    public eliminar = (req: Request, res: Response): void => {
        const rawId = req.params.id ?? req.body?.id;

        if (rawId === undefined || rawId === null || !String(rawId).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id de la categoría para eliminar',
                datos: null,
            });
            return;
        }

        const existente = this.service.resolverPorReferencia(String(rawId));
        if (!existente) {
            res.status(404).json({
                codigo: 404,
                msj: `Categoría con id ${rawId} no encontrada`,
                datos: null,
            });
            return;
        }

        try {
            const eliminada = this.service.eliminar(existente.id);

            if (!eliminada) {
                res.status(404).json({
                    codigo: 404,
                    msj: `Categoría con id ${rawId} no encontrada`,
                    datos: null,
                });
                return;
            }

            res.status(200).json({
                codigo: 200,
                msj: 'Categoría eliminada exitosamente',
                datos: null,
            });
        } catch (error: unknown) {
            if (error instanceof ErrorIntegridadCategoria) {
                res.status(error.statusCode).json({
                    codigo: error.statusCode,
                    msj: error.message,
                    datos: null,
                });
                return;
            }
            throw error;
        }
    };
}
