import { IResena } from '../interfaces/resena.interface';
import { ResenaRepository } from '../repository/resena.repository';

export class ErrorValidacion extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ErrorValidacion';
    }
}

const esIdValido = (valor: unknown): valor is number =>
    typeof valor === 'number' && Number.isInteger(valor) && valor > 0;

interface QueryParams {
    prestadorId?: number | string;
    page?: number | string;
    limit?: number | string;
}

export class ResenaService {
    constructor(private repository: ResenaRepository = new ResenaRepository()) {}

    listar(params: QueryParams) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;

        let filtradas = this.repository.findAll();

        if (params.prestadorId !== undefined) {
            const prestadorId = Number(params.prestadorId);
            filtradas = filtradas.filter((r) => r.prestadorId === prestadorId);
        }

        const total = filtradas.length;
        const startIndex = (page - 1) * limit;
        const items = filtradas.slice(startIndex, startIndex + limit);

        return {
            items,
            meta: {
                pagina: page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    obtenerPorId(id: number): IResena | undefined {
        return this.repository.findById(id);
    }

    obtenerRating(prestadorId: number): number {
        const reseñasDelPrestador = this.repository
            .findAll()
            .filter((r) => r.prestadorId === prestadorId);
        return this.calcularPromedio(reseñasDelPrestador);
    }

    crear(datos: Partial<Omit<IResena, 'id' | 'createdAt'>>): IResena {
        const { prestadorId, usuarioId, calificacion, comentario } = datos;

        if (!esIdValido(prestadorId)) {
            throw new ErrorValidacion('prestadorId inválido');
        }
        if (!esIdValido(usuarioId)) {
            throw new ErrorValidacion('usuarioId inválido');
        }
        if (
            typeof calificacion !== 'number' ||
            !Number.isInteger(calificacion) ||
            calificacion < 1 ||
            calificacion > 5
        ) {
            throw new ErrorValidacion('La calificación debe ser un entero entre 1 y 5');
        }
        if (typeof comentario !== 'string' || comentario.trim() === '') {
            throw new ErrorValidacion('El comentario es obligatorio');
        }

        return this.repository.create({
            prestadorId,
            usuarioId,
            calificacion,
            comentario: comentario.trim(),
        });
    }

    actualizar(
        id: number,
        datos: Pick<IResena, 'calificacion' | 'comentario'>
        ): IResena | undefined {
        if (!esIdValido(id)) {
            throw new ErrorValidacion('El ID de la reseña es inválido');
        }

        const { calificacion, comentario } = datos;

        if (
            typeof calificacion !== 'number' ||
            !Number.isInteger(calificacion) ||
            calificacion < 1 ||
            calificacion > 5
        ) {
            throw new ErrorValidacion(
                'La calificación debe ser un entero entre 1 y 5'
            );
        }

        if (
            typeof comentario !== 'string' ||
            comentario.trim() === ''
        ) {
            throw new ErrorValidacion(
                'El comentario es obligatorio'
            );
        }

        return this.repository.update(id, {
            calificacion,
            comentario: comentario.trim(),
        });
    }

    eliminar(id: number): boolean {
        return this.repository.delete(id);
    }

    calcularPromedio(resenas: IResena[]): number {
        if (resenas.length === 0) return 0;
        const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
        return Math.round((suma / resenas.length) * 10) / 10;
    }
}