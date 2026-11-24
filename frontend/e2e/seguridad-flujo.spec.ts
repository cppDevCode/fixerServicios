
import { test, expect } from '@playwright/test';

test.describe('Flujo de Seguridad - Login y Logout', () => {
  test('El usuario puede loguearse y luego cerrar sesión', async ({ page }) => {

    // Registrar errores de conexión
    page.on('requestfailed', request => {
      console.log('PETICIÓN FALLIDA:', request.url());
      console.log('MOTIVO:', request.failure()?.errorText);
    });

    // Registrar respuestas del backend
    page.on('response', async response => {
      if (response.url().includes('/auth/login')) {
        console.log('STATUS LOGIN:', response.status());

        try {
          console.log('BODY LOGIN:', await response.text());
        } catch (error) {
          console.log('ERROR AL LEER RESPUESTA:', error);
        }
      }
    });

    // 1. Ir al login
    await page.goto('/login');

    // 2. Completar credenciales
    await page.locator('input[type="email"]').fill('carlos@example.com');
    await page.locator('input[type="password"]').fill('123456');

    // 3. Hacer clic en Ingresar
    await page.locator('button[type="submit"]').click();

    // 4. Esperar el resultado
    await page.waitForTimeout(5000);

    console.log('URL FINAL:', page.url());

    // 5. Verificar redirección
    await expect(page).toHaveURL(/\/prestadores/);

    // 6. Verificar usuario
    await expect(page.locator('header.fixer-header')).toContainText('Carlos');

    // 7. Cerrar sesión
    await page.locator('button:has-text("Cerrar Sesión")').click();

    // 8. Verificar regreso al login
    await expect(page).toHaveURL(/\/login/);
  });
});
