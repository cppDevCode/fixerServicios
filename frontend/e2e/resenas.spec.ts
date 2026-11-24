import { test, expect } from '@playwright/test';

test.describe('Módulo de Reseñas - E2E', () => {
    test('permite publicar una reseña y visualizarla en el perfil del prestador', async ({
        page,
        request,
    }) => {
        const comentario = `Excelente servicio - E2E ${Date.now()}`;
        let resenaId: number | undefined;

        try {
            // Iniciar sesión como usuario final
            await page.addInitScript(() => {
                localStorage.setItem('omitir_admin_default', 'true');
            });

            await page.goto('/login');

            await page.locator('input[type="email"]')
                .fill('berta@example.com');

            await page.locator('input[type="password"]')
                .fill('123456');

            await page.getByRole('button', {
                name: /Ingresar/i,
            }).click();

            await expect(page).toHaveURL(/\/$/);

            // Navegar al catálogo de profesionales
            await page.getByRole('navigation', {
                name: 'Navegación principal',
            }).getByRole('link', {
                name: 'Explorar servicios',
                exact: true,
            }).click();

            await expect(page).toHaveURL(/\/prestadores\/catalogo$/);

            // Buscar al prestador
            await page.locator('#catalogo-busqueda-input')
                .fill('Carlos Gómez');

            const tarjetaPrestador = page
                .getByTestId('tarjeta-catalogo-prestador')
                .filter({ hasText: 'Carlos Gómez' });

            await expect(tarjetaPrestador).toBeVisible();

            await tarjetaPrestador.getByRole('button', {
                name: /Ver Perfil/i,
            }).click();

            await expect(page).toHaveURL(/\/prestadores\/1$/);

            // Completar el formulario de reseña
            const formulario = page.locator('.formulario-resena');

            await expect(formulario.getByRole('heading', {
                name: 'Dejá tu reseña',
            })).toBeVisible();

            const estrella = formulario.getByRole('button', {
                name: '5 estrellas',
                exact: true,
            });

            await estrella.click();

            await expect(estrella)
                .toHaveAttribute('aria-pressed', 'true');

            await formulario.getByLabel('Tu comentario')
                .fill(comentario);

            // Publicar la reseña mediante el backend real
            const respuestaPendiente = page.waitForResponse(
                (respuesta) =>
                    new URL(respuesta.url()).pathname === '/api/v1/resenas' &&
                    respuesta.request().method() === 'POST'
            );

            await formulario.getByRole('button', {
                name: 'Publicar reseña',
            }).click();

            const respuesta = await respuestaPendiente;
            const body = await respuesta.json();

            resenaId = body.datos?.id;

            expect(respuesta.status()).toBe(201);
            expect(typeof resenaId).toBe('number');

            await expect(formulario.getByText(
                '¡Tu reseña se publicó correctamente!'
            )).toBeVisible();

            // Verificar la reseña publicada en el listado
            const listado = page.getByRole('region', {
                name: 'Reseñas del profesional',
                exact: true,
            });

            const tarjetaResena = listado
                .getByRole('article')
                .filter({ hasText: comentario });

            await expect(tarjetaResena).toBeVisible();

            await expect(tarjetaResena.getByRole('img', {
                name: '5 de 5 estrellas',
            })).toBeVisible();

            await expect(tarjetaResena.getByText('Usuario #3', {
                exact: true,
            })).toBeVisible();

            // Verificar la persistencia después de recargar
            await page.reload();

            await expect(tarjetaResena).toBeVisible();

        } finally {
            // Eliminar los datos generados durante la prueba
            if (resenaId !== undefined) {
                const eliminacion = await request.delete(
                    `http://localhost:3000/api/v1/resenas/${resenaId}`
                );

                expect(eliminacion.status()).toBe(200);
            }
        }
    });
});