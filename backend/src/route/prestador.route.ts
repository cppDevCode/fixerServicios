import { Router } from "express";
import { PrestadorController } from "../controller/prestador.controller";
import {
    verificarPermisoCrearOEliminarPrestador,
    verificarPermisoEditarPrestador,
} from "../middlewares/autorizacion.middleware";

const router = Router();
const controller = new PrestadorController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', verificarPermisoCrearOEliminarPrestador, controller.crear);
router.put('/:id', verificarPermisoEditarPrestador, controller.actualizar);
router.put('/', verificarPermisoEditarPrestador, controller.actualizar);
router.delete('/', verificarPermisoCrearOEliminarPrestador, controller.eliminar);
router.delete('/:id', verificarPermisoCrearOEliminarPrestador, controller.eliminar);

export default router;
