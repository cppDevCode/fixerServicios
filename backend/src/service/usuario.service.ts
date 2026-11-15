import { UsuarioRepository } from '../repository/usuario.repository';
import { IUsuario } from '../interfaces/usuario.interface';
import { PrestadorService } from './prestador.service';
const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); 
};
export class UsuarioService {
  private repo: UsuarioRepository;

  constructor() {
    this.repo = new UsuarioRepository();
  }

  
  async listarUsuarios(page: number = 1, limit: number = 10, search: string = '') {
    let usuarios = await this.repo.findAll();

    if (search) {
      // Normalizamos lo que escribió el usuario en el buscador
      const searchNormalizado = normalizarTexto(search);
      const ubicaciones = await this.repo.findAllUbicaciones();
      
      usuarios = usuarios.filter(u => {
        const ubicacion = ubicaciones.find(ub => ub.id === u.ubicacionId);
        const ciudad = ubicacion ? ubicacion.ciudad : '';
        
        // Normalizamos los datos del usuario y la ciudad para comparar
        const email = normalizarTexto(u.email);
        const nombre = normalizarTexto(u.nombre);
        const apellido = normalizarTexto(u.apellido);
        const ciudadNormalizada = normalizarTexto(ciudad);

        return (
          email.includes(searchNormalizado) || 
          nombre.includes(searchNormalizado) ||
          apellido.includes(searchNormalizado) ||
          ciudadNormalizada.includes(searchNormalizado)
        );
      });
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

    let prestadorId: number | null = null;
    if (user.rol === 'PRESTADOR') {
      const prestadorService = new PrestadorService();
      const prestadores = prestadorService.listar({ search: `${user.nombre} ${user.apellido}` });
      const prestadorEncontrado = prestadores.datos.find(
        p => p.nombre.toLowerCase() === user.nombre.toLowerCase() && 
             p.apellido.toLowerCase() === user.apellido.toLowerCase()
      );
      if (prestadorEncontrado) {
        prestadorId = prestadorEncontrado.id;
      }
    }

    return {
      token: 'jwt-falso-simulado-12345',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        prestadorId: prestadorId
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