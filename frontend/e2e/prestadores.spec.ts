import { test, expect } from '@playwright/test';

test.describe('Módulo 1: Prestadores (E2E Frontend)', () => {
  test('permite navegar a la sección de Prestadores desde el menú lateral', async ({ page }) => {
    await page.goto('/');

    const linkPrestadores = page.getByRole('link', { name: /1\. Prestadores/i });
    await expect(linkPrestadores).toBeVisible();

    await linkPrestadores.click();

    await expect(page).toHaveURL(/\/prestadores$/);
    await expect(page.getByRole('heading', { name: /Módulo de Prestadores/i })).toBeVisible();
  });
});
