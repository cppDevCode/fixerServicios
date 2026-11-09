import { IResena } from '../interfaces/resena.interface';
import { resenasMock } from './resena.mock';

export class ResenaRepository {
    private resenas: IResena[] = [...resenasMock];

    findAll(): IResena[] {
        return [...this.resenas];
    }

    findById(id: number): IResena | undefined {
        return this.resenas.find((r) => r.id === id);
    }

    create(data: Omit<IResena, 'id' | 'createdAt'>): IResena {
        const nueva: IResena = {
        ...data,
        id: this.siguienteId(),
        createdAt: new Date().toISOString(),
        };
        this.resenas.push(nueva);
        return nueva;
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

    private siguienteId(): number {
        return this.resenas.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    }
}