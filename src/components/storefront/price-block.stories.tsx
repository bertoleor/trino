import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PriceBlock } from './price-block';

const meta = {
  title: 'Storefront/PriceBlock',
  component: PriceBlock,
  tags: ['autodocs'],
  args: {
    locale: 'es-AR',
    priceCents: 1899900,
  },
} satisfies Meta<typeof PriceBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnSale: Story = {
  args: { priceCents: 1899900, salePriceCents: 1499900 },
};

export const OtherLocale: Story = {
  args: { locale: 'en', priceCents: 1899900 },
};
