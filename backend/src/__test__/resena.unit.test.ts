import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResenaService } from '../service/resena.service';
import { ResenaRepository } from '../repository/resena.repository';
import { crearResena, resenasFixture } from './fixtures/resenas.fixtures';

describe('ResenaService - Tests unitarios', () => {
    let service: ResenaService;
    let repository: ResenaRepository;

    beforeEach(() => {
        repository = new ResenaRepository();
        service = new ResenaService(repository);
    });

    describe('calcularPromedio', () => {
        it('devuelve 0 cuando no hay reseñas', () => {
            expect(service.calcularPromedio([])).toBe(0);
        });

        it('devuelve la calificación cuando existe una sola reseña', () => {
            const resenas = [
                crearResena({ calificacion: 4 }),
            ];

            expect(service.calcularPromedio(resenas)).toBe(4);
        });

        it.each([
            [[5, 4, 3], 4],
            [[5, 5, 5, 1], 4],
            [[5, 4, 4], 4.3],
            [[4, 3, 3], 3.3],
            [[5, 5, 4], 4.7],
            [[1, 1], 1],
            [[5, 5], 5],
        ])(
            'calcula el promedio de %j y devuelve %s',
            (calificaciones, esperado) => {
                const resenas = calificaciones.map(
                    (calificacion, index) =>
                        crearResena({
                            id: index + 1,
                            calificacion,
                        })
                );

                expect(service.calcularPromedio(resenas)).toBe(esperado);
            }
        );
    });

    describe('obtenerRating', () => {
        beforeEach(() => {
            vi.spyOn(repository, 'findAll')
                .mockReturnValue(resenasFixture);
        });

        it('calcula el promedio únicamente de las reseñas del prestador', () => {
            expect(service.obtenerRating(1)).toBe(4.5);
        });

        it('devuelve el rating de otro prestador sin mezclar calificaciones', () => {
            expect(service.obtenerRating(2)).toBe(3);
        });

        it('devuelve 0 cuando el prestador no tiene reseñas', () => {
            expect(service.obtenerRating(999)).toBe(0);
        });
    });
});