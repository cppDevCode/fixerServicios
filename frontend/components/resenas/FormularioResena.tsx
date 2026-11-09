import { useEffect, useState, type FormEvent } from 'react';
import { crearResena, actualizarResena } from '../../services/resena.service';
import type { IResena } from '../../interfaces/resena.interface';

interface FormularioResenaProps {
    prestadorId: number;
    usuarioId: number;
    resenaEditar?: IResena | null;
    onResenaGuardada?: () => void;
    onCancelarEdicion?: () => void;
}

export function FormularioResena({
    prestadorId,
    usuarioId,
    resenaEditar = null,
    onResenaGuardada,
    onCancelarEdicion,
}: FormularioResenaProps) {
    const [calificacion, setCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);

    const modoEdicion = resenaEditar !== null;

    useEffect(() => {
        setCalificacion(resenaEditar?.calificacion ?? 0);
        setComentario(resenaEditar?.comentario ?? '');
        setError('');
        setExito(false);
    }, [resenaEditar]);

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
            if (resenaEditar) {
                await actualizarResena(resenaEditar.id, {
                    calificacion,
                    comentario: comentario.trim(),
                });
            } else {
                await crearResena({
                    prestadorId,
                    usuarioId,
                    calificacion,
                    comentario: comentario.trim(),
                });
            }

            if (!modoEdicion) {
                setCalificacion(0);
                setComentario('');
                setExito(true);
            }

            onResenaGuardada?.();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : modoEdicion
                        ? 'No se pudo actualizar la reseña.'
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
            <h3>
                {modoEdicion ? 'Editar reseña' : 'Dejá tu reseña'}
            </h3>

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

            <div className="formulario-resena__acciones">
                <button
                    className="formulario-resena__enviar"
                    type="submit"
                    disabled={enviando}
                >
                    {enviando
                        ? modoEdicion
                            ? 'Guardando...'
                            : 'Publicando...'
                        : modoEdicion
                            ? 'Guardar cambios'
                            : 'Publicar reseña'}
                </button>

                {modoEdicion && (
                    <button
                        type="button"
                        className="formulario-resena__cancelar"
                        onClick={onCancelarEdicion}
                        disabled={enviando}
                    >
                        Cancelar edición
                    </button>
                )}
            </div>
        </form>
    );
}