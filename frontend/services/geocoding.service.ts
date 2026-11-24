export interface Coordenadas {
    lat: number;
    lon: number;
}

export async function obtenerCoordenadas(
    codigoPostal: string,
    ciudad: string = '',
    provincia: string = '',
    pais: string = 'Argentina'
): Promise<Coordenadas | null> {

    const localidadLimpia = ciudad.trim();
    const provinciaLimpia = provincia.trim();
    const codigoPostalLimpio = codigoPostal.trim();

    const params = new URLSearchParams({
        format: 'jsonv2',
        country: pais,
        countrycodes: 'ar',
        limit: '1',
        addressdetails: '1',
    });

    if (localidadLimpia) {
        params.set('city', localidadLimpia);

        if (provinciaLimpia) {
            params.set('state', provinciaLimpia);
        }
    } else if (codigoPostalLimpio) {
        // Si no tenemos localidad, utilizamos el código postal.
        params.set('postalcode', codigoPostalLimpio);

        if (provinciaLimpia) {
            params.set('state', provinciaLimpia);
        }
    } else {
        console.error('No hay datos suficientes para ubicar al prestador.');
        return null;
    }

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Error al consultar Nominatim');
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        const resultado = data[0];

        return {
            lat: Number(resultado.lat),
            lon: Number(resultado.lon),
        };

    } catch (error) {
        console.error('Error en geocoding:', error);
        return null;
    }
}
