/**
 * @file AboutModal.tsx
 * @description Application metadata modal displaying project information, license, and author details.
 * @author @s-reinmar
 * @license MIT
 */

import React from 'react';
import { X, Info, Cpu, ShieldCheck, User, Code, Heart, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">DeSchema</h2>
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                Mentor
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Wersja 1.0.0 Architecture &amp; AI Edition</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Opis programu
            </h3>
            <p className="text-slate-200 font-medium">
              Prowadzi krok po kroku * Analiza schematów i obwodów * Cierpliwy dialog bez gotowców.
            </p>
            <p className="mt-2 text-xs text-slate-400 leading-normal">
              Aplikacja łączy zaawansowaną wizualizację grafiki wektorowej SVG z silnikiem pedagogiki sokratejskiej.
              Czatbot wspierany modelami Google Gemini (Flash-Lite, Flash, Argon) nigdy nie podaje gotowych wyników liczbowych,
              lecz zadaje pytania naprowadzające oparte na prawach Ohma, Kirchhoffa oraz zjawiskach fizycznych w obwodzie.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Autor</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">@s-reinmar</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Licencja</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">Licencja MIT</p>
            </div>
          </div>

          {/* MIT License details box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              MIT License (Copyright © 2026 @s-reinmar):
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
              associated documentation files, to deal in the Software without restriction, including without limitation
              the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              Architektura i Zasady:
            </div>
            <div>• Separation of Concerns (Model / Domain / View / Service)</div>
            <div>• Dependency Inversion Principle (DIP &amp; IStorageService)</div>
            <div>• Strict TypeScript (Zero &apos;any&apos;, 100% otypowania)</div>
            <div>• Safety Cascade w serwerze Gemini API (Argon → Flash → Flash-Lite)</div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition text-xs sm:text-sm"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
