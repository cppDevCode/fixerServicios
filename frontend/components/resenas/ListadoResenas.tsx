
import { useEffect, useState } from 'react';

import type { IResena } from '../../interfaces/resena.interface';
import { obtenerResenas } from '../../services/resena.service';
import {
    exportarValoraciones,
    type FormatoExportacion,
} from '../../services/exportarValoraciones.service';

import { TarjetaResena } from './TarjetaResena';
import { Estrellas } from './Estrellas';

import './Resenas.css';

interface ListadoResenasProps {
    prestadorId: number;
    onEditarResena?: (resena: IResena) => void;
}

const LIMITE = 5;

export function ListadoResenas({
    prestadorId,
    onEditarResena,
}: ListadoResenasProps) {
    const [resenas, setResenas] = useState<IResena[]>([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reintento, setReintento] = useState(0);
    const [promedio, setPromedio] = useState(0);
    const [totalResenas, setTotalResenas] = useState(0);

    // Estados de exportación
    const [exportando, setExportando] = useState(false);

    const [errorExportacion, setErrorExportacion] =
        useState<string | null>(null);

    const [menuExportacionAbierto, setMenuExportacionAbierto] =
        useState(false);

    useEffect(() => {
        setPagina(1);
    }, [prestadorId]);

    useEffect(() => {
        let activo = true;

        async function cargarResenas() {
            setCargando(true);
            setError(null);

            try {
                const respuesta = await obtenerResenas(
                    prestadorId,
                    pagina,
                    LIMITE
                );

                if (!activo) return;

                setResenas(respuesta.datos);
                setTotalPaginas(
                    respuesta.meta?.totalPages ?? 0
                );
                setPromedio(
                    respuesta.meta?.promedio ?? 0
                );
                setTotalResenas(
                    respuesta.meta?.total ?? 0
                );
            } catch {
                if (!activo) return;

                setError(
                    'No pudimos cargar las reseñas.'
                );
                setResenas([]);
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        void cargarResenas();

        return () => {
            activo = false;
        };
    }, [prestadorId, pagina, reintento]);

    async function manejarExportacion(
        formato: FormatoExportacion
    ) {
        if (exportando) return;

        setExportando(true);
        setErrorExportacion(null);
        setMenuExportacionAbierto(false);

        try {
            await exportarValoraciones(
                prestadorId,
                formato
            );
        } catch (error) {
            setErrorExportacion(
                error instanceof Error
                    ? error.message
                    : 'No se pudo exportar el reporte de valoraciones.'
            );
        } finally {
            setExportando(false);
        }
    }

    if (cargando) {
        return (
            <p
                className="estado-resenas"
                role="status"
            >
                Cargando reseñas...
            </p>
        );
    }

    if (error) {
        return (
            <section className="estado-resenas estado-resenas--error">
                <p role="alert">{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        setReintento((n) => n + 1)
                    }
                >
                    Reintentar
                </button>
            </section>
        );
    }

    if (resenas.length === 0) {
        return (
            <p className="estado-resenas">
                Este profesional todavía no tiene reseñas.
            </p>
        );
    }

    return (
        <section
            className="listado-resenas-contenedor"
            aria-label="Reseñas del profesional"
        >
            <header className="resumen-calificaciones">
                <h2>Opiniones de clientes</h2>

                <div className="resumen-calificaciones__promedio">
                    <strong>
                        {promedio
                            .toFixed(1)
                            .replace('.', ',')}
                    </strong>

                    <Estrellas
                        calificacion={promedio}
                    />

                    <span>
                        {totalResenas}{' '}
                        {totalResenas === 1
                            ? 'opinión'
                            : 'opiniones'}
                    </span>
                </div>
            </header>

            <div className="listado-resenas">
                {resenas.map((resena) => (
                    <TarjetaResena
                        key={resena.id}
                        resena={resena}
                        onEditar={onEditarResena}
                    />
                ))}
            </div>

            {/* Exportación de valoraciones */}
            <div className="resenas-exportacion">
                <div className="resenas-exportacion__menu">
                    {menuExportacionAbierto && (
                        <div className="resenas-exportacion__opciones">
                            <button
                                type="button"
                                onClick={() => {
                                    void manejarExportacion(
                                        'xlsx'
                                    );
                                }}
                                disabled={exportando}
                            >
                                Excel (.xlsx)
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    void manejarExportacion(
                                        'pdf'
                                    );
                                }}
                                disabled={exportando}
                            >
                                PDF (.pdf)
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        className="resenas-exportacion__boton"
                        onClick={() =>
                            setMenuExportacionAbierto(
                                (abierto) => !abierto
                            )
                        }
                        disabled={exportando}
                        aria-expanded={
                            menuExportacionAbierto
                        }
                        aria-haspopup="true"
                    >
                        {exportando
                            ? 'Generando archivo...'
                            : '↓ Exportar valoraciones ▾'}
                    </button>
                </div>

                {errorExportacion && (
                    <p
                        role="alert"
                        className="resenas-exportacion__error"
                    >
                        {errorExportacion}
                    </p>
                )}
            </div>

            {totalPaginas > 1 && (
                <nav
                    className="paginacion-resenas"
                    aria-label="Paginación de reseñas"
                >
                    <button
                        type="button"
                        disabled={pagina === 1}
                        onClick={() =>
                            setPagina((p) => p - 1)
                        }
                    >
                        Anterior
                    </button>

                    <span>
                        Página {pagina} de {totalPaginas}
                    </span>

                    <button
                        type="button"
                        disabled={
                            pagina >= totalPaginas
                        }
                        onClick={() =>
                            setPagina((p) => p + 1)
                        }
                    >
                        Siguiente
                    </button>
                </nav>
            )}
        </section>
    );
}
