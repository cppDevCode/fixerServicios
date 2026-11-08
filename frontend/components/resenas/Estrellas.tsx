
interface EstrellasProps {
    calificacion: number;
}

export function Estrellas({ calificacion }: EstrellasProps) {
    const valor = Math.max(0, Math.min(5, calificacion));

    return (
        <div
        role="img"
        aria-label={`Calificación: ${valor} de 5 estrellas`}
        style={{ display: 'flex', gap: '4px' }}
        >
        {Array.from({ length: 5 }, (_, indice) => (
            <span
            key={indice}
            aria-hidden="true"
            style={{
                color: indice < Math.round(valor) ? '#E5A23B' : '#CBD5E1',
                fontSize: '20px',
            }}
            >
            ★
            </span>
        ))}
        </div>
    );
}
