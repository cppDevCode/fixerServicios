import { UsuarioRepository } from '../repository/usuario.repository';
import { IUsuario } from '../interfaces/usuario.interface';

export class UsuarioService {
  private repo: UsuarioRepository;

  constructor() {
    this.repo = new UsuarioRepository();
  }

  async listarUsuarios(page: number = 1, limit: number = 10, search: string = '') {
    let usuarios = await this.repo.findAll();

    // Filtro por búsqueda (email o ciudad)
    if (search) {
      const lowerSearch = search.toLowerCase();
      usuarios = usuarios.filter(u => 
        u.email.toLowerCase().includes(lowerSearch) || 
        u.nombre.toLowerCase().includes(lowerSearch) ||
        u.apellido.toLowerCase().includes(lowerSearch)
      );
    }

    const total = usuarios.length;
    const startIndex = (page - 1) * limit;
    const items = usuarios.slice(startIndex, startIndex + limit);
    const usuariosSeguros = items.map((u) => {
      const copia = { ...u };
      copia.passwordHash = undefined as any;
      copia.respuestaSecretaHash = undefined as any;
      return copia;
    });

    return {
      items: usuariosSeguros,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async obtenerUsuarioPorId(id: string) {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  }

  async actualizarUsuario(id: string, data: Partial<IUsuario>) {
    // Validación básica: no permitir cambiar el ID ni el email a uno existente
    if (data.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('El email ya está en uso por otro usuario');
      }
    }
    
    const updated = await this.repo.update(id, data);
    if (!updated) throw new Error('Usuario no encontrado');
    return updated;
  }

  async crearUsuario(data: Omit<IUsuario, 'id' | 'createdAt'>) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new Error('El email ya está registrado');
    }
    return await this.repo.create(data);
  }
  
  // Lógica de Autenticación
  async login(email: string, passwordPlana: string) {
    const user = await this.repo.findByEmail(email);
    
    
    if (!user || user.passwordHash !== passwordPlana) {
      throw new Error('Credenciales inválidas');
    }

    // Simulamos el JWT
    return {
      token: 'jwt-falso-simulado-12345',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    };
  }

    // Lógica de Recuperación
  async obtenerPreguntaSecreta(email: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');
    return { id: user.id, preguntaSecreta: user.preguntaSecreta };
  }

  async recuperarPassword(email: string, respuestaPlana: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');

    if (user.respuestaSecretaHash !== respuestaPlana) {
      throw new Error('Respuesta secreta incorrecta');
    }

    return { mensaje: 'Contraseña restablecida exitosamente' };
  }}