import {
    IActualizarUsuarioPayload,
    IUsuario,
    IUsuarioPublico,
} from '../interfaces/usuario.interface';
import {
    UbicacionRepository,
    ubicacionRepositorySingleton,
} from '../repository/ubicacion.repository';
import {
    UsuarioRepository,
    usuarioRepositorySingleton,
} from '../repository/usuario.repository';
import { PrestadorService } from './prestador.service';

const normalizarTexto = (texto: string): string => {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

export class UsuarioService {
    constructor(
        private readonly repo: UsuarioRepository = usuarioRepositorySingleton,
        private readonly ubicacionRepo: UbicacionRepository = ubicacionRepositorySingleton
    ) {}

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

    private proyectarPublico(usuario: IUsuario): IUsuarioPublico {
        const {
            passwordHash: _passwordHash,
            respuestaSecretaHash: _respuestaSecretaHash,
            ...datosPublicos
        } = usuario;
        void _passwordHash;
        void _respuestaSecretaHash;

        const ubicacion =
            usuario.ubicacionId !== undefined
                ? this.ubicacionRepo.findById(usuario.ubicacionId)
                : undefined;

        return {
            ...datosPublicos,
            ...(ubicacion
                ? {
                      ubicacion,
                      codigoPostal: ubicacion.codigoPostal,
                      radio: ubicacion.radio,
                  }
                : {}),
        };
    }

    async listarUsuarios(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ) {
        let usuarios = await this.repo.findAll();

        if (search) {
            const searchNormalizado = normalizarTexto(search);
            const ubicaciones = await this.repo.findAllUbicaciones();

            usuarios = usuarios.filter((u) => {
                const ubicacion = ubicaciones.find((ub) => ub.id === u.ubicacionId);
                const localidad = ubicacion ? ubicacion.localidad : '';
                const provincia = ubicacion ? ubicacion.provincia : '';

                const email = normalizarTexto(u.email);
                const nombre = normalizarTexto(u.nombre);
                const apellido = normalizarTexto(u.apellido);
                const localidadNormalizada = normalizarTexto(localidad);
                const provinciaNormalizada = normalizarTexto(provincia);

                return (
                    email.includes(searchNormalizado) ||
                    nombre.includes(searchNormalizado) ||
                    apellido.includes(searchNormalizado) ||
                    localidadNormalizada.includes(searchNormalizado) ||
                    provinciaNormalizada.includes(searchNormalizado)
                );
            });
        }

        const total = usuarios.length;
        const startIndex = (page - 1) * limit;
        const items = usuarios
            .slice(startIndex, startIndex + limit)
            .map((u) => this.proyectarPublico(u));

        return {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async obtenerUsuarioPorId(id: number): Promise<IUsuarioPublico> {
        const usuario = await this.repo.findById(id);
        if (!usuario) throw new Error('Usuario no encontrado');
        return this.proyectarPublico(usuario);
    }

    async actualizarUsuario(
        id: number,
        data: IActualizarUsuarioPayload
    ): Promise<IUsuarioPublico> {
        const actual = await this.repo.findById(id);
        if (!actual) throw new Error('Usuario no encontrado');

        if (data.email) {
            const existing = await this.repo.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new Error('El email ya está en uso por otro usuario');
            }
        }

        const {
            codigoPostal,
            radio,
            provincia,
            localidad,
            ...camposUsuario
        } = data;

        let ubicacionIdActualizada = camposUsuario.ubicacionId ?? actual.ubicacionId;
        const tieneCambioGeo =
            codigoPostal !== undefined ||
            radio !== undefined ||
            provincia !== undefined ||
            localidad !== undefined;

        if (tieneCambioGeo) {
            const radioNumerico =
                radio !== undefined && Number.isFinite(Number(radio)) && Number(radio) > 0
                    ? Number(radio)
                    : undefined;

            if (ubicacionIdActualizada !== undefined) {
                const existente = this.ubicacionRepo.findById(ubicacionIdActualizada);
                if (existente) {
                    const nuevaUbicacion = this.ubicacionRepo.findOrCreate({
                        pais: existente.pais,
                        provincia: provincia ?? existente.provincia,
                        localidad: localidad ?? existente.localidad,
                        codigoPostal: codigoPostal ?? existente.codigoPostal,
                        radio: radioNumerico ?? existente.radio,
                    });
                    ubicacionIdActualizada = nuevaUbicacion.id;
                }
            } else {
                const nuevaUbicacion = this.ubicacionRepo.findOrCreate({
                    provincia,
                    localidad,
                    codigoPostal,
                    radio: radioNumerico,
                });
                ubicacionIdActualizada = nuevaUbicacion.id;
            }
        }

        const updated = await this.repo.update(id, {
            ...camposUsuario,
            ...(tieneCambioGeo ? { ubicacionId: ubicacionIdActualizada } : {}),
        });
        if (!updated) throw new Error('Usuario no encontrado');

        return this.proyectarPublico(updated);
    }

    async crearUsuario(
        data: Omit<IUsuario, 'id' | 'createdAt'>
    ): Promise<IUsuarioPublico> {
        this.validarDatosRegistro(data);

        const existing = await this.repo.findByEmail(data.email);
        if (existing) {
            throw new Error('El email ya está registrado');
        }

        if (data.ubicacionId !== undefined) {
            const ubicacionExiste = this.ubicacionRepo.findById(data.ubicacionId);
            if (!ubicacionExiste) {
                throw new Error(`La ubicación con id ${data.ubicacionId} no existe`);
            }
        }

        const creado = await this.repo.create(data);
        return this.proyectarPublico(creado);
    }

    async login(email: string, passwordPlana: string) {
        const user = await this.repo.findByEmail(email);

        if (!user || user.passwordHash !== passwordPlana) {
            throw new Error('Credenciales inválidas');
        }

        let prestadorId: number | null = user.prestadorId ?? null;

        if (user.rol === 'PRESTADOR' && !prestadorId) {
            try {
                const prestadorService = new PrestadorService();
                const prestadores = prestadorService.listar({
                    limit: 100,
                    search: user.nombre,
                });

                const prestadorEncontrado = prestadores.datos.find(
                    (p) =>
                        normalizarTexto(p.nombre.trim()) ===
                            normalizarTexto(user.nombre.trim()) &&
                        normalizarTexto(p.apellido.trim()) ===
                            normalizarTexto(user.apellido.trim())
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
                prestadorId,
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
