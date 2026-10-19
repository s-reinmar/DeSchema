/**
 * @file SocraticStepSection.tsx
 * @description 4-stage Socratic step exploration panel embedding SocraticChatPanel and step inquiry questions.
 * @author s-reinmar
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
import { SocraticChatPanel } from './SocraticChatPanel.tsx';

interface Props {
  readonly circuit?: Circuit;
  readonly steps: readonly SocraticStep[];
  readonly currentStepNumber: 1 | 2 | 3 | 4;
  readonly onStepChange: (stepNumber: 1 | 2 | 3 | 4) => void;
}

export const SocraticStepSection: React.FC<Props> = ({
  circuit,
  steps,
  currentStepNumber,
  onStepChange,
}) => {
  const currentStep = steps.find((s) => s.stepNumber === currentStepNumber) ?? steps[0];

  const [showHint, setShowHint] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const handleStepSelect = (stepNum: 1 | 2 | 3 | 4) => {
    onStepChange(stepNum);
    setShowHint(false);
    setShowReflection(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 4 Steps Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {steps.map((st) => {
          const isSelected = st.stepNumber === currentStepNumber;
          return (
            <button
              key={st.stepNumber}
              onClick={() => handleStepSelect(st.stepNumber)}
              className={`p-3 rounded-2xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between shadow-md ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/90 to-cyan-950/70 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-white'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Krok {st.stepNumber}
                </span>
                {isSelected && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <span className="text-xs font-semibold line-clamp-1 mt-1">
                {SymbolParser.formatRichScientificText(st.title)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Socratic Question Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col gap-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
              Pytanie sokratejskie • Krok {currentStep.stepNumber} z 4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
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
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{showHint ? 'Ukryj naprowadzenie' : '💡 Potrzebuję naprowadzenia'}</span>
          </button>

          <button
            onClick={() => setShowReflection(!showReflection)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showReflection
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {showReflection ? 'Ukryj weryfikację' : '🔍 Zweryfikuj swoje myślenie'}
            </span>
          </button>
        </div>

        {/* Clue/Hint Box */}
        {showHint && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed animate-fade-in flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 mb-1">Kierunek poszukiwań:</strong>
              {SymbolParser.formatRichScientificText(currentStep.hint)}
            </div>
          </div>
        )}

        {/* Reflection / Deep Answer Box */}
        {showReflection && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-100 text-xs sm:text-sm leading-relaxed animate-fade-in flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-300 mb-1">
                Weryfikacja fizyczna i wyjaśnienie zjawiska:
              </strong>
              {SymbolParser.formatRichScientificText(currentStep.reflectionAnswer)}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Left Panel Chatbot */}
      <SocraticChatPanel circuit={circuit} currentStep={currentStep} />
    </div>
  );
};
