import { Request, Response } from "express";
import { IPrestador } from "../interfaces/prestador.interface";
import { RespuestaApi } from "../interfaces/respuestaApi.interface";
import { PrestadorService } from "../service/prestador.service";

export class PrestadorController {
    constructor(private readonly service = new PrestadorService) {}

    public listar = (req: Request, res: Response): void => {
        const { page, limit, rubro, provincia, localidad, search, sortBy, order } = req.query;
        
        const { datos, meta } = this.service.listar({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            rubro: rubro ? String(rubro) : undefined,
            provincia: provincia ? String(provincia) : undefined,
            localidad: localidad ? String(localidad) : undefined,
            search: search ? String(search) : undefined,
            sortBy: sortBy ? (String(sortBy) as keyof IPrestador) : undefined,
            order: order === 'desc' ? 'desc' : 'asc'
        });

        const respuesta: RespuestaApi<IPrestador[]> = {
            codigo: 200,
            msj: 'Prestadores obtenidos correctamente',
            datos,
            meta
        };

        res.status(200).json(respuesta);
    }

    public obtenerPorId = (req: Request, res: Response): void => {
        const id = Number(req.params.id);
        const prestador = this.service.obtenerPorId(id);

        if (!prestador) {
            res.status(404).json({
                codigo: 404,
                msj: `Prestador con id ${id} no encontrado`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Prestador encontrado',
            datos: prestador
        });
    }

    public crear = (req: Request, res: Response): void => {
        const {nombre, apellido, fotoUrl, categoriaId, aniosExperiencia, acercaDe, ofreceGarantia, telefono} = req.body;

        if (!nombre || !apellido || !categoriaId) {
            res.status(400).json({
                codigo: 400,
                msj: 'Los campos nombre, apellido y categoriaId son obligatorios',
                datos: null
            });
            return;
        }

        const fotoLimpia =
            typeof fotoUrl === 'string' && fotoUrl.trim() !== ''
                ? fotoUrl.trim()
                : undefined;

        const provinciaLimpia =
            typeof req.body.provincia === 'string' && req.body.provincia.trim() !== ''
                ? req.body.provincia.trim()
                : undefined;

        const localidadLimpia =
            typeof req.body.localidad === 'string' && req.body.localidad.trim() !== ''
                ? req.body.localidad.trim()
                : undefined;

        const nuevo: IPrestador = this.service.crear({
            nombre,
            apellido,
            fotoUrl: fotoLimpia,
            matricula: req.body.matricula,
            aniosExperiencia: Number(aniosExperiencia) || 0,
            acercaDe: acercaDe || '',
            ofreceGarantia: Boolean(ofreceGarantia),
            categoriaId,
            provincia: provinciaLimpia,
            localidad: localidadLimpia,
            telefono: telefono || { codPais: '+54', codArea: '11', nroTelefono: ''},
            ratingPromedio: req.body.ratingPromedio
        });

        res.status(201).json({
            codigo: 201,
            msj: 'Prestador creado exitosamente',
            datos: nuevo
        });
    }

    public actualizar = (req: Request, res: Response): void => {
        const id = Number(req.params.id || req.body.id);

        if (!id) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id del prestador para actualizar',
                datos: null
            });
            return;
        }

        const actualizado: IPrestador | null = this.service.actualizar(id, req.body);

        if (!actualizado) {
            res.status(404).json({
                codigo: 404,
                msj: `Prestador con id ${id} no encontrado`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Prestador actualizado exitosamente',
            datos: actualizado
        });
    }

    public eliminar = (req: Request, res: Response): void => {
        const id: number = Number(req.params.id || req.body.id);

        if (!id) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id del prestador para eliminar',
                datos: null
            });
            return;
        }

        const eliminado = this.service.eliminar(id);

        if (!eliminado) {
            res.status(404).json({
                codigo: 404,
                msj: `Prestador con id ${id} no encontrado`,
                datos: null
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Prestador eliminado exitosamente',
            datos: null
        });
    }
}
