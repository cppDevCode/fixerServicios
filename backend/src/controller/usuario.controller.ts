import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../service/usuario.service';

export class UsuarioController {
  private service: UsuarioService;

  constructor() {
    this.service = new UsuarioService();
  }

  // --- MÉTODOS DE USUARIO ---

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string || '';

      const result = await this.service.listarUsuarios(page, limit, search);

      res.status(200).json({
        code: 200,
        msg: 'Ok',
        data: result.items,
        meta: result.meta
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.obtenerUsuarioPorId(req.params.id);

      res.status(200).json({
        code: 200,
        msg: 'Ok',
        data: user
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.actualizarUsuario(req.params.id, req.body);

      res.status(200).json({
        code: 200,
        msg: 'Usuario actualizado',
        data: user
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, apellido, email, password, preguntaSecreta, respuestaSecreta } = req.body;
      
      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ code: 400, msg: 'Faltan datos obligatorios', data: null });
      }

      const nuevoUsuario = await this.service.crearUsuario({
        nombre,
        apellido,
        email,
        passwordHash: password,
        rol: 'USUARIO',
        preguntaSecreta,
        respuestaSecretaHash: respuestaSecreta,
        ubicacionId: undefined,
      });

      res.status(201).json({ code: 201, msg: 'Usuario registrado exitosamente', data: nuevoUsuario });
    } catch (error: any) {
      if (error.message === 'El email ya está registrado') {
        return res.status(400).json({ code: 400, msg: error.message, data: null });
      }
      next(error);
    }
  };
  
  // --- MÉTODOS DE AUTH ---

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          code: 400,
          msg: 'Email y contraseña son requeridos',
          data: null
        });
      }

      const result = await this.service.login(email, password);

      res.status(200).json({
        code: 200,
        msg: 'Login exitoso',
        data: result
      });
    } catch (error: unknown) {
      // Si es error de credenciales, devolvemos 401
      if (error instanceof Error && error.message === 'Credenciales inválidas') {
        return res.status(401).json({
          code: 401,
          msg: error.message,
          data: null
        });
      }

      next(error);
    }
  };

  getPreguntaSecreta = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const result = await this.service.obtenerPreguntaSecreta(email);

      res.status(200).json({
        code: 200,
        msg: 'Pregunta obtenida',
        data: result
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Usuario no encontrado') {
        return res.status(404).json({
          code: 404,
          msg: error.message,
          data: null
        });
      }

      next(error);
    }
  };

  recuperarPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, respuesta } = req.body;

      const result = await this.service.recuperarPassword(email, respuesta);

      res.status(200).json({
        code: 200,
        msg: 'Ok',
        data: result
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}