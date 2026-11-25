import '../src/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import type { Preview } from '@storybook/nextjs-vite';
import adminMessages from '../messages/es-AR/admin.json';
import authMessages from '../messages/es-AR/auth.json';
import brandsMessages from '../messages/es-AR/brands.json';
import cartMessages from '../messages/es-AR/cart.json';
import checkoutMessages from '../messages/es-AR/checkout.json';
import commonMessages from '../messages/es-AR/common.json';
import consentMessages from '../messages/es-AR/consent.json';
import emailsMessages from '../messages/es-AR/emails.json';
import errorMessages from '../messages/es-AR/errors.json';
import homeMessages from '../messages/es-AR/home.json';
import legalMessages from '../messages/es-AR/legal.json';
import productMessages from '../messages/es-AR/product.json';
import searchMessages from '../messages/es-AR/search.json';
import storefrontMessages from '../messages/es-AR/storefront.json';

const messages = {
  admin: adminMessages,
  auth: authMessages,
  brands: brandsMessages,
  cart: cartMessages,
  checkout: checkoutMessages,
  common: commonMessages,
  consent: consentMessages,
  emails: emailsMessages,
  errors: errorMessages,
  home: homeMessages,
  legal: legalMessages,
  product: productMessages,
  search: searchMessages,
  storefront: storefrontMessages,
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'cream',
      values: [
        { name: 'cream', value: '#fff8e8' },
        { name: 'ink', value: '#17141b' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es-AR" messages={messages}>
        <div style={{ padding: '2rem', backgroundColor: '#fff8e8', minHeight: '100vh' }}>
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
