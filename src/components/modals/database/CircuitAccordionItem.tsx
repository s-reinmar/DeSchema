/**
 * @file CircuitAccordionItem.tsx
 * @description Collapsible accordion item for SVG circuits explorer.
 * Supports isolated toggle, vector graphic rendering, bulleted symbols, and pure SVG download.
 * Adheres strictly to SOLID (SRP) and strict TypeScript typing without `any`.
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Download,
  Trash2,
  Cpu,
  HelpCircle,
  Eye,
  FileCode,
} from 'lucide-react';
import type { CircuitVectorItem } from '../../../interfaces/database-manager.interface.ts';
import { SymbolParser } from '../../../utils/symbol-parser.ts';

export interface CircuitAccordionItemProps {
  readonly circuit: CircuitVectorItem;
  readonly isExpanded: boolean;
  readonly isDownloading: boolean;
  readonly isDeleting: boolean;
  readonly onToggle: () => void;
  readonly onDownload: (circuit: CircuitVectorItem) => void;
  readonly onDelete: (circuitId: string) => void;
}

export const CircuitAccordionItem: React.FC<CircuitAccordionItemProps> = ({
  circuit,
  isExpanded,
  isDownloading,
  isDeleting,
  onToggle,
  onDownload,
  onDelete,
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-950/20'
          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 hover:bg-slate-900/60'
      }`}
    >
      {/* Accordion Row Header */}
      <div
        onClick={onToggle}
        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition shrink-0"
            aria-label={isExpanded ? 'Zwiń schemat' : 'Rozwiń schemat'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h5 className="font-bold text-white text-xs sm:text-sm truncate">
              {SymbolParser.formatSymbol(circuit.title)}
            </h5>

            <span className="font-mono text-[10px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 shrink-0">
              {circuit.id}
            </span>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md shrink-0">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>{circuit.symbols.length} symboli</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md shrink-0">
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>{circuit.socraticSteps.length} pytań</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(circuit);
            }}
            disabled={isDownloading}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Pobierz wyłącznie czysty wektor schematu (.svg)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pobierz SVG</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(circuit.id);
            }}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer disabled:opacity-50"
            title="Usuń ten schemat z bazy danych"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-5 animate-fade-in">
          {circuit.description && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
              {SymbolParser.formatSymbol(circuit.description)}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* SVG Visual Graphic Preview */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800/90 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800/60 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Eye className="w-3.5 h-3.5" />
                  Podgląd wektora SVG
                </span>
                <span className="text-slate-500">viewBox: {circuit.svgViewBox}</span>
              </div>
              <div className="w-full flex items-center justify-center overflow-hidden py-2">
                <svg
                  viewBox={circuit.svgViewBox}
                  className="w-full max-h-[240px] object-contain text-slate-200"
                  dangerouslySetInnerHTML={{ __html: circuit.svgContent }}
                />
              </div>
            </div>

            {/* Bulleted Symbols & Socratic Steps Details */}
            <div className="lg:col-span-7 space-y-4 text-xs font-sans">
              {/* Bulleted Symbols */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-2">
                <h6 className="font-bold text-slate-200 text-xs flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Wykryte Symbole i Elementy ({circuit.symbols.length}):
                </h6>
                <ul className="space-y-1.5 pl-1 text-slate-300 text-xs">
                  {circuit.symbols.map((sym) => (
                    <li key={sym.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-cyan-400 select-none">•</span>
                      <span>
                        <strong className="text-white font-mono">{sym.label}</strong>
                        {sym.name && sym.name !== sym.label && (
                          <span className="text-slate-400"> ({sym.name})</span>
                        )}
                        {sym.typicalValue && (
                          <span className="text-emerald-300 font-mono text-[11px] ml-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {sym.typicalValue}
                          </span>
                        )}
                        {sym.physicalRole && (
                          <span className="text-slate-400"> — {SymbolParser.formatSymbol(sym.physicalRole)}</span>
                        )}
                        {sym.formula && (
                          <span className="font-mono text-amber-300 ml-1.5 text-[11px]">
                            [{SymbolParser.formatSymbol(sym.formula)}]
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                  {circuit.symbols.length === 0 && (
                    <li className="text-slate-500 italic">Brak zdefiniowanych symboli w schemacie.</li>
                  )}
                </ul>
              </div>

              {/* Bulleted Socratic Steps (no active links) */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-2">
                <h6 className="font-bold text-slate-200 text-xs flex items-center gap-2 font-mono uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Pytania Dydaktyczne i Etapy Sokratejskie ({circuit.socraticSteps.length}):
                </h6>
                <ul className="space-y-2 pl-1 text-slate-300 text-xs">
                  {circuit.socraticSteps.map((step) => (
                    <li key={step.stepNumber} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-400 font-mono font-bold select-none">{step.stepNumber}.</span>
                      <div>
                        <span className="font-semibold text-slate-200">
                          {SymbolParser.formatSymbol(step.title)}
                        </span>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {SymbolParser.formatSymbol(step.promptQuestion)}
                        </p>
                      </div>
                    </li>
                  ))}
                  {circuit.socraticSteps.length === 0 && (
                    <li className="text-slate-500 italic">Brak pytań sokratejskich dla tego obwodu.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
