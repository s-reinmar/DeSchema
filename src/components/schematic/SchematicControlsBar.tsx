/**
 * @file SchematicControlsBar.tsx
 * @description Toolbar providing schematic selection, zoom-to-fit, pan controls, and annotation mode toggles.
 * @author @s-reinmar
 * @license MIT
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Tag,
  Trash2,
  CircuitBoard,
} from 'lucide-react';
import type { CircuitSummary } from '../../types/circuit.types.ts';
import { SymbolParser } from '../../utils/symbol-parser.ts';

interface Props {
  readonly currentCircuitId: string;
  readonly summaries: readonly CircuitSummary[];
  readonly isAnnotationMode: boolean;
  readonly annotationsCount: number;
  readonly onSelectCircuit: (id: string) => void;
  readonly onPreviousCircuit: () => void;
  readonly onNextCircuit: () => void;
  readonly onOpenUploadModal: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onZoomToFit: () => void;
  readonly onResetZoom: () => void;
  readonly onToggleAnnotationMode: () => void;
  readonly onClearAnnotations: () => void;
}

export const SchematicControlsBar: React.FC<Props> = ({
  currentCircuitId,
  summaries,
  isAnnotationMode,
  annotationsCount,
  onSelectCircuit,
  onPreviousCircuit,
  onNextCircuit,
  onOpenUploadModal,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onResetZoom,
  onToggleAnnotationMode,
  onClearAnnotations,
}) => {
  const predefined = summaries.filter((s) => !s.isCustom);
  const custom = summaries.filter((s) => s.isCustom);

  return (
    <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Navigation and Circuit selector */}
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={onPreviousCircuit}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
          title="Poprzedni schemat (Strzałka w lewo)"
          aria-label="Poprzedni schemat"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-sm">
          <select
            value={currentCircuitId}
            onChange={(e) => onSelectCircuit(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer truncate"
          >
            <optgroup label="Wbudowane schematy wzorcowe">
              {predefined.map((item) => (
                <option key={item.id} value={item.id}>
                  ⚡ {SymbolParser.formatSymbol(item.title)}
                </option>
              ))}
            </optgroup>
            {custom.length > 0 && (
              <optgroup label="Własne wgrane schematy (localStorage)">
                {custom.map((item) => (
                  <option key={item.id} value={item.id}>
                    📁 {SymbolParser.formatSymbol(item.title)}
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
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
          title="Następny schemat (Strzałka w prawo)"
          aria-label="Następny schemat"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Tools: Pan/Zoom & Annotation Controls */}
      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 flex-wrap">
        {/* Annotation Tool Button */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={onToggleAnnotationMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isAnnotationMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isAnnotationMode ? 'Wyłącz tryb dodawania znaczników' : 'Włącz tryb dodawania znaczników na komponentach'}
            aria-pressed={isAnnotationMode}
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Znaczniki</span>
            {annotationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/30 text-amber-200">
                {annotationsCount}
              </span>
            )}
          </button>

          {annotationsCount > 0 && (
            <button
              onClick={onClearAnnotations}
              className="p-1.5 text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
              title="Wyczyść wszystkie znaczniki ze schematu"
              aria-label="Wyczyść znaczniki"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pan and Zoom Toolbar */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={onZoomIn}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Przybliż schemat"
            aria-label="Przybliż"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Oddal schemat"
            aria-label="Oddal"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomToFit}
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition text-xs font-medium cursor-pointer"
            title="Dopasuj schemat do okna (Zoom to Fit)"
            aria-label="Dopasuj do okna"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dopasuj</span>
          </button>
          <button
            onClick={onResetZoom}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs font-mono cursor-pointer"
            title="Resetuj widok (100%)"
            aria-label="Resetuj widok"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upload Button */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition shrink-0 cursor-pointer"
          title="Otwórz z lokalizacji / Wgraj układ z dysku"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Wgraj układ</span>
        </button>
      </div>
    </div>
  );
};
