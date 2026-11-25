import { Request, Response } from 'express';
import { IPrestador } from '../interfaces/prestador.interface';
import { RespuestaApi } from '../interfaces/respuestaApi.interface';
import {
    UsuarioRepository,
    usuarioRepositorySingleton,
} from '../repository/usuario.repository';
import {
    EmailService,
    emailServiceSingleton,
    generarPasswordSeguraAleatoria,
} from '../service/email.service';
import {
    ErrorValidacionPrestador,
    PrestadorService,
} from '../service/prestador.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class PrestadorController {
    constructor(
        private readonly service = new PrestadorService(),
        private readonly usuarioRepo: UsuarioRepository = usuarioRepositorySingleton,
        private readonly emailService: EmailService = emailServiceSingleton
    ) {}

    public listar = (req: Request, res: Response): void => {
        const {
            page,
            limit,
            rubro,
            provincia,
            localidad,
            search,
            sortBy,
            order,
        } = req.query;

        const { datos, meta } = this.service.listar({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            rubro: rubro ? String(rubro) : undefined,
            provincia: provincia ? String(provincia) : undefined,
            localidad: localidad ? String(localidad) : undefined,
            search: search ? String(search) : undefined,
            sortBy: sortBy ? (String(sortBy) as keyof IPrestador) : undefined,
            order: order === 'desc' ? 'desc' : 'asc',
        });

        const respuesta: RespuestaApi<IPrestador[]> = {
            codigo: 200,
            msj: 'Prestadores obtenidos correctamente',
            datos,
            meta,
        };

        res.status(200).json(respuesta);
    };

    public obtenerPorId = (req: Request, res: Response): void => {
        const id = Number(req.params.id);
        const prestador = this.service.obtenerPorId(id);

        if (!prestador) {
            res.status(404).json({
                codigo: 404,
                msj: `Prestador con id ${id} no encontrado`,
                datos: null,
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Prestador encontrado',
            datos: prestador,
        });
    };

    public crear = (req: Request, res: Response): void | Promise<void> => {
        const {
            nombre,
            apellido,
            email,
            fotoUrl,
            categoriaId,
            ubicacionId,
            aniosExperiencia,
            acercaDe,
            ofreceGarantia,
            telefono,
            codigoPostal,
            radio,
        } = req.body ?? {};

        if (
            !nombre ||
            !apellido ||
            categoriaId === undefined ||
            categoriaId === null ||
            String(categoriaId).trim() === ''
        ) {
            res.status(400).json({
                codigo: 400,
                msj: 'Los campos nombre, apellido y categoriaId son obligatorios',
                datos: null,
            });
            return;
        }

        const rolHeader =
            typeof req.headers?.['x-usuario-rol'] === 'string'
                ? req.headers['x-usuario-rol'].trim().toUpperCase()
                : undefined;

        const emailLimpio =
            typeof email === 'string' && email.trim() !== ''
                ? email.trim().toLowerCase()
                : undefined;

        if (rolHeader === 'ADMIN' && !emailLimpio) {
            res.status(400).json({
                codigo: 400,
                msj: 'El correo electrónico del prestador es obligatorio para generar y enviar sus credenciales de acceso',
                datos: null,
            });
            return;
        }

        if (emailLimpio && !EMAIL_REGEX.test(emailLimpio)) {
            res.status(400).json({
                codigo: 400,
                msj: 'Formato de correo electrónico inválido',
                datos: null,
            });
            return;
        }

        const fotoLimpia =
            typeof fotoUrl === 'string' && fotoUrl.trim() !== ''
                ? fotoUrl.trim()
                : undefined;

        const provinciaLimpia =
            typeof req.body.provincia === 'string' &&
            req.body.provincia.trim() !== ''
                ? req.body.provincia.trim()
                : undefined;

        const localidadLimpia =
            typeof req.body.localidad === 'string' &&
            req.body.localidad.trim() !== ''
                ? req.body.localidad.trim()
                : undefined;

        const codigoPostalLimpio =
            codigoPostal !== undefined &&
            codigoPostal !== null &&
            String(codigoPostal).trim() !== ''
                ? String(codigoPostal).trim()
                : undefined;

        const radioNumerico =
            radio !== undefined && Number.isFinite(Number(radio)) && Number(radio) > 0
                ? Number(radio)
                : undefined;

        const ubicacionIdNumerica =
            ubicacionId !== undefined &&
            Number.isInteger(Number(ubicacionId)) &&
            Number(ubicacionId) > 0
                ? Number(ubicacionId)
                : undefined;

        const datosPrestador = {
            nombre,
            apellido,
            fotoUrl: fotoLimpia,
            matricula: req.body.matricula,
            aniosExperiencia: Number(aniosExperiencia) || 0,
            acercaDe: acercaDe || '',
            ofreceGarantia: Boolean(ofreceGarantia),
            categoriaId,
            ubicacionId: ubicacionIdNumerica,
            provincia: provinciaLimpia,
            localidad: localidadLimpia,
            codigoPostal: codigoPostalLimpio,
            radio: radioNumerico,
            telefono: telefono || {
                codPais: '+54',
                codArea: '11',
                nroTelefono: '',
            },
        };

        if (!emailLimpio) {
            try {
                const nuevo: IPrestador = this.service.crear(datosPrestador);
                res.status(201).json({
                    codigo: 201,
                    msj: 'Prestador creado exitosamente',
                    datos: nuevo,
                });
            } catch (error: unknown) {
                if (error instanceof ErrorValidacionPrestador) {
                    res.status(400).json({
                        codigo: 400,
                        msj: error.message,
                        datos: null,
                    });
                    return;
                }
                throw error;
            }
            return;
        }

        return this.crearConCuentaYCorreo(datosPrestador, emailLimpio, res);
    };

    private crearConCuentaYCorreo = async (
        datosPrestador: Parameters<PrestadorService['crear']>[0],
        emailLimpio: string,
        res: Response
    ): Promise<void> => {
        try {
            const usuarioExistente =
                await this.usuarioRepo.findByEmail(emailLimpio);
            if (usuarioExistente) {
                res.status(409).json({
                    codigo: 409,
                    msj: `Ya existe una cuenta registrada con el correo ${emailLimpio}`,
                    datos: null,
                });
                return;
            }

            const nuevo: IPrestador = this.service.crear(datosPrestador);
            const passwordTemporal = generarPasswordSeguraAleatoria(12);

            await this.usuarioRepo.create({
                nombre: nuevo.nombre,
                apellido: nuevo.apellido,
                email: emailLimpio,
                passwordHash: passwordTemporal,
                rol: 'PRESTADOR',
                prestadorId: nuevo.id,
                ubicacionId: nuevo.ubicacionId,
                telefono: nuevo.telefono,
                debeCambiarPassword: true,
            });

            const correo = await this.emailService.enviarCredencialesTemporales({
                destinatario: emailLimpio,
                nombre: nuevo.nombre,
                apellido: nuevo.apellido,
                passwordTemporal,
            });

            res.status(201).json({
                codigo: 201,
                msj: `Prestador creado exitosamente. Se enviaron las credenciales temporales a ${emailLimpio}`,
                datos: nuevo,
                credenciales: {
                    email: correo.para,
                    enviado: true,
                    modo: correo.modo,
                    debeCambiarPassword: true,
                },
            });
        } catch (error: unknown) {
            if (error instanceof ErrorValidacionPrestador) {
                res.status(400).json({
                    codigo: 400,
                    msj: error.message,
                    datos: null,
                });
                return;
            }
            throw error;
        }
    };

    public actualizar = (req: Request, res: Response): void => {
        const id = Number(req.params.id || req.body?.id);

        if (!id || !Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id del prestador para actualizar',
                datos: null,
            });
            return;
        }

        try {
            const payload = { ...(req.body ?? {}) };
            if (
                payload.codigoPostal !== undefined &&
                payload.codigoPostal !== null
            ) {
                payload.codigoPostal = String(payload.codigoPostal).trim();
            }

            const actualizado: IPrestador | null = this.service.actualizar(
                id,
                payload
            );

            if (!actualizado) {
                res.status(404).json({
                    codigo: 404,
                    msj: `Prestador con id ${id} no encontrado`,
                    datos: null,
                });
                return;
            }

            res.status(200).json({
                codigo: 200,
                msj: 'Prestador actualizado exitosamente',
                datos: actualizado,
            });
        } catch (error: unknown) {
            if (error instanceof ErrorValidacionPrestador) {
                res.status(400).json({
                    codigo: 400,
                    msj: error.message,
                    datos: null,
                });
                return;
            }
            throw error;
        }
    };

    public eliminar = (req: Request, res: Response): void => {
        const id: number = Number(req.params.id || req.body?.id);

        if (!id || !Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                codigo: 400,
                msj: 'Se requiere el id del prestador para eliminar',
                datos: null,
            });
            return;
        }

        const eliminado = this.service.eliminar(id);

        if (!eliminado) {
            res.status(404).json({
                codigo: 404,
                msj: `Prestador con id ${id} no encontrado`,
                datos: null,
            });
            return;
        }

        res.status(200).json({
            codigo: 200,
            msj: 'Prestador eliminado exitosamente',
            datos: null,
        });
    };
}
