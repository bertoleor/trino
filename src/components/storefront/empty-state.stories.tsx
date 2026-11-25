import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmptyState } from './empty-state';
import { Search } from 'lucide-react';

const meta = {
  title: 'Storefront/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No encontramos ese drop',
    description: 'Probá con otra búsqueda o explorá el catálogo.',
    icon: <Search aria-hidden="true" className="text-cobalt h-8 w-8" />,
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutIcon: Story = {
  args: { icon: undefined },
};
