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

          {/* Interactive symbol hotspot overlays */}
          {circuit.symbols.map((sym) => {
            const isActiveInStep = activeTargetSymbolIds.includes(sym.id);
            const isSelected = selectedSymbol?.id === sym.id;

            return (
              <div
                key={sym.id}
                onClick={() => setSelectedSymbol(isSelected ? null : sym)}
                className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-20 group`}
                style={{
                  left: `${(sym.x / parseViewBoxWidth(circuit.svgViewBox)) * 100}%`,
                  top: `${(sym.y / parseViewBoxHeight(circuit.svgViewBox)) * 100}%`,
                }}
              >
                {/* Glowing ring if active in current Socratic Step */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-transform ${
                    isActiveInStep
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(56,189,248,0.7)] animate-pulse scale-110'
                      : 'border-slate-600 bg-slate-900/70 hover:border-indigo-400 opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
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
