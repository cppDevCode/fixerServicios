import { useEffect, useState } from 'react';

export const SILUETA_PERSONA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Silueta de persona"><rect width="120" height="120" rx="60" fill="#e2e8f0"/><circle cx="60" cy="44" r="22" fill="#94a3b8"/><path d="M22 108c4-22 20-34 38-34s34 12 38 34" fill="#94a3b8"/></svg>`;

export const SILUETA_PERSONA_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(SILUETA_PERSONA_SVG)}`;

export interface AvatarPrestadorProps {
    nombre: string;
    apellido: string;
    fotoUrl?: string;
    tamano?: 'sm' | 'md' | 'lg';
}

export const AvatarPrestador = ({
    nombre,
    apellido,
    fotoUrl,
    tamano = 'md',
}: AvatarPrestadorProps) => {
    const [errorCarga, setErrorCarga] = useState<boolean>(false);

    useEffect(() => {
        setErrorCarga(false);
    }, [fotoUrl]);

    const urlLimpia = fotoUrl?.trim() ?? '';
    const tieneFotoValida = Boolean(urlLimpia) && !errorCarga;
    const srcImagen = tieneFotoValida ? urlLimpia : SILUETA_PERSONA_DATA_URI;
    const textoAlt = tieneFotoValida
        ? `Foto de ${nombre} ${apellido}`.trim()
        : `Silueta de ${nombre} ${apellido}`.trim();

    return (
        <div
            className={`avatar-prestador avatar-prestador--${tamano}`}
            data-testid="avatar-prestador"
            data-tiene-foto={tieneFotoValida ? 'true' : 'false'}
        >
            <img
                src={srcImagen}
                alt={textoAlt}
                className="avatar-prestador__img"
                onError={() => setErrorCarga(true)}
            />
        </div>
    );
};
