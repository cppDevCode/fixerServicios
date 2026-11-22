import { UsuarioRepository } from '../repository/usuario.repository';
import { IUsuario } from '../interfaces/usuario.interface';
import { PrestadorService } from './prestador.service';

const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export class UsuarioService {
  private repo: UsuarioRepository;

  constructor() {
    this.repo = new UsuarioRepository();
  }

  private validarDatosRegistro(data: Omit<IUsuario, 'id' | 'createdAt'>) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Formato de email inválido');
    }

    if (!data.passwordHash || data.passwordHash.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (!data.respuestaSecretaHash || data.respuestaSecretaHash.trim() === '') {
      throw new Error('La respuesta secreta es obligatoria');
    }
  }

  async listarUsuarios(page: number = 1, limit: number = 10, search: string = '') {
    let usuarios = await this.repo.findAll();

    if (search) {
      const searchNormalizado = normalizarTexto(search);
      const ubicaciones = await this.repo.findAllUbicaciones();

      usuarios = usuarios.filter((u) => {
        const ubicacion = ubicaciones.find((ub) => ub.id === u.ubicacionId);
        const ciudad = ubicacion ? ubicacion.ciudad : '';

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
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async obtenerUsuarioPorId(id: string) {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  }

  async actualizarUsuario(id: string, data: Partial<IUsuario>) {
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
    this.validarDatosRegistro(data);

    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    return await this.repo.create(data);
  }

  async login(email: string, passwordPlana: string) {
    const user = await this.repo.findByEmail(email);

    if (!user || user.passwordHash !== passwordPlana) {
      throw new Error('Credenciales inválidas');
    }

    let prestadorId: number | null = null;

    if (user.rol === 'PRESTADOR') {
      try {
        const prestadorService = new PrestadorService();
        const prestadores = prestadorService.listar({ search: user.nombre });

        const prestadorEncontrado = prestadores.datos.find(
          (p) =>
            p.nombre.toLowerCase().trim() === user.nombre.toLowerCase().trim() &&
            p.apellido.toLowerCase().trim() === user.apellido.toLowerCase().trim()
        );

        if (prestadorEncontrado) {
          prestadorId = prestadorEncontrado.id;
        }
      } catch (error) {
        console.error('Error al buscar prestador:', error);
      }
    }

    return {
      token: 'jwt-falso-simulado-12345',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        prestadorId: prestadorId,
      },
    };
  }

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
  }
}