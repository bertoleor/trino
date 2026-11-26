import { expect, test } from '@playwright/test';

const LOCALES = ['es-AR', 'en', 'fr', 'pt-BR'] as const;
const LINKS = [
  'https://www.instagram.com/trinopunto/',
  'https://www.tiktok.com/@puntotrino',
  'https://wa.link/lf1o1e',
  'https://chat.whatsapp.com/B73GiMAFrdwEbSU7vhwfqS',
  'https://www.facebook.com/trinopunto',
];

for (const locale of LOCALES) {
  test(`bio link renders the five source cards in ${locale}`, async ({ page }) => {
    const response = await page.goto(`/${locale}/bio`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const href of LINKS) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    await expect(page.locator('a[href^="https://wa.me/"]')).toHaveCount(0);
    await expect(page.locator('a[href="https://chat.whatsapp.com"]')).toHaveCount(0);
  });
}

test('bio link keeps the share action and adapts to mobile', async ({ page }) => {
  await page.goto('/es-AR/bio');
  await expect(page.getByRole('button', { name: /compartir/i })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator(`a[href="${LINKS[0]}"]`)).toBeVisible();
});
