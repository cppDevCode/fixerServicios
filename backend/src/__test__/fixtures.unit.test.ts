import { describe, it, expect } from 'vitest';
import { crearResena, resenasFixture } from './fixtures/resenas.fixtures';

describe('fixtures de reseñas', () => {
    it('crearResena permite sobrescribir campos', () => {
        expect(crearResena({ calificacion: 2 }).calificacion).toBe(2);
    });

    it('todas las calificaciones del fixture están entre 1 y 5', () => {
        resenasFixture.forEach((r) => {
        expect(r.calificacion).toBeGreaterThanOrEqual(1);
        expect(r.calificacion).toBeLessThanOrEqual(5);
        });
    });
});