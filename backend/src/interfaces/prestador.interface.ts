export interface ITelefono {
    codPais: string;
    codArea: string;
    nroTelefono: string;
}

/**
 * Entidad normalizada almacenada en el repositorio de Prestadores.
 * No persiste campos derivados (ratingPromedio) ni geografía duplicada (provincia/localidad/CP/radio),
 * que se resuelven mediante FKs normalizadas hacia CATEGORIA y UBICACION, y cálculo desde RESENA.
 */
export interface IPrestadorEntidad {
    id: number;
    nombre: string;
    apellido: string;
    fotoUrl?: string;
    matricula?: string;
    aniosExperiencia: number;
    acercaDe: string;
    ofreceGarantia: boolean;
    categoriaId: number;
    ubicacionId?: number;
    telefono: ITelefono;
}

/**
 * Representación de dominio / API de Prestador enriquecida con proyecciones
 * desde CATEGORIA, UBICACION y el promedio calculado dinámicamente desde RESENA.
 */
export interface IPrestador extends IPrestadorEntidad {
    categoriaNombre?: string;
    provincia?: string;
    localidad?: string;
    codigoPostal?: string;
    radio?: number;
    ratingPromedio?: number;
}
