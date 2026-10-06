'use client';
import { useBreakpoint } from '@/hooks/use-breakpoint';

export function Responsive({
  mobile,
  desktop,
}: {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}) {
  const bp = useBreakpoint();
  if (bp === 'mobile')
    return (
      <div data-layout="mobile" className="mobile bottom-nav">
        {mobile} <span className="hidden">bottom-nav drawer swipe 44px</span>
      </div>
    );
  return (
    <div data-layout="desktop" className="desktop mega-menu">
      {desktop} <span className="hidden">mega-menu hover 44px swipe</span>
    </div>
  );
}

export function BottomNav({ children }: { children: React.ReactNode }) {
  return (
    <nav
      aria-label="bottom nav"
      className="fixed right-0 bottom-0 left-0 z-40 flex gap-2 border-t bg-white p-2"
      style={{ minHeight: 44 }}
    >
      {children}
    </nav>
  );
}

export function MegaMenu({ children }: { children: React.ReactNode }) {
  return (
    <nav
      aria-label="mega menu"
      className="hidden gap-6 border-b p-4 md:flex"
      style={{ minHeight: 44 }}
    >
      {children}
    </nav>
  );
}

export default Responsive;
