// T-K01 Bauhaus geometric variants — CSS-only grid-wipe/mask-reveal as base, choice open A/B/C/D
export const Bauhaus = 'Bauhaus geometric';
export const variants = {
  gridWipe: { initial: { clipPath: 'inset(0 100% 0 0)' }, animate: { clipPath: 'inset(0 0 0 0)' }, transition: { duration: 0.6, ease: 'easeOut' } },
  maskReveal: { initial: { maskPosition: '100% 0' }, animate: { maskPosition: '0 0' }, transition: { duration: 0.7 } },
  shapeMorph: { initial: { borderRadius: '0%', rotate: 0 }, animate: { borderRadius: '50%', rotate: 2 }, transition: { duration: 0.5 } },
  scrollDriven: { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } },
} as const;
export type VariantKey = keyof typeof variants;
export const MOTION_CHOICE = 'OPEN A/B/C/D TBD — base CSS-only grid-wipe/mask-reveal CLS-safe';
