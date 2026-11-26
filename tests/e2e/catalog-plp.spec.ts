import { expect, test } from '@playwright/test';

test('desktop catalog renders Neo-Pop controls and mutation-free product links', async ({
  page,
}) => {
  await page.goto('/es-AR/tienda');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /ordenar productos/i })).toBeVisible();
  await expect(page.getByRole('complementary', { name: /filtros/i })).toBeVisible();

  const cards = page.locator('main a[href^="/es-AR/producto/"]');
  const empty = page.locator('main').getByText(/no hay productos con esos filtros/i);
  if (await empty.isVisible()) {
    expect(await cards.count()).toBe(0);
  } else {
    expect(await cards.count()).toBeGreaterThan(0);
  }

  const copy = await page.locator('main').innerText();
  expect(copy).not.toMatch(/refill|recarga|cuotas|env[ií]o gratis|stock|vegan|cruelty/i);
});
