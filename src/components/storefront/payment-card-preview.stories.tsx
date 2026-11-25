import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PaymentCardPreview } from './payment-card-preview';

const meta = {
  title: 'Storefront/PaymentCardPreview',
  component: PaymentCardPreview,
  tags: ['autodocs'],
} satisfies Meta<typeof PaymentCardPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
