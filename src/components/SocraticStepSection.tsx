/**
 * @file SocraticStepSection.tsx
 * @description 4-stage Socratic step exploration panel embedding SocraticChatPanel and step inquiry questions,
 * with full visual responsiveness and seamless adaptation to Dark and Light themes.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { Circuit, SocraticStep } from '../types/circuit.types.ts';
import { SymbolParser } from '../utils/symbol-parser.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { SocraticProgressBar } from './SocraticProgressBar.tsx';
import { SocraticChatPanel, type ChatMessage } from './SocraticChatPanel.tsx';

/**
 * Properties for the SocraticStepSection component.
 */
interface Props {
  readonly circuit?: Circuit;
  readonly steps: readonly SocraticStep[];
  readonly currentStepNumber: 1 | 2 | 3 | 4;
  readonly onStepChange: (stepNumber: 1 | 2 | 3 | 4) => void;
  readonly messages?: readonly ChatMessage[];
  readonly onMessagesChange?: (messages: readonly ChatMessage[]) => void;
}

/**
 * Socratic step inquiry section guiding the user step-by-step through circuit physical laws.
 */
export const SocraticStepSection: React.FC<Props> = ({
  circuit,
  steps,
  currentStepNumber,
  onStepChange,
  messages,
  onMessagesChange,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const currentStep = steps.find((s) => s.stepNumber === currentStepNumber) ?? steps[0];

  const [showHint, setShowHint] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const handleStepSelect = (stepNum: 1 | 2 | 3 | 4) => {
    onStepChange(stepNum);
    setShowHint(false);
    setShowReflection(false);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 1. Visual Progress Bar Indicator */}
      <SocraticProgressBar
        currentStepNumber={currentStepNumber}
        totalSteps={steps.length}
        currentStepTitle={currentStep.title}
      />

      {/* 2. 4 Steps Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {steps.map((st) => {
          const isSelected = st.stepNumber === currentStepNumber;
          return (
            <button
              key={st.stepNumber}
              onClick={() => handleStepSelect(st.stepNumber)}
              className={`p-3 rounded-2xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between shadow-xs ${
                isSelected
                  ? isLight
                    ? 'bg-white border-cyan-500 shadow-md text-slate-900 ring-2 ring-cyan-500/20'
                    : 'bg-gradient-to-br from-indigo-950/90 to-cyan-950/70 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white'
                  : isLight
                  ? 'bg-white/80 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs hover:bg-white'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected
                      ? isLight
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-cyan-500 text-slate-950 font-bold'
                      : isLight
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Krok {st.stepNumber}
                </span>
                {isSelected && (
                  <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                )}
              </div>
              <span className="text-xs font-semibold line-clamp-1 mt-1">
                {SymbolParser.formatRichScientificText(st.title)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Socratic Question Card ("Panel z pytaniem") */}
      <div
        className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all duration-200 ${
          isLight
            ? 'bg-white border-slate-200/90 text-slate-900 shadow-md ring-1 ring-slate-100/80'
            : 'bg-gradient-to-r from-slate-950 to-slate-900 border-slate-800 text-white shadow-xl'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              isLight
                ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span
              className={`text-xs uppercase tracking-wider font-bold ${
                isLight ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            >
              Pytanie sokratejskie • Krok {currentStep.stepNumber} z 4
            </span>
            <h2
              className={`text-base sm:text-lg font-bold mt-1 leading-snug ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {SymbolParser.formatRichScientificText(currentStep.promptQuestion)}
            </h2>
          </div>
        </div>

        {/* Buttons for Hint and Reflection */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={() => setShowHint(!showHint)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showHint
                ? isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
            <span>{showHint ? 'Ukryj naprowadzenie' : '💡 Potrzebuję naprowadzenia'}</span>
          </button>

          <button
            onClick={() => setShowReflection(!showReflection)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showReflection
                ? isLight
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>
              {showReflection ? 'Ukryj weryfikację' : '🔍 Zweryfikuj swoje myślenie'}
            </span>
          </button>
        </div>

        {/* Clue / Hint Box */}
        {showHint && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed animate-fade-in flex items-start gap-2.5 ${
              isLight
                ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-xs'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
            }`}
          >
            <Lightbulb
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isLight ? 'text-amber-600' : 'text-amber-400'
              }`}
            />
            <div>
              <strong
                className={`block mb-1 ${
                  isLight ? 'text-amber-900 font-bold' : 'text-amber-300'
                }`}
              >
                Kierunek poszukiwań:
              </strong>
              {SymbolParser.formatRichScientificText(currentStep.hint)}
            </div>
          </div>
        )}

        {/* Reflection / Deep Answer Box */}
        {showReflection && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed animate-fade-in flex items-start gap-2.5 ${
              isLight
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isLight ? 'text-emerald-600' : 'text-emerald-400'
              }`}
            />
            <div>
              <strong
                className={`block mb-1 ${
                  isLight ? 'text-emerald-900 font-bold' : 'text-emerald-300'
                }`}
              >
                Weryfikacja fizyczna i wyjaśnienie zjawiska:
              </strong>
              {SymbolParser.formatRichScientificText(currentStep.reflectionAnswer)}
            </div>
          </div>
        )}
      </div>

      {/* 4. Dedicated Left Panel Chatbot */}
      <SocraticChatPanel
        circuit={circuit}
        currentStep={currentStep}
        messages={messages}
        onMessagesChange={onMessagesChange}
      />
    </div>
  );
};
