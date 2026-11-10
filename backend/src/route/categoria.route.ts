import { Router } from "express";
import { CategoriaController } from "../controller/categoria.controller";

const router = Router();
const controller = new CategoriaController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.put('/', controller.actualizar);
router.delete('/', controller.eliminar);
router.delete('/:id', controller.eliminar);

export default router;
