/**
 * @file SchematicAnnotationsLayer.tsx
 * @description Layer rendering user-placed pedagogical markers and notes on top of the vector schematic.
 * @author @s-reinmar
 * @license MIT
 */

import React from 'react';
import { MapPin, X, Tag } from 'lucide-react';
import type { SchematicAnnotation } from '../../types/annotation.types.ts';
import { SymbolParser } from '../../utils/symbol-parser.ts';

interface Props {
  readonly annotations: readonly SchematicAnnotation[];
  readonly viewBoxWidth: number;
  readonly viewBoxHeight: number;
  readonly onRemoveAnnotation: (id: string) => void;
}

export const SchematicAnnotationsLayer: React.FC<Props> = ({
  annotations,
  viewBoxWidth,
  viewBoxHeight,
  onRemoveAnnotation,
}) => {
  if (annotations.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {annotations.map((ann, index) => {
        const leftPercent = (ann.x / viewBoxWidth) * 100;
        const topPercent = (ann.y / viewBoxHeight) * 100;

        return (
          <div
            key={ann.id}
            data-no-pan="true"
            className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto group animate-bounce-short"
            style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
          >
            {/* Visual Pin Marker */}
            <div className="flex flex-col items-center cursor-pointer">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-lg border backdrop-blur-md transition-all transform group-hover:scale-110 ${ann.color}`}
              >
                <MapPin className="w-3 h-3 fill-current" />
                <span>#{index + 1} {SymbolParser.formatSymbol(ann.label)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAnnotation(ann.id);
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-black/30 transition text-white/70 hover:text-white"
                  title="Usuń ten znacznik"
                  aria-label="Usuń znacznik"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Pin indicator dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] ring-2 ring-slate-950 mt-0.5" />

              {/* Hover Popover Note Preview */}
              {ann.note && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute bottom-full mb-1 w-44 p-2 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl text-[11px] text-slate-200 z-30">
                  <div className="flex items-center gap-1 font-semibold text-cyan-300 text-[10px] mb-0.5">
                    <Tag className="w-3 h-3" />
                    <span>Adnotacja użytkownika:</span>
                  </div>
                  <p className="line-clamp-2 leading-tight text-slate-300">{ann.note}</p>
                  <span className="block text-[9px] font-mono text-slate-500 mt-1">{ann.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
