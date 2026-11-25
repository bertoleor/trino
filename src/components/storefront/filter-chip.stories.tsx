import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FilterChip } from './filter-chip';

const meta = {
  title: 'Storefront/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  args: {
    label: 'Labios',
    count: 12,
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const WithoutCount: Story = {
  args: { count: undefined },
};
