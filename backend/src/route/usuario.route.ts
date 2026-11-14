import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';
import { verificarPermisoAdminUsuarios } from '../middlewares/autorizacion.middleware';

const router = Router();
const controller = new UsuarioController();

// Rutas de Autenticación
router.post('/auth/login', controller.login);
router.post('/auth/pregunta-secreta', controller.getPreguntaSecreta);
router.post('/auth/recuperar-password', controller.recuperarPassword);
router.post('/auth/cambiar-password', controller.cambiarPassword);
// Rutas de Usuarios 
router.get('/usuarios', verificarPermisoAdminUsuarios, controller.getAll);
router.get('/usuarios/:id', controller.getById);
router.post('/usuarios', controller.create);
router.patch('/usuarios/:id', controller.update);

export default router;