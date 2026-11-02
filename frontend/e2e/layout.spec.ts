import { test, expect } from '@playwright/test';

test('El layout base debe cargar', async ({ page }) => {
  await page.goto('/');
  
  await expect(page).toHaveTitle(/Vite|Fixer/i); 
});