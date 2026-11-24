import { ICategoria } from '../interfaces/categoria.interface';
import {
    CategoriaRepository,
    categoriaRepositorySingleton,
    generarSlugCategoria,
} from '../repository/categoria.repository';
import {
    PrestadorRepository,
    prestadorRepositorySingleton,
} from '../repository/prestador.repository';

export class ErrorIntegridadCategoria extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 409
    ) {
        super(message);
        this.name = 'ErrorIntegridadCategoria';
    }
}

export class CategoriaService {
    constructor(
        private readonly repository: CategoriaRepository = categoriaRepositorySingleton,
        private readonly prestadorRepository: PrestadorRepository = prestadorRepositorySingleton
    ) {}

    public listar(search?: string): ICategoria[] {
        let resultado = this.repository.findAll();

        if (search) {
            const termino = this.normalizarTexto(search);
            resultado = resultado.filter(
                (c) =>
                    this.normalizarTexto(c.nombre).includes(termino) ||
                    this.normalizarTexto(c.slug).includes(termino) ||
                    String(c.id) === termino
            );
        }

        resultado.sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );

        return resultado;
    }

    public obtenerPorId(id: number): ICategoria | undefined {
        return this.repository.findById(id);
    }

    public resolverPorReferencia(referencia: number | string): ICategoria | undefined {
        return this.repository.resolverPorReferencia(referencia);
    }

    public crear(datos: { nombre: string; slug?: string }): ICategoria {
        const nombreLimpio = datos.nombre.trim();
        const slugObjetivo =
            datos.slug && datos.slug.trim()
                ? generarSlugCategoria(datos.slug)
                : generarSlugCategoria(nombreLimpio);

        if (this.repository.findBySlug(slugObjetivo) || this.repository.findByNombre(nombreLimpio)) {
            throw new ErrorIntegridadCategoria(
                `Ya existe una categoría registrada con el nombre o slug '${nombreLimpio}'`,
                409
            );
        }

        return this.repository.create({
            nombre: nombreLimpio,
            slug: slugObjetivo,
        });
    }

    public actualizar(
        id: number,
        datos: Partial<Omit<ICategoria, 'id'>>
    ): ICategoria | null {
        const actual = this.repository.findById(id);
        if (!actual) return null;

        if (datos.nombre !== undefined) {
            const duplicadaNombre = this.repository.findByNombre(datos.nombre);
            if (duplicadaNombre && duplicadaNombre.id !== id) {
                throw new ErrorIntegridadCategoria(
                    `Ya existe otra categoría con el nombre '${datos.nombre.trim()}'`,
                    409
                );
            }
        }

        if (datos.slug !== undefined && datos.slug.trim()) {
            const duplicadaSlug = this.repository.findBySlug(datos.slug);
            if (duplicadaSlug && duplicadaSlug.id !== id) {
                throw new ErrorIntegridadCategoria(
                    `Ya existe otra categoría con el slug '${generarSlugCategoria(datos.slug)}'`,
                    409
                );
            }
        }

        return this.repository.update(id, datos);
    }

    public eliminar(id: number): boolean {
        const actual = this.repository.findById(id);
        if (!actual) return false;

        // Integridad referencial ON DELETE RESTRICT
        if (this.prestadorRepository.existsByCategoriaId(id)) {
            throw new ErrorIntegridadCategoria(
                `No se puede eliminar la categoría '${actual.nombre}' porque tiene prestadores asociados`,
                409
            );
        }

        return this.repository.delete(id);
    }

    private normalizarTexto(texto: string): string {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }
}
