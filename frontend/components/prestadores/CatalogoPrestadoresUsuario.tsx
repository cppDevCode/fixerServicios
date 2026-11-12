import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ICategoria, IPrestador } from '../../interfaces/prestador.interface';
import {
    CATEGORIAS_POR_DEFECTO,
    LOCALIDADES_POR_DEFECTO,
    obtenerCategorias,
    obtenerPrestadores,
} from '../../services/prestador.service';
import { TarjetaCatalogoPrestador } from './TarjetaCatalogoPrestador';
import './Prestadores.css';

const TARJETAS_POR_PAGINA = 6;

type CriterioOrdenCatalogo =
    | 'ratingPromedio:desc'
    | 'aniosExperiencia:desc'
    | 'nombre:asc'
    | 'nombre:desc';

export interface CatalogoPrestadoresUsuarioProps {
    versionCatalogo?: number;
    categoriasIniciales?: ICategoria[];
    prestadoresIniciales?: IPrestador[];
    onSeleccionarPrestador?: (id: number) => void;
}

export function CatalogoPrestadoresUsuario({
    versionCatalogo = 0,
    categoriasIniciales,
    prestadoresIniciales,
    onSeleccionarPrestador,
}: CatalogoPrestadoresUsuarioProps) {
    const navigate = useNavigate();

    const [prestadoresBase, setPrestadoresBase] = useState<IPrestador[]>(
        prestadoresIniciales ?? []
    );
    const [categorias, setCategorias] = useState<ICategoria[]>(
        categoriasIniciales ?? CATEGORIAS_POR_DEFECTO
    );

    const [busquedaInput, setBusquedaInput] = useState('');
    const [busquedaActiva, setBusquedaActiva] = useState('');
    const [rubroSeleccionado, setRubroSeleccionado] = useState('');
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');
    const [soloMatriculados, setSoloMatriculados] = useState(false);
    const [soloConGarantia, setSoloConGarantia] = useState(false);
    const [soloMejorCalificados, setSoloMejorCalificados] = useState(false);
    const [ordenSeleccionado, setOrdenSeleccionado] =
        useState<CriterioOrdenCatalogo>('ratingPromedio:desc');
    const [paginaActual, setPaginaActual] = useState(1);

    const [cargando, setCargando] = useState(!prestadoresIniciales);
    const [error, setError] = useState<string | null>(null);
    const [contadorActualizacion, setContadorActualizacion] = useState(0);

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
                // Mantiene CATEGORIAS_POR_DEFECTO como respaldo
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
        const [campoOrden, direccionOrden] = ordenSeleccionado.split(':') as [
            keyof IPrestador,
            'asc' | 'desc',
        ];

        async function cargarProfesionales() {
            setCargando(true);
            setError(null);

            try {
                const respuesta = await obtenerPrestadores({
                    page: 1,
                    limit: 50,
                    rubro: rubroSeleccionado || undefined,
                    localidad: localidadSeleccionada || undefined,
                    search: busquedaActiva || undefined,
                    sortBy: campoOrden,
                    order: direccionOrden,
                });

                if (!activo) return;
                setPrestadoresBase(respuesta.datos);
            } catch (err) {
                if (!activo) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudo cargar el catálogo de profesionales.'
                );
                setPrestadoresBase([]);
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        void cargarProfesionales();

        return () => {
            activo = false;
        };
    }, [
        rubroSeleccionado,
        localidadSeleccionada,
        busquedaActiva,
        ordenSeleccionado,
        versionCatalogo,
        contadorActualizacion,
        prestadoresIniciales,
    ]);

    const localidadesDisponibles = useMemo(() => {
        const conjunto = new Set<string>(LOCALIDADES_POR_DEFECTO);
        for (const p of prestadoresBase) {
            if (p.localidad && p.localidad.trim() !== '') {
                conjunto.add(p.localidad.trim());
            }
        }
        return Array.from(conjunto).sort((a, b) =>
            a.localeCompare(b, 'es', { sensitivity: 'base' })
        );
    }, [prestadoresBase]);

    const prestadoresFiltrados = useMemo(() => {
        const [campoOrden, direccionOrden] = ordenSeleccionado.split(':') as [
            keyof IPrestador,
            'asc' | 'desc',
        ];
        const factor = direccionOrden === 'desc' ? -1 : 1;
        const termino = busquedaActiva.trim().toLowerCase();

        return prestadoresBase
            .filter((p) => {
                if (rubroSeleccionado && p.categoriaId !== rubroSeleccionado) {
                    return false;
                }
                if (
                    localidadSeleccionada &&
                    (p.localidad ?? '').toLowerCase() !==
                        localidadSeleccionada.toLowerCase()
                ) {
                    return false;
                }
                if (termino) {
                    const texto =
                        `${p.nombre} ${p.apellido} ${p.categoriaId} ${p.localidad ?? ''} ${p.acercaDe}`.toLowerCase();
                    if (!texto.includes(termino)) {
                        return false;
                    }
                }
                if (soloMatriculados && !p.matricula) {
                    return false;
                }
                if (soloConGarantia && !p.ofreceGarantia) {
                    return false;
                }
                if (soloMejorCalificados && (p.ratingPromedio ?? 0) < 4.8) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (campoOrden === 'ratingPromedio') {
                    return (
                        ((a.ratingPromedio ?? 0) - (b.ratingPromedio ?? 0)) *
                        factor
                    );
                }
                if (campoOrden === 'aniosExperiencia') {
                    return (a.aniosExperiencia - b.aniosExperiencia) * factor;
                }
                return (
                    a.nombre.localeCompare(b.nombre, 'es', {
                        sensitivity: 'base',
                    }) * factor
                );
            });
    }, [
        prestadoresBase,
        rubroSeleccionado,
        localidadSeleccionada,
        busquedaActiva,
        soloMatriculados,
        soloConGarantia,
        soloMejorCalificados,
        ordenSeleccionado,
    ]);

    const totalProfesionales = prestadoresFiltrados.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(totalProfesionales / TARJETAS_POR_PAGINA)
    );
    const paginaSegura = Math.min(paginaActual, totalPaginas);

    const prestadoresPagina = useMemo(() => {
        const inicio = (paginaSegura - 1) * TARJETAS_POR_PAGINA;
        return prestadoresFiltrados.slice(inicio, inicio + TARJETAS_POR_PAGINA);
    }, [prestadoresFiltrados, paginaSegura]);

    const etiquetaCriterio =
        rubroSeleccionado ||
        (busquedaActiva.trim()
            ? busquedaActiva.trim()
            : 'Todos los rubros');

    const irAlDetalle = (id: number) => {
        if (onSeleccionarPrestador) {
            onSeleccionarPrestador(id);
            return;
        }
        navigate(`/prestadores/${id}`);
    };

    const aplicarActualizacion = () => {
        setBusquedaActiva(busquedaInput);
        setPaginaActual(1);
        setContadorActualizacion((n) => n + 1);
    };

    const limpiarFiltrosRapidos = () => {
        setBusquedaInput('');
        setBusquedaActiva('');
        setRubroSeleccionado('');
        setLocalidadSeleccionada('');
        setSoloMatriculados(false);
        setSoloConGarantia(false);
        setSoloMejorCalificados(false);
        setOrdenSeleccionado('ratingPromedio:desc');
        setPaginaActual(1);
    };

    const paginasNumericas = Array.from(
        { length: totalPaginas },
        (_, idx) => idx + 1
    );

    return (
        <section
            className="catalogo-usuario"
            aria-label="Catálogo de prestadores para usuarios"
            data-testid="catalogo-prestadores-usuario"
        >
            <div className="catalogo-usuario__panel-busqueda">
                <div className="catalogo-usuario__busqueda-cabecera">
                    <div className="catalogo-usuario__criterio-bloque">
                        <div
                            className="catalogo-usuario__icono-lupa"
                            aria-hidden="true"
                        >
                            🔍
                        </div>
                        <div>
                            <div className="catalogo-usuario__eyebrow">
                                <span>CRITERIO DE BÚSQUEDA</span>
                                <span className="catalogo-usuario__disponibles">
                                    • {totalProfesionales} disponibles
                                </span>
                            </div>
                            <h3 className="catalogo-usuario__titulo-resultados">
                                Resultados para{' '}
                                <span className="catalogo-usuario__criterio-destacado">
                                    &ldquo;{etiquetaCriterio}&rdquo;
                                </span>
                                {localidadSeleccionada
                                    ? ` en ${localidadSeleccionada}`
                                    : ''}
                            </h3>
                        </div>
                    </div>

                    <div className="catalogo-usuario__busqueda-controles">
                        <div className="catalogo-usuario__input-contenedor">
                            <span aria-hidden="true">☰</span>
                            <input
                                id="catalogo-busqueda-input"
                                type="text"
                                aria-label="Buscar por especialidad o rubro"
                                placeholder="Plomería, gas, termotanques..."
                                value={busquedaInput}
                                onChange={(e) => {
                                    setBusquedaInput(e.target.value);
                                    setBusquedaActiva(e.target.value);
                                    setPaginaActual(1);
                                }}
                            />
                        </div>

                        <button
                            id="catalogo-btn-actualizar"
                            type="button"
                            className="catalogo-usuario__btn-actualizar"
                            onClick={aplicarActualizacion}
                        >
                            ↻ Actualizar
                        </button>
                    </div>
                </div>

                <div className="catalogo-usuario__filtros-rapidos">
                    <span className="catalogo-usuario__filtros-etiqueta">
                        ⫶ Filtros:
                    </span>

                    <div className="catalogo-usuario__chips-contenedor">
                        <select
                            id="catalogo-filtro-rubro"
                            aria-label="Filtrar catálogo por rubro"
                            className="catalogo-filtro-pill catalogo-filtro-pill--activo"
                            value={rubroSeleccionado}
                            onChange={(e) => {
                                setRubroSeleccionado(e.target.value);
                                setPaginaActual(1);
                            }}
                        >
                            <option value="">🔧 Todos los rubros</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    🔧 {cat.nombre}
                                </option>
                            ))}
                        </select>

                        <select
                            id="catalogo-filtro-localidad"
                            data-testid="filtro-localidad"
                            aria-label="Filtrar catálogo por localidad"
                            className={`catalogo-filtro-pill ${
                                localidadSeleccionada
                                    ? 'catalogo-filtro-pill--activo'
                                    : ''
                            }`}
                            value={localidadSeleccionada}
                            onChange={(e) => {
                                setLocalidadSeleccionada(e.target.value);
                                setPaginaActual(1);
                            }}
                        >
                            <option value="">📍 Todas las localidades</option>
                            {localidadesDisponibles.map((loc) => (
                                <option key={loc} value={loc}>
                                    📍 {loc}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            data-testid="filtro-matriculados"
                            className={`catalogo-filtro-pill ${
                                soloMatriculados
                                    ? 'catalogo-filtro-pill--activo'
                                    : ''
                            }`}
                            aria-pressed={soloMatriculados}
                            onClick={() => {
                                setSoloMatriculados((prev) => !prev);
                                setPaginaActual(1);
                            }}
                        >
                            ✓ Matriculados
                        </button>

                        <button
                            type="button"
                            data-testid="filtro-garantia"
                            className={`catalogo-filtro-pill ${
                                soloConGarantia
                                    ? 'catalogo-filtro-pill--activo'
                                    : ''
                            }`}
                            aria-pressed={soloConGarantia}
                            onClick={() => {
                                setSoloConGarantia((prev) => !prev);
                                setPaginaActual(1);
                            }}
                        >
                            ✓ Ofrece garantía
                        </button>

                        <button
                            type="button"
                            data-testid="filtro-mejor-calificados"
                            className={`catalogo-filtro-pill ${
                                soloMejorCalificados
                                    ? 'catalogo-filtro-pill--activo'
                                    : ''
                            }`}
                            aria-pressed={soloMejorCalificados}
                            onClick={() => {
                                setSoloMejorCalificados((prev) => !prev);
                                setPaginaActual(1);
                            }}
                        >
                            ★ Mejor calificados (4.8+)
                        </button>

                        <button
                            type="button"
                            data-testid="filtro-limpiar"
                            className="catalogo-filtro-pill catalogo-filtro-pill--mas"
                            onClick={limpiarFiltrosRapidos}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            <div className="catalogo-usuario__barra-estado">
                <div className="catalogo-usuario__contador-verificados">
                    <span
                        className="catalogo-usuario__punto-verde"
                        aria-hidden="true"
                    />
                    <span>
                        Mostrando <strong>{totalProfesionales}</strong>{' '}
                        profesionales disponibles
                    </span>
                </div>

                <div className="catalogo-usuario__ordenamiento">
                    <label htmlFor="catalogo-ordenar-por">Ordenar por:</label>
                    <select
                        id="catalogo-ordenar-por"
                        value={ordenSeleccionado}
                        onChange={(e) => {
                            setOrdenSeleccionado(
                                e.target.value as CriterioOrdenCatalogo
                            );
                            setPaginaActual(1);
                        }}
                    >
                        <option value="ratingPromedio:desc">
                            Mayor puntuación
                        </option>
                        <option value="aniosExperiencia:desc">
                            Mayor experiencia
                        </option>
                        <option value="nombre:asc">Nombre (A - Z)</option>
                        <option value="nombre:desc">Nombre (Z - A)</option>
                    </select>
                </div>
            </div>

            {cargando ? (
                <div className="prestadores-estado" role="status">
                    Cargando profesionales...
                </div>
            ) : error ? (
                <div className="prestadores-estado prestadores-estado--error">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        className="btn-prestador btn-prestador--primario"
                        onClick={aplicarActualizacion}
                    >
                        Reintentar
                    </button>
                </div>
            ) : prestadoresPagina.length === 0 ? (
                <div className="prestadores-estado">
                    No se encontraron profesionales para los filtros
                    seleccionados.
                </div>
            ) : (
                <div className="catalogo-usuario__grilla">
                    {prestadoresPagina.map((prestador) => (
                        <TarjetaCatalogoPrestador
                            key={prestador.id}
                            prestador={prestador}
                            onVerPerfil={irAlDetalle}
                        />
                    ))}
                </div>
            )}

            <footer className="catalogo-usuario__pie-paginacion">
                <span className="catalogo-usuario__resumen-pagina">
                    Página <strong>{paginaSegura}</strong> de{' '}
                    <strong>{totalPaginas}</strong> ({prestadoresPagina.length}{' '}
                    de {totalProfesionales} profesionales)
                </span>

                <div className="catalogo-usuario__paginas-controles">
                    <button
                        type="button"
                        className="catalogo-pagina-btn"
                        aria-label="Página anterior"
                        disabled={paginaSegura <= 1}
                        onClick={() =>
                            setPaginaActual((p) => Math.max(1, p - 1))
                        }
                    >
                        ‹
                    </button>

                    {paginasNumericas.map((nro) => (
                        <button
                            key={nro}
                            type="button"
                            className={`catalogo-pagina-btn ${
                                nro === paginaSegura
                                    ? 'catalogo-pagina-btn--activa'
                                    : ''
                            }`}
                            aria-label={`Página ${nro}`}
                            aria-current={
                                nro === paginaSegura ? 'page' : undefined
                            }
                            onClick={() => setPaginaActual(nro)}
                        >
                            {nro}
                        </button>
                    ))}

                    <button
                        type="button"
                        className="catalogo-pagina-btn"
                        aria-label="Página siguiente"
                        disabled={paginaSegura >= totalPaginas}
                        onClick={() =>
                            setPaginaActual((p) =>
                                Math.min(totalPaginas, p + 1)
                            )
                        }
                    >
                        ›
                    </button>
                </div>

                <span className="catalogo-usuario__tiempo-real">
                    ⚡ Actualizado en tiempo real
                </span>
            </footer>
        </section>
    );
}
