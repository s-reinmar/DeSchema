/**
 * @file SettingsDropdown.tsx
 * @description Accessible settings dropdown menu for AI engine, deep thinking mode, language, and future controls.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Cpu, BrainCircuit, Globe, Sliders, ChevronDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.tsx';
import type { AvailableAiModel, AppLanguage } from '../../types/navigation.types.ts';

const AI_MODELS: readonly { readonly id: AvailableAiModel; readonly name: string; readonly badge: string }[] = [
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', badge: 'Token-Safe' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Zbalansowany' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', badge: 'Myślenie & STEM' },
];

export const SettingsDropdown: React.FC = () => {
  const { settings, setAiModel, setDeepThinking, setLanguage } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Ustawienia aplikacji"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer ${
          isOpen
            ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
        }`}
      >
        <Settings className="w-4 h-4 text-cyan-400" />
        <span>Ustawienia</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Panel ustawień"
          className="absolute right-0 mt-2 w-80 sm:w-88 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-md z-50 animate-fade-in text-slate-200 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              Konfiguracja środowiska
            </h3>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Live State
            </span>
          </div>

          {/* 1. Silnik AI */}
          <div className="space-y-2">
            <label htmlFor="ai-model-select" className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Silnik modelu AI
            </label>
            <div className="relative">
              <select
                id="ai-model-select"
                value={settings.aiModel}
                onChange={(e) => setAiModel(e.target.value as AvailableAiModel)}
                className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Deep Thinking Mode Checkbox */}
            <label
              htmlFor="deep-thinking-toggle"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className={`w-4 h-4 ${settings.deepThinking ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Deep Thinking Mode</span>
                  <span className="text-[10px] text-slate-400">Wyższy budżet myślenia i precyzja praw fizyki</span>
                </div>
              </div>
              <input
                id="deep-thinking-toggle"
                type="checkbox"
                checked={settings.deepThinking}
                onChange={(e) => setDeepThinking(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* 2. Język interfejsu (Atrapa UI PL/EN) */}
          <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
            <label htmlFor="language-select" className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Język interfejsu
            </label>
            <div className="relative">
              <select
                id="language-select"
                value={settings.language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              >
                <option value="PL">🇵🇱 Polski (Domyślny)</option>
                <option value="EN">🇬🇧 English (Preview UI)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* 3. Sterowanie (Placeholder / Disabled) */}
          <div className="space-y-1.5 border-t border-slate-800/80 pt-3 opacity-55">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Sterowanie i mapowanie klawiszy
              </span>
              <span className="text-[9px] font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                Wkrótce
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-[11px] text-slate-500">
              Personalizacja gestów myszy, czułości zoomu oraz niestandardowych skrótów klawiszowych.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
