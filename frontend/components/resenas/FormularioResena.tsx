import { useState, type FormEvent } from 'react';
import { crearResena } from '../../services/resena.service';

interface FormularioResenaProps {
    prestadorId: number;
    usuarioId: number;
    onResenaCreada?: () => void;
}

export function FormularioResena({
    prestadorId,
    usuarioId,
    onResenaCreada,
}: FormularioResenaProps) {
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);

    const enviarResena = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setError('');
        setExito(false);

        if (calificacion < 1 || calificacion > 5) {
            setError('Seleccioná una calificación de 1 a 5 estrellas.');
            return;
        }

        if (!comentario.trim()) {
            setError('El comentario es obligatorio.');
            return;
        }

        setEnviando(true);

        try {
            await crearResena({
                prestadorId,
                usuarioId,
                calificacion,
                comentario: comentario.trim(),
            });

            setCalificacion(0);
            setComentario('');
            setExito(true);
            onResenaCreada?.();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo publicar la reseña.'
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form
            className="formulario-resena"
            onSubmit={enviarResena}
            noValidate
        >
            <h3>Dejá tu reseña</h3>

            <fieldset className="formulario-resena__calificacion">
                <legend>Tu calificación</legend>

                <div className="formulario-resena__estrellas">
                    {[1, 2, 3, 4, 5].map((valor) => (
                        <button
                            key={valor}
                            type="button"
                            className={
                                valor <= calificacion
                                    ? 'formulario-resena__estrella formulario-resena__estrella--activa'
                                    : 'formulario-resena__estrella'
                            }
                            onClick={() => setCalificacion(valor)}
                            disabled={enviando}
                            aria-label={`${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`}
                            aria-pressed={calificacion === valor}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </fieldset>

            <label htmlFor="comentario-resena">
                Tu comentario
            </label>

            <textarea
                id="comentario-resena"
                value={comentario}
                onChange={(evento) => setComentario(evento.target.value)}
                placeholder="Contanos cómo fue tu experiencia..."
                rows={4}
                disabled={enviando}
                required
            />

            {error && (
                <p className="formulario-resena__error" role="alert">
                    {error}
                </p>
            )}

            {exito && (
                <p className="formulario-resena__exito" role="status">
                    ¡Tu reseña se publicó correctamente!
                </p>
            )}

            <button
                className="formulario-resena__enviar"
                type="submit"
                disabled={enviando}
            >
                {enviando ? 'Publicando...' : 'Publicar reseña'}
            </button>
        </form>
    );
}