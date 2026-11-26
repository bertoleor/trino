'use client';

import * as React from 'react';
import { POINTS_REASONS, QuickPoints } from './modal-sumar-puntos-options';
import { Input } from './input';
import { ModalBase } from './modal-base';

interface ModalSumarPuntosExampleProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (points: number, reason: string, auditNote: string) => void;
}

export function ModalSumarPuntosExample({ open, onClose, onSubmit }: ModalSumarPuntosExampleProps) {
  const [points, setPoints] = React.useState(2500);
  const [reason, setReason] = React.useState('delay');
  const [auditNote, setAuditNote] = React.useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(points, reason, auditNote);
  };

  return (
    <ModalBase
      id="modal-sumar-puntos-manual"
      title="Sumar Puntos Manual"
      description="Modal para sumar puntos manualmente a la cuenta de Camila Navarro"
      open={open}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest rounded-none border-2 border-[var(--ink)] p-6 text-center">
          <h3 className="mb-2 text-sm font-semibold tracking-wider text-[var(--ink)] uppercase">
            Saldo Actual
          </h3>
          <p className="mb-1 text-4xl font-bold text-[var(--primary)]">14.200</p>
          <p className="text-sm text-zinc-500">pts disponibles</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-none border-2 border-[var(--ink)] bg-[var(--primary)] py-2 text-sm font-semibold tracking-wider text-[var(--ink)] uppercase transition-colors hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none"
          >
            + Acreditar
          </button>
          <button
            type="button"
            className="flex-1 rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] py-2 text-sm font-semibold tracking-wider text-[var(--ink)] uppercase transition-colors hover:bg-[var(--ink)]/10 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none"
          >
            Descontar / Corrección
          </button>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="points-input"
            className="text-sm font-medium tracking-wider text-[var(--ink)] uppercase"
          >
            Puntos a sumar
          </label>
          <Input
            id="points-input"
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-zinc-500">(Cada 100 pts = $10 ARS)</p>
        </div>
        <QuickPoints points={points} onSelect={setPoints} />
        <div className="mt-4 rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--ink)]">Proyecto de saldo:</span>
            <span className="text-xl font-bold text-[var(--primary)]">{14200 + points} pts</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Crédito:</span>
            <span className="text-sm font-bold text-[var(--ink)]">+${points * 0.1} ARS</span>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="reason-select"
            className="text-sm font-medium tracking-wider text-[var(--ink)] uppercase"
          >
            Motivo
          </label>
          <select
            id="reason-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] px-4 py-2 text-[var(--text-primary)] shadow-sm focus:ring-2 focus:ring-[var(--focus-ring)] focus:outline-none"
          >
            {POINTS_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="audit-note"
            className="text-sm font-medium tracking-wider text-[var(--ink)] uppercase"
          >
            Nota de auditoría interna
          </label>
          <textarea
            id="audit-note"
            value={auditNote}
            onChange={(e) => setAuditNote(e.target.value)}
            minLength={15}
            required
            className="w-full resize-none rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] p-4 text-[var(--text-primary)] shadow-sm focus:ring-2 focus:ring-[var(--focus-ring)] focus:outline-none"
            placeholder="Mínimo 15 caracteres - describa el motivo de este ajuste"
          />
          <p className="text-xs text-zinc-500">
            Mínimo 15 caracteres requeridos para auditoría interna
          </p>
        </div>
        <div className="flex items-start gap-3">
          <input
            id="notify-checkbox"
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded-none bg-[var(--cream)] text-[var(--primary)] focus:ring-[var(--focus-ring)]"
          />
          <label htmlFor="notify-checkbox" className="cursor-pointer text-sm text-zinc-500">
            Enviar notificación por WhatsApp a la socia
          </label>
        </div>
        <div className="flex gap-3 border-t border-[var(--ink)] pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-none border-2 border-[var(--ink)] bg-[var(--cream)] py-3 text-sm font-medium tracking-wider text-[var(--ink)] uppercase transition-colors hover:bg-[var(--ink)]/10 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-none border-2 border-[var(--primary)] bg-[var(--primary)] py-3 text-sm font-medium tracking-wider text-[var(--ink)] uppercase transition-colors hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:outline-none"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

export default ModalSumarPuntosExample;
