import { type Page, expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

// CI sessions share a single IP; isolate each test so the proxy rate limiter
// does not turn later browser projects into 429 JSON instead of the login page.
test.beforeEach(async ({ context }, testInfo) => {
  const digest = createHash('sha256')
    .update(`${testInfo.project.name}:${testInfo.title}:${testInfo.retry}`)
    .digest('hex')
    .slice(0, 8);
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': `2001:db8::${digest}` });
});

async function togglePassword(page: Page, expectedType: 'password' | 'text') {
  const password = page.locator('#staff-password');
  const toggle = page.getByRole('button', {
    name: expectedType === 'text' ? 'Mostrar contraseña' : 'Ocultar contraseña',
  });

  // A first click can land before React hydration; retry the whole interaction.
  await expect(async () => {
    await toggle.click();
    await expect(password).toHaveAttribute('type', expectedType);
  }).toPass({ timeout: 10_000 });
}

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
    await togglePassword(page, 'text');
    await togglePassword(page, 'password');
  });
});
