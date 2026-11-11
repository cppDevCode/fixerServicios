import { useState } from 'react';
import type { IResena } from '../interfaces/resena.interface';
import { ListadoResenas } from '../components/resenas/ListadoResenas';
import { FormularioResena } from '../components/resenas/FormularioResena';

export function ResenasPage() {
    const [prestadorId, setPrestadorId] = useState(1);
    const [versionResenas, setVersionResenas] = useState(0);
    const [resenaEditar, setResenaEditar] = useState<IResena | null>(null);

    // Valores temporales para probar el módulo sin autenticación.
    const usuarioId = 2;

    const actualizarResenas = () => {
        setVersionResenas((version) => version + 1);
        setResenaEditar(null);
    };

    const cambiarPrestador = (nuevoId: number) => {
        setPrestadorId(nuevoId);
        setResenaEditar(null);
    };

    return (
        <main>
            <header>
                <h1>Reseñas y calificaciones</h1>
                <p>
                    Consultá las opiniones de los usuarios sobre
                    los profesionales de Fixer.
                </p>
            </header>

            <section>
                <label htmlFor="prestador-id">
                    ID del profesional
                </label>

                <input
                    id="prestador-id"
                    type="number"
                    min="1"
                    value={prestadorId}
                    onChange={(evento) => {
                        const valor = Number(evento.target.value);

                        if (Number.isInteger(valor) && valor > 0) {
                            cambiarPrestador(valor);
                        }
                    }}
                />
            </section>

            <FormularioResena
                key={`formulario-${prestadorId}-${resenaEditar?.id ?? 'nuevo'}`}
                prestadorId={prestadorId}
                usuarioId={usuarioId}
                resenaEditar={resenaEditar}
                onResenaGuardada={actualizarResenas}
                onCancelarEdicion={() => setResenaEditar(null)}
            />

            <ListadoResenas
                key={`${prestadorId}-${versionResenas}`}
                prestadorId={prestadorId}
                onEditarResena={setResenaEditar}
            />
        </main>
    );
}