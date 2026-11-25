import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AvatarPrestador } from '../components/prestadores/AvatarPrestador';
import { FormularioCambioPassword } from '../components/prestadores/FormularioCambioPassword';
import { FormularioPrestador } from '../components/prestadores/FormularioPrestador';
import '../components/prestadores/Prestadores.css';
import type { ICategoria, IPrestador } from '../interfaces/prestador.interface';
import { formatearTelefonoPrestador } from '../services/exportarCatalogo.service';
import {
    CATEGORIAS_POR_DEFECTO,
    eliminarPrestador,
    obtenerCategorias,
    obtenerNombreCategoria,
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
} from '../services/sesion.service';
import { ListadoResenas } from '../components/resenas/ListadoResenas';
import { FormularioResena } from '../components/resenas/FormularioResena';
import type { IResena } from '../interfaces/resena.interface';
import { RadioMapa } from '../components/mapa/RadioMapa';

export function PrestadorDetallePage() {
    const [, setVersionSesion] = useState(0);
    const usuarioActual = obtenerUsuarioActual();

    useEffect(() => {
        const actualizarSesion = () => {
            setVersionSesion((v) => v + 1);
        };
        window.addEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
        window.addEventListener('storage', actualizarSesion);
        return () => {
            window.removeEventListener(EVENTO_CAMBIO_SESION, actualizarSesion);
            window.removeEventListener('storage', actualizarSesion);
        };
    }, []);

    const usuarioId =
        usuarioActual && Number.isInteger(usuarioActual.id) && usuarioActual.id > 0
            ? usuarioActual.id
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
    const [bloqueadoHasta, setBloqueadoHasta] = useState<string | null>(null);

    const esPropietarioPrestador = esPrestador(usuarioActual);

    useEffect(() => {
        if (!esPropietarioPrestador || usuarioId === null) {
            setBloqueadoHasta(null);
            return;
        }

        let activo = true;
        fetch(`/api/v1/usuarios/${usuarioId}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((body: { data?: { bloqueadoHasta?: string } } | null) => {
                if (!activo) return;
                const hasta = body?.data?.bloqueadoHasta;
                if (hasta && new Date(hasta).getTime() > Date.now()) {
                    setBloqueadoHasta(hasta);
                } else {
                    setBloqueadoHasta(null);
                }
            })
            .catch(() => {
                // Mantiene el estado local de bloqueo si no se puede consultar el usuario
            });

        return () => {
            activo = false;
        };
    }, [esPropietarioPrestador, usuarioId]);

    useEffect(() => {
        if (!bloqueadoHasta) return;
        const restanteMs = new Date(bloqueadoHasta).getTime() - Date.now();
        if (restanteMs <= 0) {
            setBloqueadoHasta(null);
            return;
        }
        const timer = window.setTimeout(() => {
            setBloqueadoHasta(null);
        }, restanteMs);
        return () => window.clearTimeout(timer);
    }, [bloqueadoHasta]);

    const cuentaBloqueada = Boolean(
        esPropietarioPrestador &&
            bloqueadoHasta &&
            new Date(bloqueadoHasta).getTime() > Date.now()
    );

    const horaDesbloqueo = bloqueadoHasta
        ? new Date(bloqueadoHasta).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    const mensajeBloqueoFicha = horaDesbloqueo
        ? `Tu cuenta está bloqueada hasta las ${horaDesbloqueo} por 3 intentos fallidos de contraseña. No podés editar los datos de tu ficha profesional hasta entonces.`
        : 'Tu cuenta está bloqueada por 30 minutos debido a 3 intentos fallidos de contraseña. No podés editar los datos de tu ficha profesional hasta entonces.';

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
        if (prestador) {
            obtenerPrestadorPorId(prestador.id)
                .then((res) => setPrestador(res.datos))
                .catch(() => {
                    // Mantiene el estado actual si falla la recarga del promedio
                });
        }
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
                    <h1>
                        {esPrestador(usuarioActual) && puedeEditar
                            ? 'Mi Ficha Profesional'
                            : 'Detalle del prestador'}
                    </h1>
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
                                    {obtenerNombreCategoria(prestador, categorias)}
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
                                    <strong>{obtenerNombreCategoria(prestador, categorias)}</strong>
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

                            {/*Zona de atención y mapa */}
                            <div className="prestador-atributo" style={{ marginTop: '1rem' }}>
                                <span>Zona de atención (Radio de cobertura)</span>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', alignItems: 'flex-start' }}>
                                    
                                    {/* Columna izquierda: Datos */}
                                    <div style={{ flex: 1 }}>
                                        <div className="prestador-atributo">
                                            <span>Zona de atención</span>
                                            <strong>{prestador.localidad || 'Córdoba'}</strong>
                                        </div>
                                        <div className="prestador-atributo" style={{ marginTop: '1rem' }}>
                                            <span>Radio de cobertura</span>
                                            <strong>{prestador.radio || 10} km</strong>
                                        </div>
                                    </div>

                                    {/* Columna derecha: Mapa */}
                                    <div style={{ width: '300px', flexShrink: 0 }}>
                                        <RadioMapa
                                            codigoPostal={prestador.codigoPostal ?? '5000'}
                                            ciudad={prestador.localidad || 'Córdoba'}
                                            provincia={prestador.provincia || 'Córdoba'}
                                            radioKm={prestador.radio || 10}
                                            nombreZona={prestador.localidad || 'Zona de cobertura'}
                                        />
                                    </div>

                                </div>
                            </div>
                        </article>

                        {puedeEditar && (
                            <div className="prestador-detalle-columna-edicion">
                                <FormularioPrestador
                                    key={`${prestador.id}-${prestador.nombre}-${prestador.aniosExperiencia}-${prestador.fotoUrl ?? 'sin-foto'}`}
                                    categorias={categorias}
                                    prestadorInicial={prestador}
                                    titulo="Editar datos del prestador"
                                    textoBoton={
                                        cuentaBloqueada
                                            ? 'Edición bloqueada (30 min)'
                                            : 'Guardar cambios'
                                    }
                                    bloqueado={cuentaBloqueada}
                                    mensajeBloqueo={mensajeBloqueoFicha}
                                    onGuardado={(actualizado) =>
                                        setPrestador(actualizado)
                                    }
                                />

                                {esPropietarioPrestador &&
                                    usuarioId !== null && (
                                        <FormularioCambioPassword
                                            usuarioId={usuarioId}
                                            bloqueadoHastaInicial={
                                                bloqueadoHasta
                                            }
                                            onCuentaBloqueada={(hasta) =>
                                                setBloqueadoHasta(hasta)
                                            }
                                        />
                                    )}
                            </div>
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
                            usuarioId={
                                puedeDejarResena && usuarioId !== null
                                    ? usuarioId
                                    : undefined
                            }
                            onEditarResena={
                                puedeDejarResena ? setResenaEditar : undefined
                            }
                        />
                    </section>
                </>
            )}
        </div>
    );
}