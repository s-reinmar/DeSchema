/**
 * @file SocraticProgressBar.tsx
 * @description Accessible, animated progress bar visualizing the current stage of circuit schematic analysis.
 * @author @s-reinmar
 * @license MIT
 */

import React from 'react';
import { CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { SymbolParser } from '../utils/symbol-parser.ts';

interface Props {
  readonly currentStepNumber: number;
  readonly totalSteps: number;
  readonly currentStepTitle?: string;
}

export const SocraticProgressBar: React.FC<Props> = ({
  currentStepNumber,
  totalSteps,
  currentStepTitle,
}) => {
  const safeTotal = Math.max(totalSteps, 1);
  const clampedStep = Math.min(Math.max(currentStepNumber, 1), safeTotal);
  const percentage = Math.round((clampedStep / safeTotal) * 100);
  const isComplete = clampedStep === safeTotal;

  return (
    <div
      role="progressbar"
      aria-label="Postęp analizy sokratejskiej schematu"
      aria-valuenow={clampedStep}
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-valuetext={`Krok ${clampedStep} z ${safeTotal} (${percentage}%)`}
      className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col gap-2.5 backdrop-blur-sm"
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            {isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            )}
          </div>
          <div>
            <span className="font-bold text-slate-200">
              Postęp analizy schematu:
            </span>{' '}
            <span className="font-mono text-cyan-300 font-semibold">
              Krok {clampedStep} z {safeTotal}
            </span>
            {currentStepTitle && (
              <span className="hidden md:inline text-slate-400 font-normal ml-1.5">
                • {SymbolParser.formatSymbol(currentStepTitle)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {percentage}% ukończono
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.7)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Segment Markers */}
      <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] font-mono text-slate-500">
        {Array.from({ length: safeTotal }, (_, i) => i + 1).map((stepIndex) => {
          const isPassed = stepIndex < clampedStep;
          const isCurrent = stepIndex === clampedStep;

          return (
            <span
              key={stepIndex}
              className={`flex items-center gap-1 transition-colors ${
                isCurrent
                  ? 'text-cyan-300 font-bold'
                  : isPassed
                  ? 'text-emerald-400 font-medium'
                  : 'text-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent
                    ? 'bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse'
                    : isPassed
                    ? 'bg-emerald-400'
                    : 'bg-slate-700'
                }`}
              />
              <span className="hidden sm:inline">Etap {stepIndex}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
