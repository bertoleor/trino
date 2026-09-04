"use client";
import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop',
  );
  useEffect(() => {
    function onResize() {
      setBp(getBreakpoint(window.innerWidth));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bp;
}

export function isMobile(width: number): boolean {
  return getBreakpoint(width) === 'mobile';
}
