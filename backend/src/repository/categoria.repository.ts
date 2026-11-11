import { ICategoria } from "../interfaces/categoria.interface";

const MOCK_CATEGORIAS: ICategoria[] = [
    { id: 'Plomería', nombre: 'Plomería' },
    { id: 'Electricidad', nombre: 'Electricidad' },
    { id: 'Gasista', nombre: 'Gasista' },
    { id: 'Pintura', nombre: 'Pintura' },
    { id: 'Carpintería', nombre: 'Carpintería' },
    { id: 'Albañilería', nombre: 'Albañilería' },
    { id: 'Jardinería', nombre: 'Jardinería' },
    { id: 'Cerrajería', nombre: 'Cerrajería' },
    { id: 'Refrigeración', nombre: 'Refrigeración' }
];

export class CategoriaRepository {
    private categorias: ICategoria[] = [...MOCK_CATEGORIAS];

    findAll(): ICategoria[] {
        return [...this.categorias];
    }

    findById(id: string): ICategoria | undefined {
        return this.categorias.find((c) => c.id === id);
    }

    create(datos: { id?: string; nombre: string }): ICategoria {
        const nombreLimpio = datos.nombre.trim();
        const nuevoId = datos.id && datos.id.trim() ? datos.id.trim() : nombreLimpio;
        const nuevaCategoria: ICategoria = {
            id: nuevoId,
            nombre: nombreLimpio
        };

        this.categorias.push(nuevaCategoria);
        return nuevaCategoria;
    }

    update(id: string, datos: Partial<Omit<ICategoria, 'id'>>): ICategoria | null {
        const index: number = this.categorias.findIndex((c) => c.id === id);
        if (index === -1)
            return null;

        this.categorias[index] = {
            ...this.categorias[index],
            ...datos,
            ...(datos.nombre ? { nombre: datos.nombre.trim() } : {}),
            id
        };

        return this.categorias[index];
    }

    delete(id: string): boolean {
        const index: number = this.categorias.findIndex((c) => c.id === id);
        if (index === -1)
            return false;

        this.categorias.splice(index, 1);
        return true;
    }
}
