
interface EstrellasProps {
    calificacion: number;
}

export function Estrellas({ calificacion }: EstrellasProps) {
    const valor = Math.max(0, Math.min(5, calificacion));

    return (
        <div
            className="estrellas"
            role="img"
            aria-label={`${valor} de 5 estrellas`}
        >
            {Array.from({ length: 5 }, (_, indice) => {
                const porcentaje = Math.max(
                    0,
                    Math.min(100, (valor - indice) * 100)
                );

                return (
                    <span
                        key={indice}
                        className="estrella"
                        aria-hidden="true"
                    >
                        <span className="estrella__vacia">
                            ★
                        </span>

                        <span
                            className="estrella__relleno"
                            style={{ width: `${porcentaje}%` }}
                        >
                            ★
                        </span>
                    </span>
                );
            })}
        </div>
    );
}
