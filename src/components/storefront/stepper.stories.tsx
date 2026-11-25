import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { Stepper } from './stepper';
import { useState } from 'react';

function StepperDemo({ value: initialValue, ...props }: ComponentProps<typeof Stepper>) {
  const [value, setValue] = useState(initialValue);
  return <Stepper {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Storefront/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: {
    value: 2,
    min: 1,
    max: 5,
    decrementLabel: 'Quitar una unidad',
    incrementLabel: 'Agregar una unidad',
    onChange: () => undefined,
  },
  render: (args) => <StepperDemo {...args} />,
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AtMinimum: Story = {
  args: { value: 1 },
};

export const AtMaximum: Story = {
  args: { value: 5 },
};
