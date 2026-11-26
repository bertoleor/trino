import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PriceBlock } from '@/components/storefront/price-block';
import type { PricedProduct } from '@/components/storefront/storefront-product';
import { cn } from '@/lib/utils';
import { priceInCents } from '@/components/storefront/storefront-product';

export interface CatalogProductCardProps {
  locale: string;
  product: PricedProduct & {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    sale_price_cents: number | null;
    brand: string | null;
    category: string | null;
    subcategory: string | null;
  };
  badge: string;
  viewLabel: string;
  priority?: boolean;
  compact?: boolean;
}

export function CatalogProductCard({
  locale,
  product,
  badge,
  viewLabel,
  priority = false,
  compact = false,
}: CatalogProductCardProps) {
  const eyebrow = [product.brand, product.category, product.subcategory]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/${locale}/producto/${product.slug}`}
      className={cn(
        'border-ink bg-cream text-ink shadow-pop group flex h-full flex-col border-[3px] transition-transform hover:-translate-y-1'
      )}
    >
      <div className="border-ink bg-lemon flex items-center justify-between border-b-[3px] px-3 py-2">
        <span className="font-label text-ink text-[10px] font-bold uppercase">{badge}</span>
        <ArrowRight aria-hidden="true" className="text-ink h-4 w-4" />
      </div>
      {product.image_url ? (
        <div className="border-ink bg-cream relative aspect-square w-full overflow-hidden border-b-[3px]">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="border-ink bg-lilac aspect-square w-full border-b-[3px]"
          aria-hidden="true"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {eyebrow ? (
          <p className="font-label text-cobalt text-[10px] font-bold uppercase">{eyebrow}</p>
        ) : null}
        <h3 className="font-display text-lg font-semibold">{product.name}</h3>
        {!compact && product.description ? (
          <p className="font-body text-ink line-clamp-1 text-sm">{product.description}</p>
        ) : null}
        <div className="border-ink mt-auto flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed pt-3">
          <PriceBlock
            priceCents={priceInCents(product)}
            salePriceCents={product.sale_price_cents}
            locale={locale}
          />
          <span className="font-label border-ink bg-cream text-ink text-[10px] font-bold uppercase">
            {viewLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
