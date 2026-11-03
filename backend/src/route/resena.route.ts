import { Router } from "express";
import { ResenaController } from "../controller/resena.controller";

const router = Router();
const controller = new ResenaController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.delete('/:id', controller.eliminar);

export default router;