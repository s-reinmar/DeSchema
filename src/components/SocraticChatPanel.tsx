/**
 * @file SocraticChatPanel.tsx
 * @description Dedicated left panel Socratic Mentor chatbot with model selector, thinking mode, quick actions, and formula rendering.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Cpu,
  BrainCircuit,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Compass,
  FileCheck2,
} from 'lucide-react';
import type { Circuit, SocraticStep } from '../types/circuit.types.ts';
import { SymbolParser, formatSymbol } from '../utils/symbol-parser.ts';

interface Props {
  readonly circuit?: Circuit;
  readonly currentStep: SocraticStep;
}

export type AvailableModel = 'gemini-3.5-flash-lite' | 'gemini-3.8-flash' | 'gemini-4-argon';

export interface ChatMessage {
  readonly id: string;
  readonly role: 'student' | 'mentor';
  readonly text: string;
  readonly modelUsed?: string;
  readonly fallbackTriggered?: boolean;
  readonly isThinkingActive?: boolean;
  readonly timestamp: string;
}

const QUICK_ACTIONS = [
  {
    id: 'why',
    label: 'Dlaczego tak zrobiliśmy?',
    icon: HelpCircle,
    color: 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10',
    prompt: 'Dlaczego w tym kroku analizujemy akurat ten aspekt obwodu i jaką rolę pełnią podświetlone elementy?',
  },
  {
    id: 'hint',
    label: 'Wskazówka',
    icon: Lightbulb,
    color: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10',
    prompt: 'Poproszę o subtelną wskazówkę lub pytanie pomocnicze, które naprowadzi mnie na właściwe prawo fizyki.',
  },
  {
    id: 'simpler',
    label: 'Wyjaśnij prościej',
    icon: Compass,
    color: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10',
    prompt: 'Czy możesz wyjaśnić to zjawisko prościej, na intuicyjnej analogii fizycznej bez skomplikowanych żargonów?',
  },
  {
    id: 'summary',
    label: 'Podsumujmy',
    icon: FileCheck2,
    color: 'text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10',
    prompt: 'Podsumujmy najważniejsze wnioski z tego kroku: jakie kluczowe prawo fizyki i zależność tu rządzą?',
  },
] as const;

export const SocraticChatPanel: React.FC<Props> = ({ circuit, currentStep }) => {
  const [selectedModel, setSelectedModel] = useState<AvailableModel>('gemini-3.5-flash-lite');
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'mentor',
      text: 'Witaj! Jestem Twoim cierpliwym mentorem DeSchema. Nie podam Ci gotowych wyników liczbowych, lecz pomogę Ci samodzielnie prześledzić drogę ładunków, potencjałów i zjawisk w obwodzie. Jaka jest Twoja hipoteza do obecnego kroku?',
      modelUsed: 'gemini-3.5-flash-lite',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleModelSelect = (model: AvailableModel) => {
    setSelectedModel(model);
    if (model === 'gemini-4-argon') {
      setThinkingEnabled(true);
    }
  };

  const executeSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}-student`,
      role: 'student',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, studentMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newHistory.map((m) => ({ role: m.role, text: m.text })),
          circuitContext: circuit
            ? {
                id: circuit.id,
                title: circuit.title,
                description: circuit.description,
                stepNumber: currentStep.stepNumber,
                stepTitle: currentStep.title,
                stepPrompt: currentStep.promptQuestion,
                stepHint: currentStep.hint,
                symbols: circuit.symbols,
              }
            : undefined,
          selectedModel,
          thinkingEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = (await response.json()) as {
        text?: string;
        usedModel?: string;
        fallbackTriggered?: boolean;
        thinkingActive?: boolean;
      };

      const mentorMsg: ChatMessage = {
        id: `msg-${Date.now()}-mentor`,
        role: 'mentor',
        text: data.text ?? 'Zastanówmy się nad bilansem napięć w tym oczku obwodu.',
        modelUsed: data.usedModel ?? selectedModel,
        fallbackTriggered: data.fallbackTriggered,
        isThinkingActive: data.thinkingActive,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: 'mentor',
        text: 'Zwróć uwagę na I i II prawo Kirchhoffa dla tego fragmentu schematu. Co dzieje się z prądem w gałęzi głównej?',
        modelUsed: 'offline-socratic-heuristic',
        fallbackTriggered: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeSend(inputText);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'mentor',
        text: 'Wyczyściłem historię rozmowy. Przedstaw swoje pytanie lub hipotezę dotyczącą analizowanego schematu!',
        modelUsed: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-sm">
      {/* 1. Nagłówek czatu z selektorem modelu i przełącznikiem myślenia */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl shadow-md text-white">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white">DeSchema Mentor</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Sokratejski
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Cierpliwy dialog bez gotowców</p>
          </div>
        </div>

        {/* Model Selector & Thinking Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => handleModelSelect(e.target.value as AvailableModel)}
              className="pl-2.5 pr-7 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              title="Wybierz silnik Gemini"
            >
              <option value="gemini-3.5-flash-lite">⚡ Flash-Lite (Token-Safe)</option>
              <option value="gemini-3.8-flash">⚖️ Flash (Zbalansowany)</option>
              <option value="gemini-4-argon">🧠 Argon (Myślenie &amp; STEM)</option>
            </select>
            <Cpu className="pointer-events-none absolute right-2 top-2.5 w-3 h-3 text-slate-500" />
          </div>

          <label
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700 transition"
            title="Przełącznik trybu myślenia (Thinking Level HIGH dla Argon)"
          >
            <input
              type="checkbox"
              checked={thinkingEnabled}
              onChange={(e) => setThinkingEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-500 bg-slate-950 border-slate-700 focus:ring-0"
            />
            <BrainCircuit className={`w-3.5 h-3.5 ${thinkingEnabled ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px] font-semibold hidden sm:inline">Myślenie</span>
          </label>

          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Wyczyść dialog"
            aria-label="Wyczyść dialog"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Lista wiadomości z formatowaniem wzorów fizycznych i toku myślenia */}
      <div className="p-4 sm:p-5 flex-1 min-h-[300px] max-h-[460px] overflow-y-auto space-y-3.5 text-xs bg-slate-950/60">
        {messages.map((msg) => {
          const isMentor = msg.role === 'mentor';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMentor ? 'items-start' : 'items-end'} animate-fade-in`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[92%] sm:max-w-[85%] leading-relaxed ${
                  isMentor
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-md'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-sm shadow-md'
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-wider mb-1.5 opacity-80 pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isMentor ? (
                      <>
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Mentor DeSchema</span>
                      </>
                    ) : (
                      <span>Twoja hipoteza</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] opacity-80">
                    {msg.fallbackTriggered && (
                      <span
                        className="inline-flex items-center gap-0.5 text-amber-300"
                        title="Zadziałała kaskada zapasowa"
                      >
                        <AlertCircle className="w-2.5 h-2.5" />
                        Kaskada
                      </span>
                    )}
                    {msg.isThinkingActive && (
                      <span className="text-indigo-300 flex items-center gap-0.5">
                        <BrainCircuit className="w-2.5 h-2.5" />
                        Myślenie
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Formatted body */}
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {renderMessageTextWithFormulas(msg.text)}
                </div>

                {isMentor && msg.modelUsed && (
                  <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>Model: {msg.modelUsed}</span>
                    <span className="text-cyan-400">Metoda sokratejska</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-xs text-xs text-slate-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Mentor analizuje schemat i prawa fizyki...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Cztery szybkie akcje sokratejskie pod czatem */}
      <div className="px-3.5 py-2.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => executeSend(action.prompt)}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${action.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Pole tekstowe: Enter wysyła, Shift+Enter nowa linia + ikona wysyłania */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            disabled={isLoading}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Wpisz swoje przypuszczenie... (Enter = wyślij, Shift+Enter = nowa linia)"
            className="flex-1 p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-60"
          />
          <button
            onClick={() => executeSend(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition shadow-lg shadow-cyan-600/25 shrink-0"
            title="Wyślij wiadomość (Enter)"
            aria-label="Wyślij wiadomość"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* 5. Tekst przypominający: "Mentor pomoże Ci zrozumieć każdy krok" */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <strong className="text-slate-300">Mentor pomoże Ci zrozumieć każdy krok</strong>
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Enter ↵ wyślij | Shift+Enter nowa linia
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Splits message text into regular strings and formatted mathematical/physical formulas.
 */
function renderMessageTextWithFormulas(text: string): React.ReactNode {
  return SymbolParser.formatRichScientificText(text);
}
