import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
  const admin = (await import(`../../messages/${locale}/admin.json`)).default;
  const auth = (await import(`../../messages/${locale}/auth.json`)).default;
  const brands = (await import(`../../messages/${locale}/brands.json`)).default;
  const cart = (await import(`../../messages/${locale}/cart.json`)).default;
  const checkout = (await import(`../../messages/${locale}/checkout.json`)).default;
  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const emails = (await import(`../../messages/${locale}/emails.json`)).default;
  const errors = (await import(`../../messages/${locale}/errors.json`)).default;
  const home = (await import(`../../messages/${locale}/home.json`)).default;
  const product = (await import(`../../messages/${locale}/product.json`)).default;
  const search = (await import(`../../messages/${locale}/search.json`)).default;
  const storefront = (await import(`../../messages/${locale}/storefront.json`)).default;
  return {
    locale,
    messages: {
      admin,
      auth,
      brands,
      cart,
      checkout,
      common,
      emails,
      errors,
      home,
      product,
      search,
      storefront,
    },
  };
});
