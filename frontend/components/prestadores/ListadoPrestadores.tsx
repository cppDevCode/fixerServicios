import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
    FormatoExportacion,
    ICategoria,
    IPrestador,
} from '../../interfaces/prestador.interface';
import {
    exportarCatalogoPrestadores,
    formatearTelefonoPrestador,
} from '../../services/exportarCatalogo.service';
import {
    CATEGORIAS_POR_DEFECTO,
    obtenerCategorias,
    obtenerPrestadores,
} from '../../services/prestador.service';
import './Prestadores.css';

export interface ListadoPrestadoresProps {
    versionCatalogo?: number;
    categoriasIniciales?: ICategoria[];
    prestadoresIniciales?: IPrestador[];
    onSeleccionarPrestador?: (id: number) => void;
}

export function ListadoPrestadores({
    versionCatalogo = 0,
    categoriasIniciales,
    prestadoresIniciales,
    onSeleccionarPrestador,
}: ListadoPrestadoresProps) {
    const navigate = useNavigate();

    const [prestadores, setPrestadores] = useState<IPrestador[]>(
        prestadoresIniciales ?? []
    );
    const [categorias, setCategorias] = useState<ICategoria[]>(
        categoriasIniciales ?? CATEGORIAS_POR_DEFECTO
    );
    const [search, setSearch] = useState('');
    const [rubro, setRubro] = useState('');
    const [sortBy, setSortBy] = useState<keyof IPrestador>('nombre');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [total, setTotal] = useState(prestadoresIniciales?.length ?? 0);
    const [totalPages, setTotalPages] = useState(1);
    const [cargando, setCargando] = useState(!prestadoresIniciales);
    const [error, setError] = useState<string | null>(null);
    const [reintento, setReintento] = useState(0);

    const [formatoExportacion, setFormatoExportacion] =
        useState<FormatoExportacion>('pdf');
    const [exportando, setExportando] = useState(false);
    const [mensajeExportacion, setMensajeExportacion] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (categoriasIniciales && categoriasIniciales.length > 0) {
            return;
        }

        let activo = true;
        obtenerCategorias()
            .then((res) => {
                if (activo && Array.isArray(res.datos) && res.datos.length > 0) {
                    setCategorias(res.datos);
                }
            })
            .catch(() => {
                // Mantiene CATEGORIAS_POR_DEFECTO como respaldo seguro
            });

        return () => {
            activo = false;
        };
    }, [categoriasIniciales]);

    useEffect(() => {
        if (prestadoresIniciales) {
            return;
        }

        let activo = true;

        async function cargarCatalogo() {
            setCargando(true);
            setError(null);

            try {
                const respuesta = await obtenerPrestadores({
                    page,
                    limit,
                    rubro: rubro || undefined,
                    search: search || undefined,
                    sortBy,
                    order,
                });

                if (!activo) return;

                setPrestadores(respuesta.datos);
                setTotal(respuesta.meta?.total ?? respuesta.datos.length);
                setTotalPages(respuesta.meta?.totalPages ?? 1);
            } catch (err) {
                if (!activo) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudo cargar el catálogo de prestadores.'
                );
                setPrestadores([]);
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        void cargarCatalogo();

        return () => {
            activo = false;
        };
    }, [
        page,
        limit,
        rubro,
        search,
        sortBy,
        order,
        versionCatalogo,
        reintento,
        prestadoresIniciales,
    ]);

    const irAlDetalle = (id: number) => {
        if (onSeleccionarPrestador) {
            onSeleccionarPrestador(id);
            return;
        }
        navigate(`/prestadores/${id}`);
    };

    const manejarExportacion = async () => {
        if (exportando) return;
        setExportando(true);
        setMensajeExportacion(null);

        try {
            const resultado = await exportarCatalogoPrestadores(
                prestadores,
                formatoExportacion
            );
            setMensajeExportacion(
                `Catálogo exportado (${resultado.nombreArchivo} - ${resultado.totalRegistros} registros).`
            );
        } finally {
            setExportando(false);
        }
    };

    const limpiarFiltros = () => {
        setSearch('');
        setRubro('');
        setSortBy('nombre');
        setOrder('asc');
        setLimit(10);
        setPage(1);
    };

    return (
        <section
            className="prestadores-contenedor"
            aria-label="Catálogo de prestadores"
        >
            <div className="prestadores-controles">
                <div className="prestadores-filtros-grid">
                    <div className="prestadores-campo">
                        <label htmlFor="busqueda-prestadores">
                            Buscar prestador
                        </label>
                        <input
                            id="busqueda-prestadores"
                            type="text"
                            placeholder="Buscar por nombre, apellido, especialidad o rubro..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="prestadores-campo">
                        <label htmlFor="filtro-rubro">Filtrar por rubro</label>
                        <select
                            id="filtro-rubro"
                            value={rubro}
                            onChange={(e) => {
                                setRubro(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Todos los rubros</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="prestadores-campo">
                        <label htmlFor="ordenar-por">Ordenar por</label>
                        <select
                            id="ordenar-por"
                            value={String(sortBy)}
                            onChange={(e) => {
                                setSortBy(e.target.value as keyof IPrestador);
                                setPage(1);
                            }}
                        >
                            <option value="nombre">Nombre</option>
                            <option value="apellido">Apellido</option>
                            <option value="aniosExperiencia">
                                Años de experiencia
                            </option>
                            <option value="ratingPromedio">Calificación</option>
                        </select>
                    </div>

                    <div className="prestadores-campo">
                        <label htmlFor="orden-direccion">Dirección</label>
                        <select
                            id="orden-direccion"
                            value={order}
                            onChange={(e) => {
                                setOrder(
                                    e.target.value === 'desc' ? 'desc' : 'asc'
                                );
                                setPage(1);
                            }}
                        >
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                    </div>

                    <div className="prestadores-campo">
                        <label htmlFor="filas-por-pagina">
                            Filas por página
                        </label>
                        <select
                            id="filas-por-pagina"
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={5}>5 filas</option>
                            <option value={10}>10 filas</option>
                            <option value={15}>15 filas</option>
                            <option value={20}>20 filas</option>
                        </select>
                    </div>
                </div>

                <div className="prestadores-barra-inferior">
                    <div>
                        {(search || rubro || sortBy !== 'nombre' || order !== 'asc') && (
                            <button
                                type="button"
                                className="btn-prestador btn-prestador--secundario"
                                onClick={limpiarFiltros}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    <div className="prestadores-exportacion">
                        <label htmlFor="formato-exportacion">Formato:</label>
                        <select
                            id="formato-exportacion"
                            aria-label="Formato de exportación"
                            value={formatoExportacion}
                            onChange={(e) =>
                                setFormatoExportacion(
                                    e.target.value === 'xlsx' ? 'xlsx' : 'pdf'
                                )
                            }
                        >
                            <option value="pdf">PDF (.pdf)</option>
                            <option value="xlsx">Excel (.xlsx)</option>
                        </select>

                        <button
                            type="button"
                            className="btn-prestador btn-prestador--primario"
                            onClick={() => {
                                void manejarExportacion();
                            }}
                            disabled={
                                cargando ||
                                exportando ||
                                prestadores.length === 0
                            }
                        >
                            {exportando
                                ? 'Exportando...'
                                : 'Exportar Catálogo'}
                        </button>
                    </div>
                </div>

                {mensajeExportacion && (
                    <p
                        className="prestadores-alerta prestadores-alerta--exito"
                        role="status"
                    >
                        {mensajeExportacion}
                    </p>
                )}
            </div>

            {cargando ? (
                <div className="prestadores-estado" role="status">
                    Cargando prestadores...
                </div>
            ) : error ? (
                <div className="prestadores-estado prestadores-estado--error">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        className="btn-prestador btn-prestador--primario"
                        onClick={() => setReintento((n) => n + 1)}
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <div className="prestadores-tabla-contenedor">
                    <table className="prestadores-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Profesional</th>
                                <th>Rubro</th>
                                <th>Matrícula</th>
                                <th>Experiencia</th>
                                <th>Garantía</th>
                                <th>Contacto</th>
                                <th>Rating</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestadores.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        style={{
                                            textAlign: 'center',
                                            padding: '2rem',
                                        }}
                                    >
                                        No se encontraron prestadores para los
                                        criterios seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                prestadores.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => irAlDetalle(p.id)}
                                    >
                                        <td>#{p.id}</td>
                                        <td>
                                            <span className="prestador-nombre-celda">
                                                {p.nombre} {p.apellido}
                                            </span>
                                            <span className="prestador-subtexto">
                                                {p.acercaDe}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge-prestador badge-prestador--rubro">
                                                {p.categoriaId}
                                            </span>
                                        </td>
                                        <td>
                                            {p.matricula ?? 'Sin matrícula'}
                                        </td>
                                        <td>{p.aniosExperiencia} años</td>
                                        <td>
                                            <span
                                                className={`badge-prestador ${
                                                    p.ofreceGarantia
                                                        ? 'badge-prestador--garantia-si'
                                                        : 'badge-prestador--garantia-no'
                                                }`}
                                            >
                                                {p.ofreceGarantia ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            {formatearTelefonoPrestador(
                                                p.telefono
                                            )}
                                        </td>
                                        <td>
                                            <span className="rating-chip">
                                                <span className="rating-chip__estrella">
                                                    ★
                                                </span>
                                                {p.ratingPromedio !== undefined
                                                    ? p.ratingPromedio.toFixed(1)
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-prestador btn-prestador--secundario"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    irAlDetalle(p.id);
                                                }}
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="prestadores-paginacion">
                <span>Total: {total} registros</span>

                <div className="prestadores-paginacion__controles">
                    <button
                        type="button"
                        className="btn-prestador btn-prestador--secundario"
                        disabled={page <= 1 || cargando}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {page} de {totalPages}
                    </span>

                    <button
                        type="button"
                        className="btn-prestador btn-prestador--secundario"
                        disabled={page >= totalPages || cargando}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </section>
    );
}
