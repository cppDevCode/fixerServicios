import { IResena } from '../interfaces/resena.interface';
import { resenasMock } from './resena.mock';

export class ResenaRepository {
    private resenas: IResena[] = resenasMock.map((r) => ({ ...r }));

    findAll(): IResena[] {
        return this.resenas.map((r) => ({ ...r }));
    }

    findById(id: number): IResena | undefined {
        const encontrada = this.resenas.find((r) => r.id === id);
        return encontrada ? { ...encontrada } : undefined;
    }

    findByPrestadorId(prestadorId: number): IResena[] {
        return this.findAll().filter((r) => r.prestadorId === prestadorId);
    }

    create(data: Omit<IResena, 'id' | 'createdAt'>): IResena {
        const nueva: IResena = {
            ...data,
            id: this.siguienteId(),
            createdAt: new Date().toISOString(),
        };
        this.resenas.push(nueva);
        return { ...nueva };
    }

    update(
        id: number,
        datos: Pick<IResena, 'calificacion' | 'comentario'>
    ): IResena | undefined {
        const resena = this.resenas.find((r) => r.id === id);

        if (!resena) {
            return undefined;
        }

        resena.calificacion = datos.calificacion;
        resena.comentario = datos.comentario;

        return { ...resena };
    }

    delete(id: number): boolean {
        const index = this.resenas.findIndex((r) => r.id === id);
        if (index === -1) return false;
        this.resenas.splice(index, 1);
        return true;
    }

    deleteByPrestadorId(prestadorId: number): number {
        const antes = this.resenas.length;
        this.resenas = this.resenas.filter((r) => r.prestadorId !== prestadorId);
        return antes - this.resenas.length;
    }

    private siguienteId(): number {
        return this.resenas.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    }
}

export const resenaRepositorySingleton = new ResenaRepository();
