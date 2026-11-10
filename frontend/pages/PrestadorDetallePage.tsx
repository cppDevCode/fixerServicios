import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormularioPrestador } from '../components/prestadores/FormularioPrestador';
import '../components/prestadores/Prestadores.css';
import type { ICategoria, IPrestador } from '../interfaces/prestador.interface';
import { formatearTelefonoPrestador } from '../services/exportarCatalogo.service';
import {
    CATEGORIAS_POR_DEFECTO,
    eliminarPrestador,
    obtenerCategorias,
    obtenerPrestadorPorId,
} from '../services/prestador.service';

export function PrestadorDetallePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [prestador, setPrestador] = useState<IPrestador | null>(null);
    const [categorias, setCategorias] = useState<ICategoria[]>(
        CATEGORIAS_POR_DEFECTO
    );
    const [cargando, setCargando] = useState(true);
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let activo = true;

        obtenerCategorias()
            .then((res) => {
                if (activo && Array.isArray(res.datos) && res.datos.length > 0) {
                    setCategorias(res.datos);
                }
            })
            .catch(() => {
                // Usa CATEGORIAS_POR_DEFECTO como respaldo
            });

        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        const idNumerico = Number(id);
        if (!id || Number.isNaN(idNumerico) || idNumerico <= 0) {
            setError('Identificador de prestador inválido.');
            setCargando(false);
            return;
        }

        let activo = true;
        setCargando(true);
        setError(null);

        obtenerPrestadorPorId(idNumerico)
            .then((respuesta) => {
                if (!activo) return;
                setPrestador(respuesta.datos);
            })
            .catch((err) => {
                if (!activo) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudo cargar el detalle del prestador.'
                );
            })
            .finally(() => {
                if (activo) {
                    setCargando(false);
                }
            });

        return () => {
            activo = false;
        };
    }, [id]);

    const manejarEliminar = async () => {
        if (!prestador) return;
        setEliminando(true);
        setError(null);

        try {
            await eliminarPrestador(prestador.id);
            navigate('/prestadores');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'No se pudo eliminar el prestador.'
            );
            setEliminando(false);
        }
    };

    return (
        <div className="prestadores-pagina">
            <header className="prestadores-encabezado">
                <div>
                    <h1>Detalle del prestador</h1>
                    <p>
                        Ficha técnica completa, datos de contacto, matrícula y
                        edición de perfil profesional.
                    </p>
                </div>

                <div className="prestadores-encabezado__acciones">
                    <Link
                        to="/prestadores"
                        className="btn-prestador btn-prestador--secundario"
                    >
                        ← Volver al catálogo
                    </Link>

                    {prestador && (
                        <button
                            type="button"
                            className="btn-prestador btn-prestador--peligro"
                            onClick={manejarEliminar}
                            disabled={eliminando}
                        >
                            {eliminando
                                ? 'Eliminando...'
                                : 'Eliminar prestador'}
                        </button>
                    )}
                </div>
            </header>

            {cargando ? (
                <div className="prestadores-estado" role="status">
                    Cargando ficha del prestador...
                </div>
            ) : error || !prestador ? (
                <div className="prestadores-estado prestadores-estado--error">
                    <p role="alert">
                        {error ?? 'No se encontró el prestador solicitado.'}
                    </p>
                    <Link
                        to="/prestadores"
                        className="btn-prestador btn-prestador--primario"
                    >
                        Regresar al listado
                    </Link>
                </div>
            ) : (
                <div className="prestador-detalle-grid">
                    <article
                        className="prestador-ficha"
                        aria-label="Ficha técnica del prestador"
                    >
                        <div className="prestador-ficha__cabecera">
                            <div>
                                <h2>
                                    {prestador.nombre} {prestador.apellido}
                                </h2>
                                <span className="prestador-subtexto">
                                    ID Profesional #{prestador.id}
                                </span>
                            </div>

                            <span className="badge-prestador badge-prestador--rubro">
                                {prestador.categoriaId}
                            </span>
                        </div>

                        <div className="prestador-ficha__atributos">
                            <div className="prestador-atributo">
                                <span>Matrícula</span>
                                <strong>
                                    {prestador.matricula ?? 'Sin matrícula'}
                                </strong>
                            </div>

                            <div className="prestador-atributo">
                                <span>Experiencia</span>
                                <strong>
                                    {prestador.aniosExperiencia} años
                                </strong>
                            </div>

                            <div className="prestador-atributo">
                                <span>Teléfono de contacto</span>
                                <strong>
                                    {formatearTelefonoPrestador(
                                        prestador.telefono
                                    )}
                                </strong>
                            </div>

                            <div className="prestador-atributo">
                                <span>Garantía de trabajo</span>
                                <strong>
                                    {prestador.ofreceGarantia
                                        ? 'Sí, ofrece garantía'
                                        : 'No ofrece garantía'}
                                </strong>
                            </div>

                            <div className="prestador-atributo">
                                <span>Calificación promedio</span>
                                <strong>
                                    ★{' '}
                                    {prestador.ratingPromedio !== undefined
                                        ? prestador.ratingPromedio.toFixed(1)
                                        : 'Sin calificaciones'}
                                </strong>
                            </div>

                            <div className="prestador-atributo">
                                <span>Rubro principal</span>
                                <strong>{prestador.categoriaId}</strong>
                            </div>
                        </div>

                        <div className="prestador-atributo">
                            <span>Acerca del profesional</span>
                            <p style={{ margin: '6px 0 0', lineHeight: 1.5 }}>
                                {prestador.acercaDe ||
                                    'Sin descripción registrada.'}
                            </p>
                        </div>
                    </article>

                    <FormularioPrestador
                        key={`${prestador.id}-${prestador.nombre}-${prestador.aniosExperiencia}`}
                        categorias={categorias}
                        prestadorInicial={prestador}
                        titulo="Editar datos del prestador"
                        textoBoton="Guardar cambios"
                        onGuardado={(actualizado) => setPrestador(actualizado)}
                    />
                </div>
            )}
        </div>
    );
}
