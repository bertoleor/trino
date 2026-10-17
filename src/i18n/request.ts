import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const auth = (await import(`../../messages/${locale}/auth.json`)).default;
  const checkout = (await import(`../../messages/${locale}/checkout.json`)).default;
  const admin = (await import(`../../messages/${locale}/admin.json`)).default;
  const errors = (await import(`../../messages/${locale}/errors.json`)).default;
  const emails = (await import(`../../messages/${locale}/emails.json`)).default;
  const home = (await import(`../../messages/${locale}/home.json`)).default;
  return {
    locale,
    messages: { common, auth, checkout, admin, errors, emails, home },
  };
});
