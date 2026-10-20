/**
 * @file CircuitViewer.tsx
 * @description Interactive vector SVG schematic viewer highlighting target symbols in real-time.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { Eye, Layers, Info, Sparkles } from 'lucide-react';
import type { Circuit, CircuitSymbol } from '../types/circuit.types.ts';
import { formatSchematicLabel } from '../utils/label-formatter.tsx';

interface Props {
  readonly circuit: Circuit;
  readonly activeTargetSymbolIds: readonly string[];
}

export const CircuitViewer: React.FC<Props> = ({ circuit, activeTargetSymbolIds }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<CircuitSymbol | null>(null);

  const activeSymbols = circuit.symbols.filter((s) => activeTargetSymbolIds.includes(s.id));

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Schematic Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">{circuit.title}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {circuit.description}
          </p>
        </div>

        {/* Active focal components badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Aktywne w kroku:
          </span>
          {activeSymbols.length > 0 ? (
            activeSymbols.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSymbol(s)}
                className="px-2 py-1 text-xs font-mono font-bold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition cursor-pointer"
              >
                {formatSchematicLabel(s.label)}
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-500">Cały obwód</span>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative p-4 sm:p-8 flex items-center justify-center bg-slate-950/90 overflow-hidden min-h-[340px]">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Dynamic SVG Container */}
        <div className="w-full max-w-3xl aspect-[16/9] max-h-[460px] flex items-center justify-center relative">
          <svg
            viewBox={circuit.svgViewBox}
            className="w-full h-full text-slate-300 drop-shadow-md select-none"
            dangerouslySetInnerHTML={{ __html: circuit.svgContent }}
          />

          {/* Interactive symbol hotspot overlays: Outline Highlight (obrys układu) */}
          {circuit.symbols.map((sym) => {
            const isActiveInStep = activeTargetSymbolIds.includes(sym.id);
            const isSelected = selectedSymbol?.id === sym.id;

            return (
              <div
                key={sym.id}
                onClick={() => setSelectedSymbol(isSelected ? null : sym)}
                className="absolute cursor-pointer transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                style={{
                  left: `${(sym.x / parseViewBoxWidth(circuit.svgViewBox)) * 100}%`,
                  top: `${(sym.y / parseViewBoxHeight(circuit.svgViewBox)) * 100}%`,
                }}
                title={`${sym.label}: ${sym.name || ''}`}
              >
                {/* Obrys elementu: przezroczysty środek, nie zasłaniający grafiki schematu */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 relative flex items-center justify-center ${
                    isSelected
                      ? 'border-2 border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.9)] ring-2 ring-amber-400/50 scale-110 z-30'
                      : isActiveInStep
                      ? 'border-2 border-cyan-400 bg-cyan-400/5 shadow-[0_0_18px_rgba(56,189,248,0.8)] ring-2 ring-cyan-400/30 animate-pulse scale-105'
                      : 'border border-dashed border-slate-600/40 hover:border-solid hover:border-cyan-400/70 hover:bg-cyan-400/10 bg-transparent opacity-40 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {/* Etykieta umieszczona ponad obrysem (nie zasłaniająca symbolu) */}
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md shadow-xs pointer-events-none whitespace-nowrap select-none ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border border-amber-300 font-extrabold'
                        : isActiveInStep
                        ? 'bg-slate-950/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-950/80 text-slate-400 border border-slate-700/60 opacity-70 group-hover:opacity-100 group-hover:text-white'
                    }`}
                  >
                    {formatSchematicLabel(sym.label)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Symbol Inspection Drawer / Details */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between min-h-[52px]">
        {selectedSymbol ? (
          <div className="flex items-center gap-3 w-full text-xs animate-fade-in">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
              {formatSchematicLabel(selectedSymbol.label)}
            </span>
            <span className="text-slate-300 flex-1 leading-snug">
              {selectedSymbol.explanation}
            </span>
            <button
              onClick={() => setSelectedSymbol(null)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 text-[11px]"
            >
              Zamknij podgląd
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Wskazówka: Kliknij dowolny element na schemacie, aby poznać jego rolę w obwodzie.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

function parseViewBoxWidth(viewBox: string): number {
  const parts = viewBox.trim().split(/\s+/);
  return parts.length >= 3 ? parseFloat(parts[2]) || 680 : 680;
}

function parseViewBoxHeight(viewBox: string): number {
  const parts = viewBox.trim().split(/\s+/);
  return parts.length >= 4 ? parseFloat(parts[3]) || 380 : 380;
}
