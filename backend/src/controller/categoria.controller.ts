import { Request, Response } from "express";
import { ICategoria } from "../interfaces/categoria.interface";
import { RespuestaApi } from "../interfaces/respuestaApi.interface";
import { CategoriaService } from "../service/categoria.service";

export class CategoriaController {
    constructor(private readonly service = new CategoriaService()) {}

    public listar = (req: Request, res: Response): void => {
        const { search } = req.query;
        const datos = this.service.listar(search ? String(search) : undefined);

        const respuesta: RespuestaApi<ICategoria[]> = {
            codigo: 200,
            msj: 'Categorías obtenidas correctamente',
            datos
        };

        res.status(200).json(respuesta);
    }

    public obtenerPorId = (req: Request, res: Response): void => {
        const id = String(req.params.id);
        const categoria = this.service.obtenerPorId(id);

        if (!categoria) {
            res.status(404).json({
                codigo: 404,
                msj: `Categoría con id ${id} no encontrada`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Categoría encontrada',
            datos: categoria
        });
    }

    public crear = (req: Request, res: Response): void => {
        const { id, nombre } = req.body;

        if (!nombre || !String(nombre).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'El campo nombre es obligatorio',
                datos: null
            });
            return;
        }

        const nueva: ICategoria = this.service.crear({
            id: id ? String(id) : undefined,
            nombre: String(nombre)
        });

        res.status(201).json({
            codigo: 201,
            msj: 'Categoría creada exitosamente',
            datos: nueva
        });
    }

    public actualizar = (req: Request, res: Response): void => {
        const id = req.params.id || req.body.id;

        if (!id || !String(id).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id de la categoría para actualizar',
                datos: null
            });
            return;
        }

        if (!req.body.nombre || !String(req.body.nombre).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'El campo nombre es obligatorio para actualizar',
                datos: null
            });
            return;
        }

        const actualizada: ICategoria | null = this.service.actualizar(String(id), {
            nombre: String(req.body.nombre)
        });

        if (!actualizada) {
            res.status(404).json({
                codigo: 404,
                msj: `Categoría con id ${id} no encontrada`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Categoría actualizada exitosamente',
            datos: actualizada
        });
    }

    public eliminar = (req: Request, res: Response): void => {
        const id = req.params.id || req.body.id;

        if (!id || !String(id).trim()) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id de la categoría para eliminar',
                datos: null
            });
            return;
        }

        const eliminada = this.service.eliminar(String(id));

        if (!eliminada) {
            res.status(404).json({
                codigo: 404,
                msj: `Categoría con id ${id} no encontrada`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Categoría eliminada exitosamente',
            datos: null
        });
    }
}
