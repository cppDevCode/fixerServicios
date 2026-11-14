/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/prestadores/Prestadores.css';
import type { ICategoria, IPrestador } from '../interfaces/prestador.interface';
import {
    CATEGORIAS_POR_DEFECTO,
    LOCALIDADES_POR_DEFECTO,
    obtenerCategorias,
    obtenerPrestadores,
} from '../services/prestador.service';
import { TODAS_LAS_LOCALIDADES_ARGENTINA } from '../services/ubicacionesArgentina';

const CLAVE_HISTORIAL_BUSQUEDAS = 'fixer_busquedas_categorias';

const ETIQUETAS_SUGERENCIA_POR_RUBRO: Record<string, string> = {
    Plomería: 'Plomería de urgencia',
    Refrigeración: 'Instalación de aire acondicionado',
    Pintura: 'Pintura de interiores',
    Electricidad: 'Electricistas matriculados',
    Gasista: 'Gasistas matriculados',
    Carpintería: 'Carpintería a medida',
    Albañilería: 'Albañilería y refacciones',
    Cerrajería: 'Cerrajería 24 hs',
    Jardinería: 'Mantenimiento de jardines',
};

const PESO_POPULARIDAD_BASE: Record<string, number> = {
    Plomería: 5,
    Refrigeración: 4,
    Pintura: 3,
    Electricidad: 2,
    Gasista: 1,
};

export interface ISugerenciaCategoria {
    categoriaId: string;
    nombre: string;
    etiqueta: string;
    busquedas: number;
}

export function calcularCategoriasMasBuscadas(
    prestadores: IPrestador[],
    categorias: ICategoria[] = CATEGORIAS_POR_DEFECTO,
    conteoBusquedas: Record<string, number> = {},
    limite: number = 4
): ISugerenciaCategoria[] {
    const listaBase =
        categorias.length > 0 ? categorias : CATEGORIAS_POR_DEFECTO;

    const conteoPorRubro: Record<string, number> = {};
    for (const p of prestadores) {
        conteoPorRubro[p.categoriaId] =
            (conteoPorRubro[p.categoriaId] ?? 0) + 1;
    }

    return listaBase
        .map((cat) => {
            const cantidadPrestadores = conteoPorRubro[cat.id] ?? 0;
            const busquedasUsuario = conteoBusquedas[cat.id] ?? 0;
            const pesoBase = PESO_POPULARIDAD_BASE[cat.id] ?? 0;
            const puntaje =
                cantidadPrestadores * 10 + busquedasUsuario * 15 + pesoBase;
            return {
                categoriaId: cat.id,
                nombre: cat.nombre,
                etiqueta:
                    ETIQUETAS_SUGERENCIA_POR_RUBRO[cat.id] ?? cat.nombre,
                busquedas: puntaje,
            };
        })
        .sort((a, b) => {
            if (b.busquedas !== a.busquedas) {
                return b.busquedas - a.busquedas;
            }
            return a.nombre.localeCompare(b.nombre, 'es', {
                sensitivity: 'base',
            });
        })
        .slice(0, limite);
}

function leerHistorialBusquedas(): Record<string, number> {
    if (typeof window === 'undefined' || !window.localStorage) {
        return {};
    }
    try {
        const guardado = window.localStorage.getItem(CLAVE_HISTORIAL_BUSQUEDAS);
        if (!guardado) return {};
        const parseado = JSON.parse(guardado) as Record<string, number>;
        return typeof parseado === 'object' && parseado !== null
            ? parseado
            : {};
    } catch {
        return {};
    }
}

function registrarBusquedaCategoria(categoriaId?: string): void {
    if (
        !categoriaId ||
        typeof window === 'undefined' ||
        !window.localStorage
    ) {
        return;
    }
    try {
        const actual = leerHistorialBusquedas();
        actual[categoriaId] = (actual[categoriaId] ?? 0) + 1;
        window.localStorage.setItem(
            CLAVE_HISTORIAL_BUSQUEDAS,
            JSON.stringify(actual)
        );
    } catch {
        // Ignorar errores de almacenamiento local
    }
}

export interface HomePageProps {
    categoriasIniciales?: ICategoria[];
    prestadoresIniciales?: IPrestador[];
}

