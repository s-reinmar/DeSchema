/**
 * @file HelpDrawer.tsx
 * @description Accessible side drawer presenting chat controls, keyboard shortcuts, and the prompt database.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useEffect } from 'react';
import {
  X,
  HelpCircle,
  Keyboard,
  Lightbulb,
  Compass,
  FileCheck2,
  BookOpen,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.tsx';
import type { ChatShortcutItem, HelpPromptItem } from '../../types/navigation.types.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenCheatsheet: () => void;
}

const CHAT_SHORTCUTS: readonly ChatShortcutItem[] = [
  { keyCombo: 'Enter', description: 'Wyślij wiadomość do mentora' },
  { keyCombo: 'Shift + Enter', description: 'Nowy wiersz w polu wprowadzania' },
  { keyCombo: 'Esc', description: 'Zamknij aktywne panele i okna pomocnicze' },
  { keyCombo: '← / →', description: 'Nawigacja pomiędzy schematami obwodów' },
];

const PROMPT_DATABASE: readonly (HelpPromptItem & { readonly icon: React.FC<{ className?: string }>; readonly color: string })[] = [
  {
    id: 'hint',
    label: 'Wskazówka',
    description: 'Subtelne naprowadzenie na właściwe prawo fizyki lub kierunek poszukiwań.',
    prompt: 'Poproszę o subtelną wskazówkę lub pytanie pomocnicze, które naprowadzi mnie na właściwe prawo fizyki.',
    icon: Lightbulb,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20',
  },
  {
    id: 'simpler',
    label: 'Wyjaśnij prościej',
    description: 'Tłumaczenie zjawiska za pomocą intuicyjnej analogii bez zbędnego żargonu.',
    prompt: 'Czy możesz wyjaśnić to zjawisko prościej, na intuicyjnej analogii fizycznej bez skomplikowanych żargonów?',
    icon: Compass,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  {
    id: 'why',
    label: 'Dlaczego tak zrobiliśmy',
    description: 'Uzasadnienie metodyczne: dlaczego analizujemy akurat te elementy w tym kroku.',
    prompt: 'Dlaczego w tym kroku analizujemy akurat ten aspekt obwodu i jaką rolę pełnią podświetlone elementy?',
    icon: HelpCircle,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
  },
  {
    id: 'cheatsheet',
    label: 'Ściągawka praw',
    description: 'Szybki podgląd fundamentalnych praw Ohma, Kirchhoffa i dzielników napięcia.',
    isSpecialAction: true,
    icon: BookOpen,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20',
  },
  {
    id: 'summary',
    label: 'Podsumujmy',
    description: 'Synteza najważniejszych wniosków, bilansu prądów i kluczowych zależności.',
    prompt: 'Podsumujmy najważniejsze wnioski z tego kroku: jakie kluczowe prawo fizyki i zależność tu rządzą?',
    icon: FileCheck2,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
  },
];

export const HelpDrawer: React.FC<Props> = ({ isOpen, onClose, onOpenCheatsheet }) => {
  const { triggerPrompt } = useSettings();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePromptClick = (item: typeof PROMPT_DATABASE[number]) => {
    if (item.isSpecialAction) {
      onOpenCheatsheet();
      onClose();
      return;
    }
    if (item.prompt) {
      triggerPrompt(item.prompt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in" role="dialog" aria-modal="true" aria-label="Panel pomocy i baza podpowiedzi">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-md">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Centrum Pomocy
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Sokrates
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Sterowanie czatem &amp; Baza podpowiedzi</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              aria-label="Zamknij pomoc"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {/* 1. Sterowanie czatem i skróty klawiszowe */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                Sterowanie czatem &amp; Skróty
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-start gap-2 text-slate-300">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Mentor DeSchema prowadzi Cię metodą pytań sokratejskich. Formułuj hipotezy, pytaj o kierunek przepływu ładunków lub prawa bilansu.
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                  {CHAT_SHORTCUTS.map((sc) => (
                    <div key={sc.keyCombo} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{sc.description}</span>
                      <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-cyan-300 font-semibold text-[10px]">
                        {sc.keyCombo}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Baza podpowiedzi */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Baza podpowiedzi
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">1-Click Prompt</span>
              </div>

              <p className="text-[11px] text-slate-400">
                Kliknięcie w podpowiedź natychmiast wysyła zapytanie do aktywnego mentora sokratejskiego w panelu bocznym.
              </p>

              <div className="space-y-2.5">
                {PROMPT_DATABASE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePromptClick(item)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${item.color}`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900/80 border border-current shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-bold text-xs text-white group-hover:text-cyan-200">
                          <span>{item.label}</span>
                          <Send className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-[11px] text-slate-300/80 mt-1 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>DeSchema Mentor v1.0.0</span>
            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
