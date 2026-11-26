'use client';

export const POINTS_REASONS = [
  { value: 'delay', label: 'Retraso en envío' },
  { value: 'bday', label: 'Cumpleaños de socia' },
  { value: 'social', label: 'Evento social' },
  { value: 'early', label: 'Compra anticipada' },
  { value: 'audit', label: 'Auditoría interna' },
] as const;

interface QuickPointsProps {
  points: number;
  onSelect: (points: number) => void;
}

export function QuickPoints({ points, onSelect }: QuickPointsProps) {
  return (
    <div className="flex gap-2">
      {[500, 1000, 2500, 5000].map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => onSelect(val)}
          className={`flex-1 rounded-none border-2 border-[var(--ink)] py-2 ${points === val ? 'bg-[var(--primary)] text-[var(--ink)]' : 'bg-[var(--cream)] text-[var(--ink)]'} text-xs font-semibold tracking-wider uppercase transition-colors hover:bg-[var(--ink)]/10 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none`}
        >
          +{val}
        </button>
      ))}
    </div>
  );
}
