
import { useState } from 'react';
import { ListadoResenas } from '../components/resenas/ListadoResenas';

export function ResenasPage() {
    const [prestadorId, setPrestadorId] = useState(1);

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
                setPrestadorId(valor);
                }
            }}
            />
        </section>

        <ListadoResenas
            key={prestadorId}
            prestadorId={prestadorId}
        />
        </main>
    );
}
