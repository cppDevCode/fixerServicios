import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AvatarPrestador } from '../components/prestadores/AvatarPrestador';
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
import {
    esAdmin,
    esPrestador,
    EVENTO_CAMBIO_SESION,
    obtenerUsuarioActual,
    puedeAgregarResena,
    puedeEditarPrestador,
    puedeEliminarPrestador,
    type IUsuarioSesion,
} from '../services/sesion.service';
import { ListadoResenas } from '../components/resenas/ListadoResenas';
import { FormularioResena } from '../components/resenas/FormularioResena';
import type { IResena } from '../interfaces/resena.interface';

export function PrestadorDetallePage() {
    const [usuarioActual, setUsuarioActual] = useState<IUsuarioSesion | null>(
        () => obtenerUsuarioActual()
    );

    useEffect(() => {
        const actualizarSesion = () => {
            setUsuarioActual(obtenerUsuarioActual());
        };
        window.addEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
        return () =>
            window.removeEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
    }, []);

    const idNumericoUsuario = usuarioActual ? Number(usuarioActual.id) : NaN;
    const usuarioId =
        Number.isInteger(idNumericoUsuario) && idNumericoUsuario > 0
            ? idNumericoUsuario
            : null;
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [prestador, setPrestador] = useState<IPrestador | null>(null);
    const [categorias, setCategorias] = useState<ICategoria[]>(
        CATEGORIAS_POR_DEFECTO
    );
    const [cargando, setCargando] = useState(true);
    const [eliminando, setEliminando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [versionResenas, setVersionResenas] = useState(0);
    const [resenaEditar, setResenaEditar] = useState<IResena | null>(null);

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
    
    const actualizarResenas = () => {
        setVersionResenas((version) => version + 1);
        setResenaEditar(null);
    };

    const puedeEditar = prestador
        ? puedeEditarPrestador(usuarioActual, prestador.id)
        : false;
    const puedeEliminar = puedeEliminarPrestador(usuarioActual);
    const puedeDejarResena = prestador
        ? puedeAgregarResena(usuarioActual, prestador.id) && usuarioId !== null
        : false;
    const rutaVolver = esAdmin(usuarioActual)
        ? '/prestadores'
        : '/prestadores/catalogo';

    return (
        <div className="prestadores-pagina">
            <header className="prestadores-encabezado">
                <div>
                    <h1>Detalle del prestador</h1>
                    <p>
                        {puedeEditar
                            ? 'Ficha técnica completa, datos de contacto, matrícula y edición de perfil profesional.'
                            : 'Ficha técnica del profesional, datos de contacto y reseñas de clientes.'}
                    </p>
                </div>

                <div className="prestadores-encabezado__acciones">
                    {esPrestador(usuarioActual) && (
                        <Link
                            to="/prestadores/catalogo"
                            data-testid="btn-navegar-como-usuario"
                            className="btn-prestador btn-prestador--secundario"
                        >
                            Explorar Catálogo como Usuario
                        </Link>
                    )}

                    <Link
                        to={rutaVolver}
                        className="btn-prestador btn-prestador--secundario"
                    >
                        ← Volver al catálogo
                    </Link>

                    {prestador && puedeEliminar && (
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
                        to={rutaVolver}
                        className="btn-prestador btn-prestador--primario"
                    >
                        Regresar al listado
                    </Link>
                </div>
            ) : (
                <>
                    <div
                        className={
                            puedeEditar
                                ? 'prestador-detalle-grid'
                                : 'prestador-detalle-grid prestador-detalle-grid--solo-lectura'
                        }
                    >
                        <article
                            className="prestador-ficha"
                            aria-label="Ficha técnica del prestador"
                        >
                            <div className="prestador-ficha__cabecera">
                                <div className="prestador-ficha__identidad">
                                    <AvatarPrestador
                                        nombre={prestador.nombre}
                                        apellido={prestador.apellido}
                                        fotoUrl={prestador.fotoUrl}
                                        tamano="lg"
                                    />
                                    <div>
                                        <h2>
                                            {prestador.nombre} {prestador.apellido}
                                        </h2>
                                        <span className="prestador-subtexto">
                                            ID Profesional #{prestador.id}
                                        </span>
                                    </div>
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

                                <div className="prestador-atributo">
                                    <span>Ubicación (Localidad / Provincia)</span>
                                    <strong>
                                        {prestador.localidad ?? 'Sin localidad'}
                                        {prestador.provincia
                                            ? `, ${prestador.provincia}`
                                            : ''}
                                    </strong>
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

                        {puedeEditar ? (
                            <FormularioPrestador
                                key={`${prestador.id}-${prestador.nombre}-${prestador.aniosExperiencia}-${prestador.fotoUrl ?? 'sin-foto'}`}
                                categorias={categorias}
                                prestadorInicial={prestador}
                                titulo="Editar datos del prestador"
                                textoBoton="Guardar cambios"
                                onGuardado={(actualizado) =>
                                    setPrestador(actualizado)
                                }
                            />
                        ) : (
                            <aside
                                className="prestador-ficha"
                                data-testid="aviso-solo-lectura-prestador"
                                aria-label="Información de permisos de visualización"
                            >
                                <h3 style={{ marginTop: 0 }}>
                                    Vista de consulta para usuarios
                                </h3>
                                <p style={{ lineHeight: 1.6 }}>
                                    Estás visualizando la ficha profesional de{' '}
                                    <strong>
                                        {prestador.nombre} {prestador.apellido}
                                    </strong>{' '}
                                    en modo de solo lectura. Los datos del
                                    prestador solo pueden ser editados por el
                                    propio profesional o por un administrador.
                                </p>
                                <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
                                    {puedeDejarResena
                                        ? 'Como usuario registrado, podés calificar y agregar una reseña sobre este profesional en la sección inferior.'
                                        : 'Iniciá sesión con tu cuenta de usuario para registrar una reseña sobre este profesional.'}
                                </p>
                            </aside>
                        )}
                    </div>

                    <section aria-label="Reseñas y calificaciones del profesional">
                        {puedeDejarResena && usuarioId !== null && (
                            <FormularioResena
                                key={`formulario-${prestador.id}-${resenaEditar?.id ?? 'nuevo'}`}
                                prestadorId={prestador.id}
                                usuarioId={usuarioId}
                                resenaEditar={resenaEditar}
                                onResenaGuardada={actualizarResenas}
                                onCancelarEdicion={() => setResenaEditar(null)}
                            />
                        )}

                        <ListadoResenas
                            key={`${prestador.id}-${versionResenas}`}
                            prestadorId={prestador.id}
                            usuarioId={usuarioId ?? undefined}
                            onEditarResena={setResenaEditar}
                        />
                    </section>
                </>
            )}
        </div>
    );
}
