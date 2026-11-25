'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CartDrawerPanel } from '@/components/storefront/cart-drawer-panels';
import type { CartView } from '@/lib/db/cart-view';
import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CartDrawer({ locale, view }: { locale: string; view: CartView }) {
  const t = useTranslations('cart.drawer');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const count = view.items.reduce((sum, item) => sum + item.quantity, 0);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t('open')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="border-ink bg-aqua text-ink shadow-pop-sm relative inline-flex min-h-11 items-center justify-center border-2 px-3"
      >
        <ShoppingBag aria-hidden="true" className="h-5 w-5" />
        <span className="border-ink bg-lemon text-ink absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center border-2 px-1 text-[10px] font-bold">
          {count}
        </span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            tabIndex={-1}
            aria-label={t('close')}
            onClick={close}
            className="bg-ink/70 absolute inset-0"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="border-ink bg-cream relative flex h-full w-full max-w-[500px] flex-col border-l-4"
          >
            <CartDrawerPanel locale={locale} view={view} onClose={close} closeRef={closeRef} />
          </div>
        </div>
      ) : null}
    </>
  );
}
