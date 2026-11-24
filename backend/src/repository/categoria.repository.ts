import { ICategoria } from '../interfaces/categoria.interface';

export const generarSlugCategoria = (texto: string): string =>
    texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const MOCK_CATEGORIAS: ICategoria[] = [
    { id: 1, slug: 'plomeria', nombre: 'Plomería' },
    { id: 2, slug: 'electricidad', nombre: 'Electricidad' },
    { id: 3, slug: 'gasista', nombre: 'Gasista' },
    { id: 4, slug: 'pintura', nombre: 'Pintura' },
    { id: 5, slug: 'carpinteria', nombre: 'Carpintería' },
    { id: 6, slug: 'albanileria', nombre: 'Albañilería' },
    { id: 7, slug: 'jardineria', nombre: 'Jardinería' },
    { id: 8, slug: 'cerrajeria', nombre: 'Cerrajería' },
    { id: 9, slug: 'refrigeracion', nombre: 'Refrigeración' },
];

export class CategoriaRepository {
    private categorias: ICategoria[] = MOCK_CATEGORIAS.map((c) => ({ ...c }));

    findAll(): ICategoria[] {
        return this.categorias.map((c) => ({ ...c }));
    }

    findById(id: number): ICategoria | undefined {
        const encontrada = this.categorias.find((c) => c.id === id);
        return encontrada ? { ...encontrada } : undefined;
    }

    findBySlug(slug: string): ICategoria | undefined {
        const slugNormalizado = generarSlugCategoria(slug);
        const encontrada = this.categorias.find((c) => c.slug === slugNormalizado);
        return encontrada ? { ...encontrada } : undefined;
    }

    findByNombre(nombre: string): ICategoria | undefined {
        const objetivo = generarSlugCategoria(nombre);
        const encontrada = this.categorias.find(
            (c) => generarSlugCategoria(c.nombre) === objetivo
        );
        return encontrada ? { ...encontrada } : undefined;
    }

    resolverPorReferencia(referencia: number | string): ICategoria | undefined {
        if (typeof referencia === 'number' && Number.isInteger(referencia) && referencia > 0) {
            return this.findById(referencia);
        }

        const texto = String(referencia).trim();
        if (!texto) return undefined;

        const comoNumero = Number(texto);
        if (Number.isInteger(comoNumero) && comoNumero > 0 && String(comoNumero) === texto) {
            const porId = this.findById(comoNumero);
            if (porId) return porId;
        }

        return this.findBySlug(texto) ?? this.findByNombre(texto);
    }

    create(datos: { nombre: string; slug?: string }): ICategoria {
        const nombreLimpio = datos.nombre.trim();
        const slugLimpio =
            datos.slug && datos.slug.trim()
                ? generarSlugCategoria(datos.slug)
                : generarSlugCategoria(nombreLimpio);

        const nuevaCategoria: ICategoria = {
            id: this.siguienteId(),
            slug: slugLimpio,
            nombre: nombreLimpio,
        };

        this.categorias.push(nuevaCategoria);
        return { ...nuevaCategoria };
    }

    update(
        id: number,
        datos: Partial<Omit<ICategoria, 'id'>>
    ): ICategoria | null {
        const index = this.categorias.findIndex((c) => c.id === id);
        if (index === -1) return null;

        const actual = this.categorias[index];
        const nombreActualizado =
            datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;
        const slugActualizado =
            datos.slug !== undefined && datos.slug.trim()
                ? generarSlugCategoria(datos.slug)
                : actual.slug;

        this.categorias[index] = {
            id,
            slug: slugActualizado,
            nombre: nombreActualizado,
        };

        return { ...this.categorias[index] };
    }

    delete(id: number): boolean {
        const index = this.categorias.findIndex((c) => c.id === id);
        if (index === -1) return false;

        this.categorias.splice(index, 1);
        return true;
    }

    private siguienteId(): number {
        return this.categorias.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    }
}

export const categoriaRepositorySingleton = new CategoriaRepository();
