export interface Coordenadas {
    lat: number;
    lon: number;
}

const cacheCoordenadas = new Map<string, Coordenadas>();

export function limpiarCacheCoordenadas(): void {
    cacheCoordenadas.clear();
}

export function normalizarLocalidadParaGeocoding(localidad: string): string {
    const limpia = localidad.trim().replace(/\s+/g, ' ');
    if (!limpia) return '';

    const clave = limpia
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (clave === 'caba' || clave === 'capital federal') {
        return 'Buenos Aires';
    }

    // En OpenStreetMap / Nominatim las capitales provinciales argentinas se indexan
    // sin el sufijo "Capital" (ej. "Córdoba Capital" -> "Córdoba", "Salta Capital" -> "Salta").
    const sinSufijoCapital = limpia.replace(/\s+capital$/i, '').trim();
    return sinSufijoCapital || limpia;
}

export function construirConsultasNominatim(
    codigoPostal: string,
    ciudad: string = '',
    provincia: string = '',
    pais: string = 'Argentina'
): URLSearchParams[] {
    const localidadOriginal = ciudad.trim().replace(/\s+/g, ' ');
    const localidadNormalizada = normalizarLocalidadParaGeocoding(localidadOriginal);
    const provinciaLimpia = provincia.trim().replace(/\s+/g, ' ');
    const codigoPostalLimpio = codigoPostal.trim();
    const paisLimpio = pais.trim() || 'Argentina';

    const crearBase = () =>
        new URLSearchParams({
            format: 'jsonv2',
            countrycodes: 'ar',
            limit: '1',
            addressdetails: '1',
        });

    const consultas: URLSearchParams[] = [];

    // 1. Búsqueda estructurada con localidad normalizada (+ provincia)
    if (localidadNormalizada) {
        const estructurada = crearBase();
        estructurada.set('city', localidadNormalizada);
        if (provinciaLimpia) {
            estructurada.set('state', provinciaLimpia);
        }
        estructurada.set('country', paisLimpio);
        consultas.push(estructurada);

        // 2. Fallback por texto libre (resuelve barrios de CABA, pueblos y localidades
        //    etiquetadas como suburb/town/village en OpenStreetMap)
        const textoLibre = crearBase();
        const partes = [localidadNormalizada];
        if (
            provinciaLimpia &&
            provinciaLimpia.toLowerCase() !== localidadNormalizada.toLowerCase()
        ) {
            partes.push(provinciaLimpia);
        }
        partes.push(paisLimpio);
        textoLibre.set('q', partes.join(', '));
        consultas.push(textoLibre);
    }

    // 3. Fallback por código postal (+ provincia) y solo código postal
    if (codigoPostalLimpio) {
        if (provinciaLimpia) {
            const porCpConProvincia = crearBase();
            porCpConProvincia.set('postalcode', codigoPostalLimpio);
            porCpConProvincia.set('state', provinciaLimpia);
            porCpConProvincia.set('country', paisLimpio);
            consultas.push(porCpConProvincia);
        }

        const porCp = crearBase();
        porCp.set('postalcode', codigoPostalLimpio);
        porCp.set('country', paisLimpio);
        consultas.push(porCp);
    }

    return consultas;
}

async function consultarNominatim(
    params: URLSearchParams
): Promise<Coordenadas | null> {
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error al consultar Nominatim (HTTP ${response.status})`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
        return null;
    }

    const resultado = data[0] as { lat?: string | number; lon?: string | number };
    const lat = Number(resultado.lat);
    const lon = Number(resultado.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    return { lat, lon };
}

export async function obtenerCoordenadas(
    codigoPostal: string,
    ciudad: string = '',
    provincia: string = '',
    pais: string = 'Argentina'
): Promise<Coordenadas | null> {
    const consultas = construirConsultasNominatim(
        codigoPostal,
        ciudad,
        provincia,
        pais
    );

    if (consultas.length === 0) {
        console.error('No hay datos suficientes para ubicar al prestador.');
        return null;
    }

    const claveCache = [
        codigoPostal.trim(),
        ciudad.trim().toLowerCase(),
        provincia.trim().toLowerCase(),
        pais.trim().toLowerCase(),
    ].join('|');

    const enCache = cacheCoordenadas.get(claveCache);
    if (enCache) {
        return { ...enCache };
    }

    try {
        for (const params of consultas) {
            const coordenadas = await consultarNominatim(params);
            if (coordenadas) {
                cacheCoordenadas.set(claveCache, coordenadas);
                return { ...coordenadas };
            }
        }
        return null;
    } catch (error) {
        console.error('Error en geocoding:', error);
        return null;
    }
}
