import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
  const admin = (await import(`../../messages/${locale}/admin.json`)).default;
  const ajustes = (await import(`../../messages/${locale}/ajustes.json`)).default;
  const auth = (await import(`../../messages/${locale}/auth.json`)).default;
  const authScreens = (await import(`../../messages/${locale}/auth-screens.json`)).default;
  const bio = (await import(`../../messages/${locale}/bio.json`)).default;
  const brands = (await import(`../../messages/${locale}/brands.json`)).default;
  const cart = (await import(`../../messages/${locale}/cart.json`)).default;
  const checkout = (await import(`../../messages/${locale}/checkout.json`)).default;
  const checkoutExtra = (await import(`../../messages/${locale}/checkout-extra.json`)).default;
  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const cuenta = (await import(`../../messages/${locale}/cuenta.json`)).default;
  const emails = (await import(`../../messages/${locale}/emails.json`)).default;
  const errors = (await import(`../../messages/${locale}/errors.json`)).default;
  const home = (await import(`../../messages/${locale}/home.json`)).default;
  const institucional = (await import(`../../messages/${locale}/institucional.json`)).default;
  const product = (await import(`../../messages/${locale}/product.json`)).default;
  const search = (await import(`../../messages/${locale}/search.json`)).default;
  const storefront = (await import(`../../messages/${locale}/storefront.json`)).default;
  const storefrontExtra = (await import(`../../messages/${locale}/storefront-extra.json`)).default;
  const testTono = (await import(`../../messages/${locale}/test-tono.json`)).default;
  const transferencia = (await import(`../../messages/${locale}/transferencia.json`)).default;
  return {
    locale,
    messages: {
      admin,
      ajustes,
      auth,
      authScreens,
      bio,
      brands,
      cart,
      checkout,
      checkoutExtra,
      common,
      cuenta,
      emails,
      errors,
      home,
      institucional,
      product,
      search,
      storefront,
      storefrontExtra,
      testTono,
      transferencia,
    },
  };
});
