import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProductCard } from './product-card';

const meta = {
  title: 'Storefront/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: {
    locale: 'es-AR',
    product: {
      name: 'Sérum vitamina C',
      slug: 'serum-vitamina-c',
      imageUrl: null,
      priceCents: 1899900,
    },
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnSale: Story = {
  args: {
    product: {
      name: 'Lip oil gloss',
      slug: 'lip-oil-gloss',
      imageUrl: null,
      priceCents: 1299900,
      salePriceCents: 999900,
    },
  },
};
