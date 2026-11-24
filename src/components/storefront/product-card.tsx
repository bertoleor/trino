import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PriceBlock } from './price-block';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: {
    name: string;
    slug: string;
    imageUrl: string | null;
    priceCents: number;
    salePriceCents?: number | null;
  };
  priority?: boolean;
  locale?: string;
  className?: string;
}

export function ProductCard({
  product,
  priority = false,
  locale = 'es-AR',
  className,
}: ProductCardProps) {
  return (
    <Link
      href={`/${locale}/producto/${product.slug}`}
      className={cn(
        'border-ink bg-cream text-ink hover:shadow-pop flex flex-col border-2 p-4 transition-shadow',
        className
      )}
    >
      {product.imageUrl ? (
        <div className="border-ink bg-cream relative aspect-square w-full overflow-hidden border-2">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="border-ink bg-lilac aspect-square w-full border-2" aria-hidden="true" />
      )}
      <h3 className="font-display mt-4 text-lg font-semibold">{product.name}</h3>
      <PriceBlock
        priceCents={product.priceCents}
        salePriceCents={product.salePriceCents}
        locale={locale}
        className="mt-2"
      />
    </Link>
  );
}
