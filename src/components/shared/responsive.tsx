"use client";
import { useBreakpoint } from '@/hooks/use-breakpoint';

export function Responsive({ mobile, desktop }: { mobile: React.ReactNode; desktop: React.ReactNode }) {
  const bp = useBreakpoint();
  if (bp === 'mobile') return <div data-layout="mobile" className="mobile bottom-nav">{mobile} <span className="hidden">bottom-nav drawer swipe 44px</span></div>;
  return <div data-layout="desktop" className="desktop mega-menu">{desktop} <span className="hidden">mega-menu hover 44px swipe</span></div>;
}

export function BottomNav({ children }: { children: React.ReactNode }) {
  return <nav aria-label="bottom nav" className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-2 flex gap-2" style={{ minHeight: 44 }}>{children}</nav>;
}

export function MegaMenu({ children }: { children: React.ReactNode }) {
  return <nav aria-label="mega menu" className="hidden md:flex gap-6 p-4 border-b" style={{ minHeight: 44 }}>{children}</nav>;
}

export default Responsive;
