"use client";
import { type VariantKey, variants } from '@/lib/motion/variants';
import React from 'react';

type Props = { variant?: VariantKey; children: React.ReactNode; className?: string };

export function Motion({ variant = 'gridWipe', children, className }: Props) {
  const v = variants[variant];
  return (
    <div data-variant={variant} style={v as unknown as React.CSSProperties} className={className ?? variant}>
      {children}
      <span className="hidden">Bauhaus geometric motion CLS&lt;0.1 reduced-motion</span>
    </div>
  );
}

export default Motion;
