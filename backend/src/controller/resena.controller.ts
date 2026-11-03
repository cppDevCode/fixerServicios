import { Request, Response } from "express";
import { IResena } from "../interfaces/resena.interface";
import { RespuestaApi } from "../interfaces/respuestaApi.interface";
import { ErrorValidacion, ResenaService } from "../service/resena.service";

export class ResenaController {
    constructor(private readonly service = new ResenaService()) {}

    public listar = (req: Request, res: Response): void => {
        const { prestadorId, page, limit } = req.query;

        const { items, meta } = this.service.listar({
            prestadorId: prestadorId ? Number(prestadorId) : undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });

        const respuesta: RespuestaApi<IResena[]> = {
            codigo: 200,
            msj: 'Reseñas obtenidas correctamente',
            datos: items,
            meta
        };

        res.status(200).json(respuesta);
    }

    public obtenerPorId = (req: Request, res: Response): void => {
        const id = Number(req.params.id);
        const resena = this.service.obtenerPorId(id);

        if (!resena) {
            res.status(404).json({
                codigo: 404,
                msj: `Reseña con id ${id} no encontrada`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Reseña encontrada',
            datos: resena
        });
    }

    public crear = (req: Request, res: Response): void => {
        try {
            const nueva = this.service.crear(req.body ?? {});

            res.status(201).json({
                codigo: 201,
                msj: 'Reseña creada exitosamente',
                datos: nueva
            });
        } catch (error) {
            if (error instanceof ErrorValidacion) {
                res.status(400).json({
                    codigo: 400,
                    msj: error.message,
                    datos: null
                });
                return;
            }
            throw error;
        }
    }

    public eliminar = (req: Request, res: Response): void => {
        const id = Number(req.params.id);

        if (!id) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere un id válido para eliminar la reseña',
                datos: null
            });
            return;
        }

        const eliminada = this.service.eliminar(id);

        if (!eliminada) {
            res.status(404).json({
                codigo: 404,
                msj: `Reseña con id ${id} no encontrada`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Reseña eliminada exitosamente',
            datos: null
        });
    }
}