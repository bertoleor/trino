import { ChevronDown, MessageCircle } from 'lucide-react';
import { productoDetalleCopy } from './producto-detalle-copy';

export function ProductoDetalleDetails({ locale }: { locale: string }) {
  const copy = productoDetalleCopy(locale).details;

  return (
    <section data-purpose="product-details" className="col-span-full px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{copy.title}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.items.map((item) => (
            <details
              key={item.title}
              className="border-ink bg-cream shadow-pop-sm rounded-card border-[3px] p-5"
            >
              <summary className="font-display flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold">
                {item.title}
                <ChevronDown aria-hidden="true" />
              </summary>
              <p className="font-body mt-4 text-sm">{item.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductoDetalleCommunity({ locale }: { locale: string }) {
  const copy = productoDetalleCopy(locale).community;

  return (
    <section
      data-purpose="product-community"
      className="border-ink bg-lilac col-span-full border-y-[3px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="font-label text-cobalt text-xs font-bold tracking-wider uppercase">
            {copy.eyebrow}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{copy.title}</h2>
          <p className="font-body mt-4 max-w-2xl">{copy.body}</p>
        </div>
        <div className="border-ink bg-cream shadow-pop rounded-card flex flex-col items-center gap-3 border-[3px] p-8 text-center lg:col-span-5">
          <MessageCircle aria-hidden="true" />
          <p className="font-display text-lg font-semibold">{copy.emptyTitle}</p>
        </div>
      </div>
    </section>
  );
}
