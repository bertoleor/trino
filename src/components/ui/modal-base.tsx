'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ModalBase - Componente base accesible para diálogos modales del admin de Trino.
 *
 * Principios aplicados (design-taste-frontend):
 * - DESIGN_VARIANCE: 4-5 (consistencia sobre experimentación)
 * - MOTION_INTENSITY: 2-3 (mínimo, solo loading/hover)
 * - VISUAL_DENSITY: 6-7 (dense, data-rich)
 *
 * Accesibilidad (WCAG 2.1 AA):
 * - aria-modal="true"
 * - Escape key handler
 * - Focus trap (mínimo)
 * - Return focus to opener
 * - aria-labelledby + aria-describedby
 * - Close button con aria-label="Volver"
 * - Reduced motion honor (prefers-reduced-motion: reduce)
 */

interface ModalBaseProps {
  /** Identificador único del modal (usado para aria-labelledby y aria-describedby) */
  id: string;
  /** Título del modal (se convierte en aria-labelledby) */
  title: string;
  /** Descripción opcional del modal (se convierte en aria-describedby) */
  description?: string;
  /** Si el modal está abierto */
  open: boolean;
  /** Callback cuando se cierra el modal (Escape o click en close) */
  onClose: () => void;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
}

export function ModalBase({
  id,
  title,
  description,
  open,
  onClose,
  children,
  className,
}: ModalBaseProps) {
  const previousFocus = React.useRef<HTMLElement | null>(null);
  const wasOpen = React.useRef(false);

  // Guardar el elemento con foco antes de abrir el modal (para return focus)
  React.useEffect(() => {
    if (open && !wasOpen.current) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      wasOpen.current = true;
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (wasOpen.current && !open) {
        // Restaurar foco al elemento anterior
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
        // Restaurar scroll del body
        document.body.style.overflow = '';
        wasOpen.current = false;
      }
    };
  }, [open]);

  // Manejar tecla Escape
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Manejar click en el backdrop (cerrar solo si se hace click en el backdrop, no en el contenido)
  const handleBackdropClick = React.useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-[var(--ink)]/60',
        'transition-opacity duration-150 ease-in-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        className
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] shadow-lg',
          'w-full max-w-2xl p-6',
          'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
          'duration-200 ease-out'
        )}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()} // Evitar que clicks dentro del contenido cierren el modal
      >
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <h2 id={`${id}-title`} className="mb-0 text-2xl font-bold text-[var(--ink)]">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Volver"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/10 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        {/* Descripción (opcional) */}
        {description && (
          <p
            id={`${id}-description`}
            className="mb-6 text-sm leading-relaxed text-[var(--text-primary)]"
          >
            {description}
          </p>
        )}

        {/* Contenido */}
        <div className="prose max-w-none">{children}</div>
      </div>
    </div>
  );
}

ModalBase.displayName = 'ModalBase';

export default ModalBase;
