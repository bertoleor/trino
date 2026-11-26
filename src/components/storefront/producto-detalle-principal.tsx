import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { StorefrontProductDetail } from '@/components/storefront/storefront-product';
import { productoDetalleCopy } from './producto-detalle-copy';

const GALLERY_TONES = ['bg-cream', 'bg-pink', 'bg-aqua', 'bg-lemon'];

export function ProductoDetalleBreadcrumb({ locale, name }: { locale: string; name: string }) {
  const copy = productoDetalleCopy(locale).breadcrumb;

  return (
    <nav
      data-purpose="product-breadcrumb"
      aria-label={copy.label}
      className="font-body col-span-full text-sm"
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={`/${locale}`}>{copy.home}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/${locale}/tienda`}>{copy.shop}</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{name}</li>
      </ol>
    </nav>
  );
}

export function ProductoDetalleBanner({ locale }: { locale: string }) {
  const copy = productoDetalleCopy(locale).banner;

  return (
    <section
      data-purpose="product-banner"
      className="border-ink bg-lemon rounded-card col-span-full border-y-[3px] px-4 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="font-label text-ink text-xs font-bold tracking-wider uppercase">
          {copy.label}
        </p>
        <p className="font-body text-sm">{copy.body}</p>
      </div>
    </section>
  );
}

export function ProductoDetalleGallery({
  locale,
  product,
}: {
  locale: string;
  product: StorefrontProductDetail;
}) {
  const copy = productoDetalleCopy(locale).gallery;

  return (
    <div data-purpose="product-gallery" className="lg:sticky lg:top-28">
      <div className="border-ink bg-cream shadow-pop-lg rounded-card relative aspect-square w-full overflow-hidden border-[3px]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${copy.badge}: ${product.name}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <Sparkles aria-hidden="true" />
            <p className="font-display text-xl font-semibold">{copy.emptyTitle}</p>
            <p className="font-body text-sm">{copy.emptyBody}</p>
          </div>
        )}
        <span className="font-label border-ink bg-ink text-cream rounded-control absolute bottom-3 left-3 border-2 px-3 py-1 text-[10px] font-bold uppercase">
          {copy.detailBadge}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {GALLERY_TONES.map((tone) => (
          <span
            key={tone}
            aria-hidden="true"
            className={`border-ink shadow-pop-sm rounded-card aspect-square border-[3px] ${tone}`}
          />
        ))}
      </div>
    </div>
  );
}
