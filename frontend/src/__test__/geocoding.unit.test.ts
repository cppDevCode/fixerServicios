import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    construirConsultasNominatim,
    limpiarCacheCoordenadas,
    normalizarLocalidadParaGeocoding,
    obtenerCoordenadas,
} from '../../services/geocoding.service';

describe('geocoding.service.ts', () => {
    beforeEach(() => {
        limpiarCacheCoordenadas();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('normaliza localidades con sufijo "Capital" y alias de CABA para Nominatim', () => {
        expect(normalizarLocalidadParaGeocoding('Córdoba Capital')).toBe('Córdoba');
        expect(normalizarLocalidadParaGeocoding('Salta Capital')).toBe('Salta');
        expect(normalizarLocalidadParaGeocoding('Santa Fe Capital')).toBe('Santa Fe');
        expect(normalizarLocalidadParaGeocoding('Santiago del Estero Capital')).toBe(
            'Santiago del Estero'
        );
        expect(normalizarLocalidadParaGeocoding('CABA')).toBe('Buenos Aires');
        expect(normalizarLocalidadParaGeocoding('La Plata')).toBe('La Plata');
    });

    it('resuelve Córdoba Capital (CP 5000) enviando city=Córdoba a Nominatim', async () => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ lat: '-31.4166867', lon: '-64.1834193' }],
        });
        vi.stubGlobal('fetch', fetchSpy);

        const coords = await obtenerCoordenadas('5000', 'Córdoba Capital', 'Córdoba');

        expect(coords).toEqual({ lat: -31.4166867, lon: -64.1834193 });
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const urlLlamada = new URL(fetchSpy.mock.calls[0][0] as string);
        expect(urlLlamada.searchParams.get('city')).toBe('Córdoba');
        expect(urlLlamada.searchParams.get('state')).toBe('Córdoba');
        expect(urlLlamada.searchParams.get('countrycodes')).toBe('ar');
    });

    it('usa fallback a búsqueda libre (q) y luego a código postal cuando la consulta estructurada no devuelve resultados', async () => {
        const fetchSpy = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, json: async () => [] })
            .mockResolvedValueOnce({ ok: true, json: async () => [] })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [{ lat: '-31.4201', lon: '-64.1888' }],
            });
        vi.stubGlobal('fetch', fetchSpy);

        const coords = await obtenerCoordenadas('5000', 'Córdoba Capital', 'Córdoba');

        expect(coords).toEqual({ lat: -31.4201, lon: -64.1888 });
        expect(fetchSpy).toHaveBeenCalledTimes(3);

        const urlLibre = new URL(fetchSpy.mock.calls[1][0] as string);
        expect(urlLibre.searchParams.get('q')).toBe('Córdoba, Argentina');

        const urlCp = new URL(fetchSpy.mock.calls[2][0] as string);
        expect(urlCp.searchParams.get('postalcode')).toBe('5000');
        expect(urlCp.searchParams.get('state')).toBe('Córdoba');
    });

    it('almacena en caché las coordenadas resueltas evitando llamadas redundantes', async () => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ lat: '-31.4167', lon: '-64.1834' }],
        });
        vi.stubGlobal('fetch', fetchSpy);

        const primera = await obtenerCoordenadas('5000', 'Córdoba Capital', 'Córdoba');
        const segunda = await obtenerCoordenadas('5000', 'Córdoba Capital', 'Córdoba');

        expect(primera).toEqual({ lat: -31.4167, lon: -64.1834 });
        expect(segunda).toEqual({ lat: -31.4167, lon: -64.1834 });
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('retorna lista vacía de consultas y null cuando no hay datos geográficos', async () => {
        expect(construirConsultasNominatim('', '', '')).toHaveLength(0);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const coords = await obtenerCoordenadas('', '', '');
        expect(coords).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();
    });
});
