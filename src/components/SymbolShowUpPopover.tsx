/**
 * @file SymbolShowUpPopover.tsx
 * @description Interactive "Show-Up" popover card presenting detailed physics, role, and sizing formulas.
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';
import { X, Zap, Cpu, FunctionSquare, Info, Pin, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CircuitSymbol } from '../types/circuit.types.ts';
import { formatSchematicLabel, formatFormulaHtml, formatRichScientificText } from '../utils/label-formatter.tsx';

interface Props {
  readonly symbol: CircuitSymbol | null;
  readonly isPinned: boolean;
  readonly onClose: () => void;
  readonly onTogglePin: () => void;
}

export const SymbolShowUpPopover: React.FC<Props> = ({
  symbol,
  isPinned,
  onClose,
  onTogglePin,
}) => {
  if (!symbol) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="symbol-popover-title"
      className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-30 bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl p-4 sm:p-5 backdrop-blur-md text-slate-100 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            {formatSchematicLabel(symbol.label)}
          </div>
          <div>
            <h3 id="symbol-popover-title" className="text-sm font-bold text-white leading-tight">
              {symbol.name ?? symbol.label}
            </h3>
            <span className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Karta &quot;Show-Up&quot; komponentu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 ${
              isPinned
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isPinned ? 'Karta przypięta (kliknij, by odpiąć)' : 'Przypnij kartę na stałe'}
            aria-label="Przypnij kartę"
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45 text-cyan-400 fill-cyan-400' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Zamknij podgląd"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Details */}
      <div className="mt-3 space-y-3 text-xs leading-relaxed max-h-[50vh] overflow-y-auto pr-1">
        {/* Co oznacza / Wyjaśnienie ogólne */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Co oznacza ten symbol:</span>
          </div>
          <p className="text-slate-200">{formatRichScientificText(symbol.explanation)}</p>
        </div>

        {/* Rola fizyczna */}
        {symbol.physicalRole && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rola fizyczna w obwodzie:</span>
            </div>
            <p className="text-slate-200">{formatRichScientificText(symbol.physicalRole)}</p>
          </div>
        )}

        {/* Wzór doboru wartości */}
        {symbol.formula && (
          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1.5">
              <FunctionSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wzór doboru wartości:</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/90 font-mono text-xs text-amber-300 border border-slate-800 tracking-wide overflow-x-auto">
              {formatFormulaHtml(symbol.formula)}
            </div>
            {symbol.formulaDescription && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                {formatRichScientificText(symbol.formulaDescription)}
              </p>
            )}
          </div>
        )}

        {/* Wartość typowa */}
        {symbol.typicalValue && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-amber-400" />
              Wartość typowa / komponent:
            </span>
            <span className="font-mono text-cyan-300 font-bold">{symbol.typicalValue}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          {isPinned ? 'Karta zablokowana' : 'Najechanie lub kliknięcie aktywuje'}
        </span>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-cyan-300 font-medium"
        >
          Zamknij
        </button>
      </div>
    </div>
  );
};
