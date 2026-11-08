
import type { IResena } from '../../interfaces/resena.interface';
import { Estrellas } from './Estrellas';

interface TarjetaResenaProps {
    resena: IResena;
}

export function TarjetaResena({ resena }: TarjetaResenaProps) {
    const fecha = new Date(resena.createdAt).toLocaleDateString(
        'es-AR',
        {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
        }
    );

    return (
        <article className="tarjeta-resena">
        <div className="tarjeta-resena__encabezado">
            <span>Usuario #{resena.usuarioId}</span>
            <time dateTime={resena.createdAt}>{fecha}</time>
        </div>

        <Estrellas calificacion={resena.calificacion} />

        <p>{resena.comentario}</p>
        </article>
    );
}
