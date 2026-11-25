import { Request, Response, NextFunction } from 'express';
import { IPrestador } from '../interfaces/prestador.interface';
import { PrestadorService } from '../service/prestador.service';
import {
    ErrorCredencialesInvalidas,
    ErrorCuentaBloqueada,
    ErrorValidacionUsuario,
    UsuarioService,
} from '../service/usuario.service';

const parsearIdEnteroPositivo = (valor: unknown): number | null => {
    const num = Number(valor);
    return Number.isInteger(num) && num > 0 ? num : null;
};

export class UsuarioController {
    private readonly service: UsuarioService;
    private readonly prestadorService: PrestadorService;

    constructor(
        service = new UsuarioService(),
        prestadorService = new PrestadorService()
    ) {
        this.service = service;
        this.prestadorService = prestadorService;
    }

    // Métodos usuarios

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || '';

            const result = await this.service.listarUsuarios(page, limit, search);

            res.status(200).json({
                code: 200,
                msg: 'Ok',
                data: result.items,
                meta: result.meta,
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parsearIdEnteroPositivo(req.params.id);
            if (id === null) {
                return res
                    .status(400)
                    .json({ code: 400, msg: 'ID de usuario inválido', data: null });
            }

            const user = await this.service.obtenerUsuarioPorId(id);
            res.status(200).json({ code: 200, msg: 'Ok', data: user });
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'Usuario no encontrado') {
                return res
                    .status(404)
                    .json({ code: 404, msg: error.message, data: null });
            }
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parsearIdEnteroPositivo(req.params.id);
            if (id === null) {
                return res
                    .status(400)
                    .json({ code: 400, msg: 'ID de usuario inválido', data: null });
            }

            const user = await this.service.actualizarUsuario(id, req.body);
            res
                .status(200)
                .json({ code: 200, msg: 'Usuario actualizado', data: user });
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'Usuario no encontrado') {
                return res
                    .status(404)
                    .json({ code: 404, msg: error.message, data: null });
            }
            if (
                error instanceof Error &&
                error.message === 'El email ya está en uso por otro usuario'
            ) {
                return res
                    .status(400)
                    .json({ code: 400, msg: error.message, data: null });
            }
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                nombre,
                apellido,
                email,
                password,
                preguntaSecreta,
                respuestaSecreta,
                esPrestador,
                especialidad,
                ubicacionId,
            } = req.body ?? {};

            if (!nombre || !apellido || !email || !password) {
                return res
                    .status(400)
                    .json({ code: 400, msg: 'Faltan datos obligatorios', data: null });
            }

            const rol = esPrestador ? 'PRESTADOR' : 'USUARIO';

            // 1. Si es prestador, se crea su perfil profesional en la entidad Prestador
            let prestadorCreado: IPrestador | null = null;
            if (esPrestador) {
                try {
                    prestadorCreado = this.prestadorService.crear({
                        nombre,
                        apellido,
                        matricula: `MAT-${Date.now()}`,
                        aniosExperiencia: 0,
                        acercaDe: 'Profesional registrado en Fixer',
                        ofreceGarantia: false,
                        categoriaId: especialidad || 1,
                        ubicacionId:
                            parsearIdEnteroPositivo(ubicacionId) ?? undefined,
                        telefono: { codPais: '+54', codArea: '11', nroTelefono: '' },
                    });
                } catch (errorPrestador: unknown) {
                    console.error(
                        'Error al crear el prestador vinculado:',
                        errorPrestador
                    );
                }
            }

            // 2. Creación del usuario base vinculado a su prestadorId
            const nuevoUsuario = await this.service.crearUsuario({
                nombre,
                apellido,
                email,
                passwordHash: password,
                rol,
                prestadorId: prestadorCreado?.id,
                preguntaSecreta,
                respuestaSecretaHash: respuestaSecreta,
                ubicacionId: parsearIdEnteroPositivo(ubicacionId) ?? undefined,
            });

            res.status(201).json({
                code: 201,
                msg: 'Usuario registrado exitosamente',
                data: {
                    usuario: nuevoUsuario,
                    prestador: prestadorCreado,
                },
            });
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                (error.message === 'El email ya está registrado' ||
                    error.message === 'Formato de email inválido' ||
                    error.message ===
                        'La contraseña debe tener al menos 6 caracteres' ||
                    error.message === 'La respuesta secreta es obligatoria')
            ) {
                return res
                    .status(400)
                    .json({ code: 400, msg: error.message, data: null });
            }
            next(error);
        }
    };

    // Métodos de autenticación y recuperación de contraseña

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body ?? {};

            if (!email || !password) {
                return res.status(400).json({
                    code: 400,
                    msg: 'Email y contraseña son requeridos',
                    data: null,
                });
            }

            const result = await this.service.login(email, password);

            res
                .status(200)
                .json({ code: 200, msg: 'Login exitoso', data: result });
        } catch (error: unknown) {
            if (error instanceof ErrorCuentaBloqueada) {
                return res.status(423).json({
                    code: 423,
                    msg: error.message,
                    data: {
                        bloqueadoHasta: error.bloqueadoHasta,
                        minutosRestantes: error.minutosRestantes,
                    },
                });
            }
            if (error instanceof Error && error.message === 'Credenciales inválidas') {
                return res
                    .status(401)
                    .json({ code: 401, msg: error.message, data: null });
            }
            next(error);
        }
    };

    cambiarPasswordAutenticado = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = parsearIdEnteroPositivo(req.params.id);
            if (id === null) {
                return res
                    .status(400)
                    .json({ code: 400, msg: 'ID de usuario inválido', data: null });
            }

            const rolHeader =
                typeof req.headers['x-usuario-rol'] === 'string'
                    ? req.headers['x-usuario-rol'].trim().toUpperCase()
                    : undefined;
            const usuarioIdHeader = parsearIdEnteroPositivo(
                req.headers['x-usuario-id']
            );

            if (
                rolHeader &&
                rolHeader !== 'ADMIN' &&
                usuarioIdHeader !== null &&
                usuarioIdHeader !== id
            ) {
                return res.status(403).json({
                    code: 403,
                    msg: 'Acceso denegado: solo podés cambiar tu propia contraseña',
                    data: null,
                });
            }

            const { passwordActual, nuevaPassword, confirmarPassword } =
                req.body ?? {};

            const resultado = await this.service.cambiarPasswordAutenticado(id, {
                passwordActual:
                    typeof passwordActual === 'string' ? passwordActual : '',
                nuevaPassword:
                    typeof nuevaPassword === 'string' ? nuevaPassword : '',
                confirmarPassword:
                    typeof confirmarPassword === 'string'
                        ? confirmarPassword
                        : '',
            });

            res.status(200).json({
                code: 200,
                msg: resultado.mensaje,
                data: resultado,
            });
        } catch (error: unknown) {
            if (error instanceof ErrorValidacionUsuario) {
                return res
                    .status(400)
                    .json({ code: 400, msg: error.message, data: null });
            }
            if (error instanceof ErrorCredencialesInvalidas) {
                return res.status(401).json({
                    code: 401,
                    msg: error.message,
                    data: { intentosRestantes: error.intentosRestantes },
                });
            }
            if (error instanceof ErrorCuentaBloqueada) {
                return res.status(423).json({
                    code: 423,
                    msg: error.message,
                    data: {
                        bloqueadoHasta: error.bloqueadoHasta,
                        minutosRestantes: error.minutosRestantes,
                    },
                });
            }
            if (error instanceof Error && error.message === 'Usuario no encontrado') {
                return res
                    .status(404)
                    .json({ code: 404, msg: error.message, data: null });
            }
            next(error);
        }
    };

    getPreguntaSecreta = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email } = req.body ?? {};
            const result = await this.service.obtenerPreguntaSecreta(email);
            res
                .status(200)
                .json({ code: 200, msg: 'Pregunta obtenida', data: result });
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'Usuario no encontrado') {
                return res
                    .status(404)
                    .json({ code: 404, msg: error.message, data: null });
            }
            next(error);
        }
    };

    recuperarPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email, respuesta } = req.body ?? {};
            const result = await this.service.recuperarPassword(email, respuesta);
            res.status(200).json({ code: 200, msg: 'Ok', data: result });
        } catch (error: unknown) {
            next(error);
        }
    };

    cambiarPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email, nuevaPassword } = req.body ?? {};
            if (!email || !nuevaPassword) {
                return res
                    .status(400)
                    .json({ code: 400, msg: 'Faltan datos obligatorios', data: null });
            }

            const user = await this.service.obtenerPreguntaSecreta(email);
            await this.service.actualizarUsuario(user.id, {
                passwordHash: nuevaPassword,
            });

            res.status(200).json({
                code: 200,
                msg: 'Contraseña actualizada exitosamente',
                data: null,
            });
        } catch (error: unknown) {
            next(error);
        }
    };
}
