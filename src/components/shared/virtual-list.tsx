'use client';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// WebP priority loading="lazy" — 44px touch hint

type Props<T> = {
  items: T[];
  estimateSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  threshold?: number;
};

export function VirtualList<T>({ items, estimateSize = 280, renderItem, threshold = 50 }: Props<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = items.length > threshold;

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
    enabled: useVirtual,
  });

  if (!useVirtual) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="min-h-[44px]">
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[80vh] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
        {virtualizer.getVirtualItems().map((v) => (
          <div
            key={v.key}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${v.start}px)` }}
            className="min-h-[44px] touch-manipulation"
          >
            {renderItem(items[v.index] as T, v.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