export function HomePage({
    categoriasIniciales,
    prestadoresIniciales,
}: HomePageProps) {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState<ICategoria[]>(
        categoriasIniciales ?? CATEGORIAS_POR_DEFECTO
    );
    const [prestadores, setPrestadores] = useState<IPrestador[]>(
        prestadoresIniciales ?? []
    );

    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [rubroSeleccionado, setRubroSeleccionado] = useState('');
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');

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
                // Mantiene CATEGORIAS_POR_DEFECTO
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
        obtenerPrestadores({ page: 1, limit: 50 })
            .then((res) => {
                if (activo && Array.isArray(res.datos)) {
                    setPrestadores(res.datos);
                }
            })
            .catch(() => {
                // Mantiene lista vacía como respaldo
            });
        return () => {
            activo = false;
        };
    }, [prestadoresIniciales]);

    const categoriasMasBuscadas = useMemo(
        () =>
            calcularCategoriasMasBuscadas(
                prestadores,
                categorias,
                leerHistorialBusquedas(),
                4
            ),
        [prestadores, categorias]
    );

    const localidadesOpciones = useMemo(() => {
        const principales = new Set<string>(LOCALIDADES_POR_DEFECTO);
        for (const p of prestadores) {
            if (p.localidad && p.localidad.trim() !== '') {
                principales.add(p.localidad.trim());
            }
        }
        for (const loc of TODAS_LAS_LOCALIDADES_ARGENTINA) {
            principales.add(loc);
        }
        return Array.from(principales);
    }, [prestadores]);

    const navegarAlCatalogo = (parametros: {
        search?: string;
        rubro?: string;
        localidad?: string;
    }) => {
        const query = new URLSearchParams();
        if (parametros.search && parametros.search.trim() !== '') {
            query.set('search', parametros.search.trim());
        }
        if (parametros.rubro && parametros.rubro.trim() !== '') {
            const rubroLimpio = parametros.rubro.trim();
            query.set('rubro', rubroLimpio);
            registrarBusquedaCategoria(rubroLimpio);
        }
        if (parametros.localidad && parametros.localidad.trim() !== '') {
            query.set('localidad', parametros.localidad.trim());
        }
        const queryString = query.toString();
        navigate(
            queryString
                ? `/prestadores/catalogo?${queryString}`
                : '/prestadores/catalogo'
        );
    };

    const manejarSubmitBusqueda = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        navegarAlCatalogo({
            search: textoBusqueda,
            rubro: rubroSeleccionado,
            localidad: localidadSeleccionada,
        });
    };

    const totalProfesionales =
        prestadores.length > 0 ? prestadores.length : 16;

    return (
        <section
            className="home-pagina"
            aria-label="Inicio Fixer Servicios"
            data-testid="home-pagina"
        >
            <div className="home-hero">
                <span className="home-hero__badge">
                    ✓ Plataforma de Servicios para el Hogar
                </span>

                <h1 className="home-hero__titulo">
                    Encontrá al profesional ideal para tu hogar
                </h1>

                <p className="home-hero__subtitulo">
                    Plomería, electricidad, pintura, climatización y más con
                    garantía de satisfacción.
                </p>

                <form
                    className="home-buscador"
                    onSubmit={manejarSubmitBusqueda}
                    aria-label="Buscador principal de profesionales"
                >
                    <div className="home-buscador__campo">
                        <span
                            className="home-buscador__icono"
                            aria-hidden="true"
                        >
                            🔍
                        </span>
                        <input
                            id="home-busqueda-texto"
                            type="text"
                            aria-label="¿Qué servicio o rubro necesitás?"
                            placeholder="¿Qué servicio o rubro necesitás?"
                            value={textoBusqueda}
                            onChange={(e) => setTextoBusqueda(e.target.value)}
                        />
                    </div>

                    <span
                        className="home-buscador__separador"
                        aria-hidden="true"
                    />

                    <div className="home-buscador__campo">
                        <span
                            className="home-buscador__icono"
                            aria-hidden="true"
                        >
                            🧰
                        </span>
                        <select
                            id="home-busqueda-rubro"
                            aria-label="Seleccionar rubro"
                            value={rubroSeleccionado}
                            onChange={(e) =>
                                setRubroSeleccionado(e.target.value)
                            }
                        >
                            <option value="">Todos los rubros</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span
                        className="home-buscador__separador"
                        aria-hidden="true"
                    />

                    <div className="home-buscador__campo">
                        <span
                            className="home-buscador__icono"
                            aria-hidden="true"
                        >
                            📍
                        </span>
                        <select
                            id="home-busqueda-localidad"
                            aria-label="Tu zona o barrio"
                            value={localidadSeleccionada}
                            onChange={(e) =>
                                setLocalidadSeleccionada(e.target.value)
                            }
                        >
                            <option value="">Tu zona o barrio</option>
                            {localidadesOpciones.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        data-testid="home-btn-buscar"
                        className="home-buscador__boton"
                    >
                        Buscar profesionales →
                    </button>
                </form>

                <div
                    className="home-frecuentes"
                    aria-label="Categorías más buscadas"
                >
                    <span className="home-frecuentes__etiqueta">
                        FRECUENTES:
                    </span>
                    <div className="home-frecuentes__lista">
                        {categoriasMasBuscadas.map((sugerencia) => (
                            <button
                                key={sugerencia.categoriaId}
                                type="button"
                                data-testid="sugerencia-categoria"
                                data-categoria={sugerencia.categoriaId}
                                title={`Rubro: ${sugerencia.nombre}`}
                                className="home-frecuentes__chip"
                                onClick={() =>
                                    navegarAlCatalogo({
                                        rubro: sugerencia.categoriaId,
                                        localidad:
                                            localidadSeleccionada || undefined,
                                    })
                                }
                            >
                                {sugerencia.etiqueta}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="home-hero__estadistica">
                    <span
                        className="home-hero__estadistica-icono"
                        aria-hidden="true"
                    >
                        ✓
                    </span>
                    <span>
                        Más de <strong>{totalProfesionales}</strong>{' '}
                        profesionales disponibles con experiencia comprobada en
                        cada rubro
                    </span>
                </div>
            </div>
        </section>
    );
}
