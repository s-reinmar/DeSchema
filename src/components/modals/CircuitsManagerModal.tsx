/**
 * @file CircuitsManagerModal.tsx
 * @description Catalog modal for browsing circuits, switching active schematics, and reserving placeholder slot.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useEffect } from 'react';
import { X, CircuitBoard, Layers, Check, Sparkles, PlusCircle } from 'lucide-react';
import type { CircuitSummary } from '../../types/circuit.types.ts';
import { SymbolParser } from '../../utils/symbol-parser.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly summaries: readonly CircuitSummary[];
  readonly currentCircuitId: string;
  readonly onSelectCircuit: (id: string) => void;
}

export const CircuitsManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  summaries,
  currentCircuitId,
  onSelectCircuit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="circuits-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-md">
              <CircuitBoard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="circuits-modal-title" className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Katalog Układów
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {summaries.length} obwodów
                </span>
              </h2>
              <p className="text-xs text-slate-400">Przeglądaj wzorcowe schematy elektroniczne</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Zamknij katalog układów"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 no-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {summaries.map((item) => {
              const isActive = item.id === currentCircuitId;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectCircuit(item.id);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/30 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-bold text-sm text-white">
                        {SymbolParser.formatSymbol(item.title)}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                          <Check className="w-3 h-3" />
                          Aktywny
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {SymbolParser.formatSymbol(item.description)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                      <span>4 kroki analizy</span>
                      <span>•</span>
                      <span>Schemat wektorowy SVG</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isActive ? 'Aktywny' : 'Wybierz układ'}
                  </button>
                </div>
              );
            })}

            {/* Zarezerwowane puste miejsce pod nowy układ (Placeholder według wytycznych) */}
            <div className="p-5 rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/30 text-slate-400 flex flex-col items-center justify-center text-center gap-2 select-none">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-300 block">
                  Miejsce zarezerwowane na nowy układ
                </span>
                <span className="text-[11px] text-slate-500 max-w-sm block mt-0.5">
                  Przestrzeń przewidziana na kolejny moduł schematu i zarządzanie biblioteką.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-500 border border-slate-800">
                Reserved Slot • Wkrótce
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Wybierz schemat, aby rozpocząć analizę sokratejską
          </span>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
