import { expect, test } from '@playwright/test';

test.describe('HQ staff login', () => {
  test('unauthenticated admin visits reach the dedicated HQ screen', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/staff\/login/);
    await expect(page.getByRole('heading', { name: 'Ingresar al HQ.' })).toBeVisible();
    await expect(page.locator('input[name="redirect"]')).toHaveValue('/admin');
    await expect(page.getByRole('link', { name: '¿Olvidaste tu clave?' })).toHaveAttribute(
      'href',
      '/es-AR/recuperar-contrasea'
    );
    await expect(page.getByRole('link', { name: 'Ir al acceso de clientas' })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  test('password visibility toggle is a real control', async ({ page }) => {
    await page.goto('/staff/login?redirect=/admin');

    const password = page.locator('#staff-password');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });
});
