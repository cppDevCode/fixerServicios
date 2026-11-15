import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../service/usuario.service';
import { PrestadorService } from '../service/prestador.service';

export class UsuarioController {
  private service: UsuarioService;
  private prestadorService: PrestadorService;

  constructor() {
    this.service = new UsuarioService();
    this.prestadorService = new PrestadorService();
  }

  // Métodos usuarios

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
      res.status(200).json({ code: 200, msg: 'Ok', data: user });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.actualizarUsuario(req.params.id, req.body);
      res.status(200).json({ code: 200, msg: 'Usuario actualizado', data: user });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, apellido, email, password, preguntaSecreta, respuestaSecreta, esPrestador, especialidad } = req.body;
      
      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ code: 400, msg: 'Faltan datos obligatorios', data: null });
      }

      const rol = esPrestador ? 'PRESTADOR' : 'USUARIO';

      // 1. Creación del usuario base
      const nuevoUsuario = await this.service.crearUsuario({
        nombre,
        apellido,
        email,
        passwordHash: password,
        rol: rol,
        preguntaSecreta,
        respuestaSecretaHash: respuestaSecreta,
        ubicacionId: undefined,
      });

      // 2. Si es prestador, se crea su perfil profesional en la entidad Prestador
      if (esPrestador && especialidad) {
        try {
          this.prestadorService.crear({
            nombre: nombre,
            apellido: apellido,
            matricula: `MAT-${Date.now()}`,
            aniosExperiencia: 0, 
            acercaDe: 'Profesional registrado en Fixer',
            ofreceGarantia: false,
            categoriaId: especialidad,
            telefono: { codPais: '+54', codArea: '11', nroTelefono: '' },
            usuarioId: nuevoUsuario.id 
          } as any); 
        } catch (errorPrestador) {
          console.error('Error al crear el prestador vinculado:', errorPrestador);
        }
      }

      res.status(201).json({ code: 201, msg: 'Usuario registrado exitosamente', data: nuevoUsuario });
    } catch (error: any) {
      if (error.message === 'El email ya está registrado') {
        return res.status(400).json({ code: 400, msg: error.message, data: null });
      }
      next(error);
    }
  };
  
  //Metodos de autenticación y recuperación de contraseña

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ code: 400, msg: 'Email y contraseña son requeridos', data: null });
      }

      const result = await this.service.login(email, password);

      res.status(200).json({ code: 200, msg: 'Login exitoso', data: result });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Credenciales inválidas') {
        return res.status(401).json({ code: 401, msg: error.message, data: null });
      }
      next(error);
    }
  };

  getPreguntaSecreta = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this.service.obtenerPreguntaSecreta(email);
      res.status(200).json({ code: 200, msg: 'Pregunta obtenida', data: result });
    } catch (error: any) {
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ code: 404, msg: error.message, data: null });
      }
      next(error);
    }
  };

  recuperarPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, respuesta } = req.body;
      const result = await this.service.recuperarPassword(email, respuesta);
      res.status(200).json({ code: 200, msg: 'Ok', data: result });
    } catch (error: unknown) {
      next(error);
    }
  };

  cambiarPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, nuevaPassword } = req.body;
      if (!email || !nuevaPassword) {
        return res.status(400).json({ code: 400, msg: 'Faltan datos obligatorios', data: null });
      }
      
      const user = await this.service.obtenerPreguntaSecreta(email); 
      await this.service.actualizarUsuario(user.id, { passwordHash: nuevaPassword });
      
      res.status(200).json({ code: 200, msg: 'Contraseña actualizada exitosamente', data: null });
    } catch (error: any) {
      next(error);
    }
  };
}