/**
 * @file SocraticChatPanel.tsx
 * @description Dedicated left panel Socratic Mentor chatbot with model selector, thinking mode, quick actions, and formula rendering.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  BrainCircuit,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { Circuit, SocraticStep } from '../types/circuit.types.ts';
import { SymbolParser } from '../utils/symbol-parser.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import type { AvailableAiModel } from '../types/navigation.types.ts';

interface Props {
  readonly circuit?: Circuit;
  readonly currentStep: SocraticStep;
  readonly messages?: readonly ChatMessage[];
  readonly onMessagesChange?: (messages: readonly ChatMessage[]) => void;
  readonly onStepAutoCompleted?: (stepNumber: number) => void;
}

export type AvailableModel = AvailableAiModel;

export interface ChatMessage {
  readonly id: string;
  readonly role: 'student' | 'mentor';
  readonly text: string;
  readonly modelUsed?: string;
  readonly fallbackTriggered?: boolean;
  readonly isThinkingActive?: boolean;
  readonly stepCompleted?: boolean;
  readonly timestamp: string;
}

export const SocraticChatPanel: React.FC<Props> = ({
  circuit,
  currentStep,
  messages: externalMessages,
  onMessagesChange,
  onStepAutoCompleted,
}) => {
  const { settings, registerPromptListener } = useSettings();
  const selectedModel = settings.aiModel;
  const thinkingEnabled = settings.deepThinking;

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [internalMessages, setInternalMessages] = useState<readonly ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'mentor',
      text: 'Witaj! Jestem Twoim cierpliwym mentorem DeSchema. Nie podam Ci gotowych wyników liczbowych, lecz pomogę Ci samodzielnie prześledzić drogę ładunków, potencjałów i zjawisk w obwodzie. Jaka jest Twoja hipoteza do obecnego kroku?',
      modelUsed: 'gemini-3.5-flash-lite',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const messages = externalMessages ?? internalMessages;

  const setMessages = (
    updater:
      | readonly ChatMessage[]
      | ((prev: readonly ChatMessage[]) => readonly ChatMessage[])
  ) => {
    const next = typeof updater === 'function' ? updater(messages) : updater;
    setInternalMessages(next);
    onMessagesChange?.(next);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const executeSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Nie zaliczamy kroku przedwcześnie – zaliczeniem steruje czat po poprawnej odpowiedzi
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
        stepCompleted?: boolean;
      };

      const rawText = data.text ?? 'Zastanówmy się nad bilansem napięć w tym oczku obwodu.';
      const isCompleted = Boolean(data.stepCompleted || rawText.includes('[STEP_COMPLETED]'));
      const cleanedText = rawText.replace(/\[STEP_COMPLETED\]/g, '').trim();

      // Zaliczenie etapu wyłącznie po poprawnej odpowiedzi zweryfikowanej przez mentora
      if (isCompleted) {
        onStepAutoCompleted?.(currentStep.stepNumber);
      }

      const mentorMsg: ChatMessage = {
        id: `msg-${Date.now()}-mentor`,
        role: 'mentor',
        text: cleanedText,
        modelUsed: data.usedModel ?? selectedModel,
        fallbackTriggered: data.fallbackTriggered,
        isThinkingActive: data.thinkingActive,
        stepCompleted: isCompleted,
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
        stepCompleted: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeSendRef = useRef(executeSend);
  executeSendRef.current = executeSend;

  useEffect(() => {
    return registerPromptListener((promptText: string) => {
      executeSendRef.current(promptText);
    });
  }, [registerPromptListener]);

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
        role: 'mentor' as const,
        text: 'Wyczyściłem historię rozmowy. Przedstaw swoje pytanie lub hipotezę dotyczącą analizowanego schematu!',
        modelUsed: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-sm">
      {/* 1. Nagłówek czatu */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
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

        {/* Akcje czatu: czyszczenie dialogu */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition border border-slate-800/80 hover:border-slate-700"
            title="Wyczyść dialog"
            aria-label="Wyczyść dialog"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Wyczyść</span>
          </button>
        </div>
      </div>

      {/* 2. Lista wiadomości z formatowaniem wzorów fizycznych i toku myślenia */}
      <div className="p-4 sm:p-5 flex-1 min-h-[300px] max-h-[460px] overflow-y-auto space-y-3.5 text-xs bg-slate-950/60 no-scrollbar">
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

                {isMentor && msg.stepCompleted && (
                  <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-2 animate-fade-in shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>✓ Etap zaliczony poprawną odpowiedzią!</span>
                  </div>
                )}

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
