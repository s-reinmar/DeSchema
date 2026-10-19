/**
 * @file CircuitNavigator.tsx
 * @description Circuit navigation controls (< and > arrows, select dropdown, and upload trigger).
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';
import { ChevronLeft, ChevronRight, CircuitBoard, Sparkles, FolderSync, PlusCircle } from 'lucide-react';
import type { Circuit, CircuitSummary } from '../types/circuit.types.ts';

interface Props {
  readonly currentCircuit: Circuit;
  readonly summaries: readonly CircuitSummary[];
  readonly onSelectCircuit: (id: string) => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onOpenUpload: () => void;
}

export const CircuitNavigator: React.FC<Props> = ({
  currentCircuit,
  summaries,
  onSelectCircuit,
  onPrevious,
  onNext,
  onOpenUpload,
}) => {
  const currentIndex = summaries.findIndex((s) => s.id === currentCircuit.id);
  const positionText = `${currentIndex >= 0 ? currentIndex + 1 : 1} z ${summaries.length}`;

  const predefined = summaries.filter((s) => !s.isCustom);
  const custom = summaries.filter((s) => s.isCustom);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Previous & Next with dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onPrevious}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition flex items-center justify-center shrink-0 active:scale-95"
            title="Poprzedni obwód (Klawisz Strzałka w lewo)"
            aria-label="Poprzedni obwód"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 md:w-80">
            <select
              value={currentCircuit.id}
              onChange={(e) => onSelectCircuit(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
            >
              <optgroup label="Wbudowane schematy wzorcowe">
                {predefined.map((item) => (
                  <option key={item.id} value={item.id}>
                    ⚡ {item.title}
                  </option>
                ))}
              </optgroup>
              {custom.length > 0 && (
                <optgroup label="Własne wgrane schematy (localStorage)">
                  {custom.map((item) => (
                    <option key={item.id} value={item.id}>
                      📁 {item.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <CircuitBoard className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={onNext}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition flex items-center justify-center shrink-0 active:scale-95"
            title="Następny obwód (Klawisz Strzałka w prawo)"
            aria-label="Następny obwód"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center / Right: Indicators & upload action */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Układ: {positionText}</span>
            {currentCircuit.isCustom && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Własny
              </span>
            )}
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/70 transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Dodaj schemat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
