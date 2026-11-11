import { ICategoria } from "../interfaces/categoria.interface";
import { CategoriaRepository } from "../repository/categoria.repository";

export class CategoriaService {
    constructor(private readonly repository = new CategoriaRepository()) {}

    public listar(search?: string): ICategoria[] {
        let resultado = this.repository.findAll();

        if (search) {
            const termino = this.normalizarTexto(search);
            resultado = resultado.filter(
                (c) =>
                    this.normalizarTexto(c.nombre).includes(termino) ||
                    this.normalizarTexto(c.id).includes(termino)
            );
        }

        resultado.sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );

        return resultado;
    }

    public obtenerPorId(id: string): ICategoria | undefined {
        return this.repository.findById(id);
    }

    public crear(datos: { id?: string; nombre: string }): ICategoria {
        return this.repository.create(datos);
    }

    public actualizar(id: string, datos: Partial<Omit<ICategoria, 'id'>>): ICategoria | null {
        return this.repository.update(id, datos);
    }

    public eliminar(id: string): boolean {
        return this.repository.delete(id);
    }

    private normalizarTexto(texto: string): string {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }
}
