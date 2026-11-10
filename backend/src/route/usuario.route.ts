import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';

const router = Router();
const controller = new UsuarioController();

// Rutas de Autenticación
router.post('/auth/login', controller.login);
router.post('/auth/pregunta-secreta', controller.getPreguntaSecreta);
router.post('/auth/recuperar-password', controller.recuperarPassword);

// Rutas de Usuarios 
router.get('/usuarios', controller.getAll);
router.get('/usuarios/:id', controller.getById);
router.post('/usuarios', controller.create);
router.patch('/usuarios/:id', controller.update);

export default router;