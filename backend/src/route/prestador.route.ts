import { Router } from "express";
import { PrestadorController } from "../controller/prestador.controller";

const router = Router();
const controller = new PrestadorController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.put('/', controller.actualizar);
router.delete('/',controller.eliminar);
router.delete('/:id', controller.eliminar);

export default router;
