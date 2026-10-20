/**
 * @file SocraticProgressBar.tsx
 * @description Accessible progress bar visualizing Socratic inquiry stages with discrete status markers
 * and true 100% completion celebration once all stages are resolved.
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
  readonly completedStepNumbers: readonly number[];
}

/**
 * Visual progress bar tracking pedagogical completion across circuit analysis steps.
 */
export const SocraticProgressBar: React.FC<Props> = ({
  currentStepNumber,
  totalSteps,
  currentStepTitle,
  completedStepNumbers,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const safeTotal = Math.max(totalSteps, 1);
  const clampedStep = Math.min(Math.max(currentStepNumber, 1), safeTotal);
  const completedCount = completedStepNumbers.filter((n) => n >= 1 && n <= safeTotal).length;
  const isAllCompleted = completedCount >= safeTotal;
  const progressPercent = Math.round((completedCount / safeTotal) * 100);

  return (
    <div
      role="progressbar"
      aria-label="Postęp analizy sokratejskiej schematu"
      aria-valuenow={completedCount}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuetext={
        isAllCompleted
          ? '100% ukończono'
          : `Krok ${clampedStep} z ${safeTotal} (Ukończono ${completedCount} z ${safeTotal} etapów)`
      }
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
            {isAllCompleted ? (
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

        {/* Completion Indicator: 100% only when all steps completed, otherwise discrete status */}
        <div className="flex items-center gap-1.5">
          {isAllCompleted ? (
            <span
              className={`px-3 py-1 rounded-full font-mono font-bold text-xs border flex items-center gap-1.5 animate-pulse ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>100% ukończono</span>
            </span>
          ) : (
            <div
              className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] border flex items-center gap-1.5 ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
              }`}
            >
              <span className="text-slate-400">Ukończono:</span>
              <span className={`font-bold ${completedCount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {completedCount}
              </span>
              <span className="text-slate-500">/</span>
              <span className="font-semibold text-slate-300">{safeTotal}</span>
              <span className="hidden sm:inline text-slate-400">etapów</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div
        className={`relative w-full h-2 rounded-full overflow-hidden border p-0.5 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isAllCompleted
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Discrete Segment Status Markers (Etapy 1-4) */}
      <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] font-mono">
        {Array.from({ length: safeTotal }, (_, i) => i + 1).map((stepIndex) => {
          const isDone = completedStepNumbers.includes(stepIndex);
          const isCurrent = stepIndex === clampedStep;

          return (
            <span
              key={stepIndex}
              className={`flex items-center gap-1 transition-colors ${
                isCurrent
                  ? isLight
                    ? 'text-cyan-700 font-bold'
                    : 'text-cyan-300 font-bold'
                  : isDone
                  ? isLight
                    ? 'text-emerald-700 font-medium'
                    : 'text-emerald-400 font-medium'
                  : isLight
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent
                    ? isLight
                      ? 'bg-cyan-600 ring-2 ring-cyan-500/30 animate-pulse'
                      : 'bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse'
                  : isDone
                  ? isLight
                    ? 'bg-emerald-600'
                    : 'bg-emerald-400'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-slate-700'
                }`}
              />
              <span className="hidden sm:inline">Etap {stepIndex}:</span>
              <span
                className={`font-semibold ${
                  isDone
                    ? 'text-emerald-400'
                    : isCurrent
                    ? 'text-cyan-300'
                    : 'text-slate-500'
                }`}
              >
                {isDone ? 'Tak' : 'Nie'}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
