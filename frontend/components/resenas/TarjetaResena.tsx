import type { IResena } from '../../interfaces/resena.interface';
import { Estrellas } from './Estrellas';
import { Pencil } from 'lucide-react';

interface TarjetaResenaProps {
    resena: IResena;
    onEditar?: (resena: IResena) => void;
}

export function TarjetaResena({ resena, onEditar }: TarjetaResenaProps) {
    const fecha = new Date(resena.createdAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

    return (
        <article className="tarjeta-resena">
            <div className="tarjeta-resena__encabezado">
                <span>Usuario #{resena.usuarioId}</span>

                <div className="tarjeta-resena__acciones">
                    <time dateTime={resena.createdAt}>{fecha}</time>

                    {onEditar && (
                        <button
                            type="button"
                            className="tarjeta-resena__editar"
                            onClick={() => onEditar(resena)}
                            aria-label="Editar reseña"
                            title="Editar reseña"
                        >
                            <Pencil size={17} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            <Estrellas calificacion={resena.calificacion} />

            <p>{resena.comentario}</p>
        </article>
    );
}