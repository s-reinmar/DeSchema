/**
 * @file WhyWeDidThisModal.tsx
 * @description Educational philosophy modal explaining the Socratic inquiry design choices.
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';
import { X, HelpCircle, Compass, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const WhyWeDidThisModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dlaczego tak zrobiliśmy?
            </h2>
            <p className="text-sm text-slate-400">
              Filozofia dydaktyczna DeSchema Mentor i pedagogika sokratejska
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              1. Cierpliwy dialog zamiast gotowców
            </h3>
            <p className="text-slate-300">
              Klasyczne podręczniki i kalkulatory natychmiast wyrzucają gotowy wzór lub wynik liczbowy.
              Powoduje to iluzję zrozumienia — wiesz, co wpisać, ale nie rozumiesz, <em>dlaczego</em> układ
              działa w dany sposób. DeSchema Mentor nie daje gotowych odpowiedzi na tacy: zadaje pytania,
              które zmuszają do prześledzenia drogi ładunków i potencjałów.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              2. 4-poziomowa dekompozycja poznawcza
            </h3>
            <p className="text-slate-300 mb-2">
              Każdy schemat elektroniczny analizujemy według niezmiennego, 4-etapowego schematu myślowego:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Krok 1:</strong> Topologia i polaryzacja</span>
              </li>
              <li className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Krok 2:</strong> Punkty spoczynkowe DC</span>
              </li>
              <li className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Krok 3:</strong> Dynamika i wzmocnienie AC</span>
              </li>
              <li className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Krok 4:</strong> Granice i odporność (stres)</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              3. Optyczna interakcja ze schematem
            </h3>
            <p className="text-slate-300">
              Wybór każdego kroku podświetla w czasie rzeczywistym krytyczne elementy schematu
              oraz węzły pomiarowe. Zamiast szukać komponentów w gąszczu linii, Twoja uwaga skupia się na
              fragmencie, w którym aktualnie zachodzi zjawisko fizyczne.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            Rozumiem, wróć do analizy
          </button>
        </div>
      </div>
    </div>
  );
};
