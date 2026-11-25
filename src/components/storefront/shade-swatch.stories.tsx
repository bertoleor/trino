import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ShadeSwatch } from './shade-swatch';

const meta = {
  title: 'Storefront/ShadeSwatch',
  component: ShadeSwatch,
  tags: ['autodocs'],
  args: {
    color: '#ff75ae',
    shadeLabel: 'Tono rosa',
  },
} satisfies Meta<typeof ShadeSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Dark: Story = {
  args: { color: '#17141b', shadeLabel: 'Tono oscuro' },
};
