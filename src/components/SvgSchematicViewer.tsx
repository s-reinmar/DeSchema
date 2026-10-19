/**
 * @file SvgSchematicViewer.tsx
 * @description Advanced vector schematic viewer engine with integrated controls and Show-Up popovers.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  CircuitBoard,
  Info,
} from 'lucide-react';
import type { Circuit, CircuitSummary, CircuitSymbol } from '../types/circuit.types.ts';
import { formatSchematicLabel, sanitizeSvgTextLabels } from '../utils/label-formatter.tsx';
import { SymbolShowUpPopover } from './SymbolShowUpPopover.tsx';

interface Props {
  readonly circuit: Circuit;
  readonly summaries: readonly CircuitSummary[];
  readonly activeTargetSymbolIds: readonly string[];
  readonly onSelectCircuit: (id: string) => void;
  readonly onPreviousCircuit: () => void;
  readonly onNextCircuit: () => void;
  readonly onOpenUploadModal: () => void;
}

export const SvgSchematicViewer: React.FC<Props> = ({
  circuit,
  summaries,
  activeTargetSymbolIds,
  onSelectCircuit,
  onPreviousCircuit,
  onNextCircuit,
  onOpenUploadModal,
}) => {
  const [activeSymbol, setActiveSymbol] = useState<CircuitSymbol | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const predefined = summaries.filter((s) => !s.isCustom);
  const custom = summaries.filter((s) => s.isCustom);

  const handleSymbolClick = (sym: CircuitSymbol) => {
    if (activeSymbol?.id === sym.id && isPinned) {
      setIsPinned(false);
      setActiveSymbol(null);
    } else {
      setActiveSymbol(sym);
      setIsPinned(true);
    }
  };

  const handleSymbolHover = (sym: CircuitSymbol) => {
    if (!isPinned) {
      setActiveSymbol(sym);
    }
  };

  const handleSymbolLeave = () => {
    if (!isPinned) {
      setActiveSymbol(null);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomScale((prev) => Math.min(Math.max(0.7, prev + delta), 1.8));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all">
      {/* 4. Pasek sterowania układem nad schematem */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Navigation buttons and circuit dropdown */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={onPreviousCircuit}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition flex items-center justify-center shrink-0 active:scale-95"
            title="Poprzedni schemat (< lub Strzałka w lewo)"
            aria-label="Poprzedni schemat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 max-w-sm">
            <select
              value={circuit.id}
              onChange={(e) => {
                onSelectCircuit(e.target.value);
                setActiveSymbol(null);
                setIsPinned(false);
              }}
              className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer truncate"
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
            onClick={onNextCircuit}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition flex items-center justify-center shrink-0 active:scale-95"
            title="Następny schemat (> lub Strzałka w prawo)"
            aria-label="Następny schemat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right controls: Upload / Open button and Zoom tools */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Przybliż schemat"
              aria-label="Przybliż"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Oddal schemat"
              aria-label="Oddal"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs font-mono"
              title="Resetuj powiększenie (100%)"
              aria-label="Dopasuj do okna"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition shrink-0"
            title="Otwórz z lokalizacji / Wgraj układ z dysku"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Otwórz z lokalizacji / Wgraj układ</span>
          </button>
        </div>
      </div>

      {/* Schematic Sub-header info */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{circuit.title}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400">Symbole w kroku:</span>
          {circuit.symbols
            .filter((s) => activeTargetSymbolIds.includes(s.id))
            .map((s) => (
              <button
                key={s.id}
                onClick={() => handleSymbolClick(s)}
                className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition cursor-pointer"
              >
                {formatSchematicLabel(s.label)}
              </button>
            ))}
        </div>
      </div>

      {/* 1. Canvas Area rendering the Vector SVG Graphics */}
      <div
        ref={containerRef}
        className="relative p-4 sm:p-8 flex items-center justify-center bg-slate-950/90 overflow-hidden min-h-[380px] sm:min-h-[440px]"
      >
        {/* Subtle background blueprint grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Scalable SVG Schematic Container */}
        <div
          className="w-full max-w-3xl aspect-[16/9] max-h-[480px] flex items-center justify-center relative transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <svg
            viewBox={circuit.svgViewBox}
            className="w-full h-full text-slate-300 drop-shadow-lg select-none"
            dangerouslySetInnerHTML={{ __html: sanitizeSvgTextLabels(circuit.svgContent) }}
          />

          {/* 2 & 3. Interactive Symbol Hotspots with <sub> / <sup> and Show-Up Popover */}
          {circuit.symbols.map((sym) => {
            const isActiveInStep = activeTargetSymbolIds.includes(sym.id);
            const isSelected = activeSymbol?.id === sym.id;
            const width = parseViewBoxWidth(circuit.svgViewBox);
            const height = parseViewBoxHeight(circuit.svgViewBox);

            return (
              <div
                key={sym.id}
                onClick={() => handleSymbolClick(sym)}
                onMouseEnter={() => handleSymbolHover(sym)}
                onMouseLeave={handleSymbolLeave}
                className="absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                style={{
                  left: `${(sym.x / width) * 100}%`,
                  top: `${(sym.y / height) * 100}%`,
                }}
              >
                {/* Visual pulse & halo for active or inspected symbols */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.9)] scale-125 z-30'
                      : isActiveInStep
                      ? 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse scale-110'
                      : 'border-slate-600 bg-slate-900/80 hover:border-indigo-400 opacity-75 hover:opacity-100 hover:scale-115'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold text-white tracking-tight">
                    {formatSchematicLabel(sym.label)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Interactive "Show-Up" Popover Card */}
        <SymbolShowUpPopover
          symbol={activeSymbol}
          isPinned={isPinned}
          onClose={() => {
            setActiveSymbol(null);
            setIsPinned(false);
          }}
          onTogglePin={() => setIsPinned(!isPinned)}
        />
      </div>

      {/* Bottom status helper bar */}
      <div className="px-5 py-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Najedź kursorem lub kliknij dowolny symbol (np.{' '}
            <span className="font-mono text-cyan-300">{formatSchematicLabel('R_b1')}</span>,{' '}
            <span className="font-mono text-cyan-300">{formatSchematicLabel('U_{in}')}</span>,{' '}
            <span className="font-mono text-cyan-300">{formatSchematicLabel('D_z')}</span>
            ), aby wyświetlić kartę Show-Up ze wzorami i rolą fizyczną.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-500">
          <span>Skala: {Math.round(zoomScale * 100)}%</span>
        </div>
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
