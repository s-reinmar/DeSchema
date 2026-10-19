/**
 * @file SocraticProgressBar.tsx
 * @description Accessible, animated progress bar visualizing the current stage of circuit schematic analysis,
 * with adaptive high-contrast styling for both Dark and Light themes.
 * @author @s-reinmar
 * @license MIT
 */

import React from 'react';
import { CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { SymbolParser } from '../utils/symbol-parser.ts';
import { useTheme } from '../context/ThemeContext.tsx';

/**
 * Properties for SocraticProgressBar.
 */
interface Props {
  readonly currentStepNumber: number;
  readonly totalSteps: number;
  readonly currentStepTitle?: string;
}

/**
 * Visual progress bar tracking pedagogical completion across circuit analysis steps.
 */
export const SocraticProgressBar: React.FC<Props> = ({
  currentStepNumber,
  totalSteps,
  currentStepTitle,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
      className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col gap-2.5 transition-all duration-200 ${
        isLight
          ? 'bg-white border-slate-200 shadow-md text-slate-900 ring-1 ring-slate-100/70'
          : 'bg-slate-900/90 border-slate-800 shadow-lg text-slate-100 backdrop-blur-sm'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isLight
                ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            ) : (
              <Flame className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'} animate-pulse`} />
            )}
          </div>
          <div>
            <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              Postęp analizy schematu:
            </span>{' '}
            <span
              className={`font-mono font-semibold ${
                isLight ? 'text-cyan-700 font-bold' : 'text-cyan-300'
              }`}
            >
              Krok {clampedStep} z {safeTotal}
            </span>
            {currentStepTitle && (
              <span className={`hidden md:inline font-normal ml-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                • {SymbolParser.formatSymbol(currentStepTitle)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] border flex items-center gap-1 ${
              isLight
                ? 'bg-cyan-50 text-cyan-800 border-cyan-200 shadow-xs'
                : 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            {percentage}% ukończono
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div
        className={`relative w-full h-2.5 rounded-full overflow-hidden border p-0.5 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.7)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Segment Markers */}
      <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] font-mono">
        {Array.from({ length: safeTotal }, (_, i) => i + 1).map((stepIndex) => {
          const isPassed = stepIndex < clampedStep;
          const isCurrent = stepIndex === clampedStep;

          return (
            <span
              key={stepIndex}
              className={`flex items-center gap-1 transition-colors ${
                isCurrent
                  ? isLight
                    ? 'text-cyan-700 font-bold'
                    : 'text-cyan-300 font-bold'
                  : isPassed
                  ? isLight
                    ? 'text-emerald-700 font-medium'
                    : 'text-emerald-400 font-medium'
                  : isLight
                  ? 'text-slate-400'
                  : 'text-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent
                    ? isLight
                      ? 'bg-cyan-600 ring-2 ring-cyan-500/30 animate-pulse'
                      : 'bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse'
                    : isPassed
                    ? isLight
                      ? 'bg-emerald-600'
                      : 'bg-emerald-400'
                    : isLight
                    ? 'bg-slate-300'
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
