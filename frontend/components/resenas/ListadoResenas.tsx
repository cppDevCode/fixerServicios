
import { useEffect, useState } from 'react';
import type { IResena } from '../../interfaces/resena.interface';
import { obtenerResenas } from '../../services/resena.service';
import { TarjetaResena } from './TarjetaResena';

interface ListadoResenasProps {
    prestadorId: number;
}

const LIMITE = 5;

export function ListadoResenas({
    prestadorId,
    }: ListadoResenasProps) {
    const [resenas, setResenas] = useState<IResena[]>([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reintento, setReintento] = useState(0);

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
            setTotalPaginas(respuesta.meta?.totalPages ?? 0);
        } catch {
            if (!activo) return;

            setError('No pudimos cargar las reseñas.');
            setResenas([]);
        } finally {
            if (activo) setCargando(false);
        }
        }

        void cargarResenas();

        return () => {
        activo = false;
        };
    }, [prestadorId, pagina, reintento]);

    if (cargando) {
        return <p>Cargando reseñas...</p>;
    }

    if (error) {
        return (
        <section>
            <p role="alert">{error}</p>
            <button onClick={() => setReintento((n) => n + 1)}>
            Reintentar
            </button>
        </section>
        );
    }

    if (resenas.length === 0) {
        return <p>Este profesional todavía no tiene reseñas.</p>;
    }

    return (
        <section aria-label="Reseñas del profesional">
        <div className="listado-resenas">
            {resenas.map((resena) => (
            <TarjetaResena key={resena.id} resena={resena} />
            ))}
        </div>

        <nav aria-label="Paginación de reseñas">
            <button
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
            >
            Anterior
            </button>

            <span>
            Página {pagina} de {totalPaginas}
            </span>

            <button
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            >
            Siguiente
            </button>
        </nav>
        </section>
    );
}
