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

  // The marquee must not stretch the implicit grid column past the viewport.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const width = window.innerWidth;
        return [...document.querySelectorAll('[data-shell-type="mobile_blank"] a[href^="http"]')]
          .map((el) => el.getBoundingClientRect())
          .filter((rect) => rect.width > width || rect.right > width + 1 || rect.left < -1).length;
      })
    )
    .toBe(0);
  const shareBox = await page.getByRole('button', { name: /compartir/i }).boundingBox();
  expect(shareBox?.x).toBeLessThan(390);
});

test('bio link keeps the brand lockup, ticker ribbon and footer anchored', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es-AR/bio');

  const audit = await page.evaluate(() => {
    const hero = document.querySelector('[data-purpose="hero-identity"]');
    const spans = hero ? [...hero.querySelectorAll('span')] : [];
    const brand = spans.find((s) => s.textContent?.trim().startsWith('trino'));
    const beauty = spans.find((s) => s.textContent?.trim() === 'beauty');
    const ticker = document.querySelector('[data-purpose="ticker-announcement"]');
    const footer = document.querySelector('[data-purpose="footer-credits"]');
    const bg = (el: Element | null | undefined) => (el ? getComputedStyle(el).backgroundColor : '');
    return {
      beautyInsideBrandCard: !!brand && !!beauty && brand.parentElement === beauty.parentElement,
      brandCardBackground: bg(beauty?.parentElement),
      tickerShadow: ticker ? getComputedStyle(ticker).boxShadow : '',
      tickerBackground: bg(ticker),
      footerBackground: bg(footer),
    };
  });

  expect(audit.beautyInsideBrandCard).toBe(true);
  expect(audit.brandCardBackground).toBe('rgb(255, 248, 232)');
  expect(audit.tickerShadow).not.toContain('rgb(23, 20, 27)');
  expect(audit.tickerBackground).toBe('rgb(23, 20, 27)');
  expect(audit.footerBackground).toBe('rgb(255, 248, 232)');
});

test('bio link keeps the desktop Stitch 7/5 grid without editorial assets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/es-AR/bio');
  expect(response?.status()).toBe(200);

  await expect(page.locator('[data-purpose="hero-identity"]')).toBeVisible();
  await expect(page.locator('[data-purpose="ticker-announcement"]')).toBeVisible();

  const channels = page.locator('[data-purpose="official-channels-list"]');
  const info = page.locator('[data-purpose="editorial-and-info"]');
  await expect(channels).toBeVisible();
  await expect(info).toBeVisible();

  const channelsBox = await channels.boundingBox();
  const infoBox = await info.boundingBox();
  if (!channelsBox || !infoBox) throw new Error('desktop columns are not rendered');
  expect(channelsBox.x).toBeLessThan(infoBox.x);
  expect(channelsBox.width).toBeGreaterThan(infoBox.width);
  expect(Math.abs(channelsBox.y - infoBox.y)).toBeLessThan(4);

  await expect(page.locator('img[src*="aida-public"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /compartir/i })).toBeVisible();

  const overflow = await page.evaluate(() => {
    const width = window.innerWidth;
    return [
      ...document.querySelectorAll('[data-shell-type="mobile_blank"] a[href^="http"]'),
    ].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.right > width + 1 || rect.left < -1;
    }).length;
  });
  expect(overflow).toBe(0);
});
