/**
 * @file SymbolShowUpPopover.tsx
 * @description Dedicated, independent inspector card for circuit symbols.
 * Anchored to the top to prevent clipping, with isolated vertical scrollbar and step symbol switcher.
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';
import { X, Zap, Cpu, FunctionSquare, Info, Pin, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CircuitSymbol } from '../types/circuit.types.ts';
import { SymbolParser } from '../utils/symbol-parser.ts';

interface Props {
  readonly symbol: CircuitSymbol | null;
  readonly isPinned: boolean;
  readonly activeStepSymbols?: readonly CircuitSymbol[];
  readonly onSelectSymbol?: (symbol: CircuitSymbol) => void;
  readonly onClose: () => void;
  readonly onTogglePin: () => void;
}

export const SymbolShowUpPopover: React.FC<Props> = ({
  symbol,
  isPinned,
  activeStepSymbols,
  onSelectSymbol,
  onClose,
  onTogglePin,
}) => {
  if (!symbol) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="symbol-popover-title"
      data-no-pan="true"
      data-scrollable="true"
      onWheel={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="absolute top-3 right-3 sm:top-4 sm:right-4 w-[calc(100%-1.5rem)] sm:w-[420px] max-h-[calc(100%-1.5rem)] sm:max-h-[calc(100%-2rem)] z-30 bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col backdrop-blur-md text-slate-100 animate-fade-in overflow-hidden"
    >
      {/* 1. Fixed Top Header (Never cut off) */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] shrink-0">
            {SymbolParser.formatSymbol(symbol.label)}
          </div>
          <div className="min-w-0">
            <h3 id="symbol-popover-title" className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
              {symbol.name ? SymbolParser.formatSymbol(symbol.name) : SymbolParser.formatSymbol(symbol.label)}
            </h3>
            <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400/90 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Karta komponentu • Widok szczegółowy</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer ${
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
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            aria-label="Zamknij podgląd"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Step Symbols Quick Switcher (if multiple symbols active in step) */}
      {activeStepSymbols && activeStepSymbols.length > 1 && (
        <div className="px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            W kroku:
          </span>
          {activeStepSymbols.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSymbol?.(s)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md border transition-all cursor-pointer shrink-0 ${
                s.id === symbol.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/50 hover:text-white'
              }`}
            >
              {SymbolParser.formatSymbol(s.label)}
            </button>
          ))}
        </div>
      )}

      {/* 3. Scrollable Body: Dedicated Vertical Scrollbar (Isolated, no-interference) */}
      <div
        data-scrollable="true"
        className="p-3.5 sm:p-4 flex-1 min-h-0 overflow-y-auto overscroll-contain dedicated-scrollbar space-y-3 text-xs leading-relaxed"
      >
        {/* Co oznacza / Wyjaśnienie ogólne */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Co oznacza ten symbol:</span>
          </div>
          <p className="text-slate-200">{SymbolParser.formatRichScientificText(symbol.explanation)}</p>
        </div>

        {/* Rola fizyczna */}
        {symbol.physicalRole && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Rola fizyczna w obwodzie:</span>
            </div>
            <p className="text-slate-200">{SymbolParser.formatRichScientificText(symbol.physicalRole)}</p>
          </div>
        )}

        {/* Wzór doboru wartości */}
        {symbol.formula && (
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1.5">
              <FunctionSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Wzór doboru wartości:</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/90 font-mono text-xs text-amber-300 border border-slate-800 tracking-wide overflow-x-auto">
              {SymbolParser.formatFormulaHtml(symbol.formula)}
            </div>
            {symbol.formulaDescription && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                {SymbolParser.formatRichScientificText(symbol.formulaDescription)}
              </p>
            )}
          </div>
        )}

        {/* Wartość typowa */}
        {symbol.typicalValue && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Wartość typowa / komponent:</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {SymbolParser.formatSymbol(symbol.typicalValue)}
            </span>
          </div>
        )}
      </div>

      {/* 4. Fixed Bottom Footer */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>{isPinned ? 'Karta zablokowana' : 'Niezależne okienko'}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
        >
          Zamknij
        </button>
      </div>
    </div>
  );
};
