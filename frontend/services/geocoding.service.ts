export interface Coordenadas {
  lat: number;
  lon: number;
}

/**
 *  API gratuita de Nominatim: convierte una dirección (código postal + ciudad + país) en coordenadas.
 */
export async function obtenerCoordenadas(
  codigoPostal: string,
  ciudad: string = '',
  pais: string = 'Argentina'
): Promise<Coordenadas | null> {
  const query = [codigoPostal, ciudad, pais].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Fixer-App/1.0 (proyecto-facultad)',
      },
    });

    if (!response.ok) {
      throw new Error('Error al consultar Nominatim');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null; // No se encontraron coordenadas
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Error en geocoding:', error);
    return null;
  }
}