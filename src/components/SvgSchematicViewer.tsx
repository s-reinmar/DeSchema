/**
 * @file SvgSchematicViewer.tsx
 * @description Advanced vector schematic viewer featuring manual pan/zoom, zoom-to-fit, and interactive annotations.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState, useRef } from 'react';
import { Layers, Info, Move } from 'lucide-react';
import type { Circuit, CircuitSummary, CircuitSymbol } from '../types/circuit.types.ts';
import type { SchematicAnnotation } from '../types/annotation.types.ts';
import { SymbolParser } from '../utils/symbol-parser.ts';
import { SymbolShowUpPopover } from './SymbolShowUpPopover.tsx';
import { useSchematicPanZoom } from '../hooks/useSchematicPanZoom.ts';
import { SchematicControlsBar } from './schematic/SchematicControlsBar.tsx';
import { SchematicAnnotationsLayer } from './schematic/SchematicAnnotationsLayer.tsx';

interface Props {
  readonly circuit: Circuit;
  readonly summaries: readonly CircuitSummary[];
  readonly activeTargetSymbolIds: readonly string[];
  readonly annotations?: readonly SchematicAnnotation[];
  readonly onAnnotationsChange?: (annotations: readonly SchematicAnnotation[]) => void;
  readonly onSelectCircuit: (id: string) => void;
  readonly onPreviousCircuit: () => void;
  readonly onNextCircuit: () => void;
}

const ANNOTATION_COLORS = [
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'bg-purple-500/20 text-purple-300 border-purple-500/40',
];

export const SvgSchematicViewer: React.FC<Props> = ({
  circuit,
  summaries,
  activeTargetSymbolIds,
  annotations: externalAnnotations,
  onAnnotationsChange,
  onSelectCircuit,
  onPreviousCircuit,
  onNextCircuit,
}) => {
  const [activeSymbol, setActiveSymbol] = useState<CircuitSymbol | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [internalAnnotations, setInternalAnnotations] = useState<readonly SchematicAnnotation[]>([]);
  const annotations = externalAnnotations ?? internalAnnotations;

  const setAnnotations = (
    updater:
      | readonly SchematicAnnotation[]
      | ((prev: readonly SchematicAnnotation[]) => readonly SchematicAnnotation[])
  ) => {
    const next = typeof updater === 'function' ? updater(annotations) : updater;
    setInternalAnnotations(next);
    onAnnotationsChange?.(next);
  };
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    transform,
    isDragging,
    zoomIn,
    zoomOut,
    zoomToFit,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSchematicPanZoom(containerRef);

  const width = parseViewBoxWidth(circuit.svgViewBox);
  const height = parseViewBoxHeight(circuit.svgViewBox);

  const handleSymbolClick = (sym: CircuitSymbol) => {
    if (isAnnotationMode) {
      // Toggle or add annotation for this symbol
      const existing = annotations.find((a) => a.symbolId === sym.id);
      if (existing) {
        setAnnotations((prev) => prev.filter((a) => a.id !== existing.id));
      } else {
        const nextColor = ANNOTATION_COLORS[annotations.length % ANNOTATION_COLORS.length];
        const newAnnotation: SchematicAnnotation = {
          id: `ann-${Date.now()}-${sym.id}`,
          symbolId: sym.id,
          label: sym.label,
          note: sym.explanation || 'Wybrany punkt schematu',
          x: sym.x,
          y: sym.y,
          color: nextColor,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
      }
      return;
    }

    if (activeSymbol?.id === sym.id && isPinned) {
      setIsPinned(false);
      setActiveSymbol(null);
    } else {
      setActiveSymbol(sym);
      setIsPinned(true);
    }
  };

  const handleSymbolHover = (sym: CircuitSymbol) => {
    if (!isPinned && !isAnnotationMode) {
      setActiveSymbol(sym);
    }
  };

  const handleSymbolLeave = () => {
    if (!isPinned && !isAnnotationMode) {
      setActiveSymbol(null);
    }
  };

  const handleRemoveAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAnnotations = () => {
    setAnnotations([]);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all">
      {/* 1. Integrated Controls Bar */}
      <SchematicControlsBar
        currentCircuitId={circuit.id}
        summaries={summaries}
        isAnnotationMode={isAnnotationMode}
        annotationsCount={annotations.length}
        onSelectCircuit={(id) => {
          onSelectCircuit(id);
          setActiveSymbol(null);
          setIsPinned(false);
        }}
        onPreviousCircuit={onPreviousCircuit}
        onNextCircuit={onNextCircuit}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomToFit={zoomToFit}
        onToggleAnnotationMode={() => setIsAnnotationMode((prev) => !prev)}
        onClearAnnotations={handleClearAnnotations}
      />

      {/* 2. Sub-header info */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{SymbolParser.formatSymbol(circuit.title)}</span>
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
                {SymbolParser.formatSymbol(s.label)}
              </button>
            ))}
        </div>
      </div>

      {/* 3. Interactive Pan/Zoom Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative p-4 sm:p-8 flex items-center justify-center bg-slate-950/90 overflow-hidden min-h-[400px] sm:min-h-[460px] select-none overscroll-contain touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Blueprint background grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Scalable & Pannable SVG Container */}
        <div
          className="w-full max-w-3xl aspect-[16/9] max-h-[500px] flex items-center justify-center relative transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox={circuit.svgViewBox}
            className="w-full h-full text-slate-300 drop-shadow-lg select-none pointer-events-none"
            dangerouslySetInnerHTML={{ __html: SymbolParser.sanitizeSvg(circuit.svgContent) }}
          />

          {/* User Annotations Layer */}
          <SchematicAnnotationsLayer
            annotations={annotations}
            viewBoxWidth={width}
            viewBoxHeight={height}
            onRemoveAnnotation={handleRemoveAnnotation}
          />

          {/* Interactive Symbol Hotspots */}
          {circuit.symbols.map((sym) => {
            const isActiveInStep = activeTargetSymbolIds.includes(sym.id);
            const isSelected = activeSymbol?.id === sym.id;
            const hasAnnotation = annotations.some((a) => a.symbolId === sym.id);

            return (
              <div
                key={sym.id}
                data-no-pan="true"
                onClick={() => handleSymbolClick(sym)}
                onMouseEnter={() => handleSymbolHover(sym)}
                onMouseLeave={handleSymbolLeave}
                className="absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                style={{
                  left: `${(sym.x / width) * 100}%`,
                  top: `${(sym.y / height) * 100}%`,
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.9)] scale-125 z-30'
                      : hasAnnotation
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-110'
                      : isActiveInStep
                      ? 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse scale-110'
                      : 'border-slate-600 bg-slate-900/80 hover:border-indigo-400 opacity-75 hover:opacity-100 hover:scale-115'
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold text-white tracking-tight">
                    {SymbolParser.formatSymbol(sym.label)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Popover Card */}
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

      {/* 4. Bottom status helper bar */}
      <div className="px-5 py-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {isAnnotationMode ? (
              <span className="text-amber-300 font-medium">
                Tryb adnotacji aktywny: kliknij dowolny komponent, aby dodać lub zdjąć znacznik.
              </span>
            ) : (
              <span>
                Przeciągaj myszą, aby przesuwać schemat • Kółko myszy = zoom • Przycisk &apos;Dopasuj&apos; = zoom-to-fit • Kliknięcie komponentu = karta &apos;Show-Up&apos;.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Move className="w-3 h-3 text-slate-400" />
            Pan: {Math.round(transform.translateX)}px, {Math.round(transform.translateY)}px
          </span>
          <span className="text-cyan-400 font-bold">Skala: {Math.round(transform.scale * 100)}%</span>
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
