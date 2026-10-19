/**
 * @file CreateCircuitModal.tsx
 * @description Modal dialog for creating and persisting new electronic circuit schematics to Cloud SQL.
 * Provides SVG vector preview and validation of Socratic pedagogy stages.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { X, Save, AlertCircle, Eye, Sparkles } from 'lucide-react';
import type { Circuit } from '../../types/circuit.types.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaveCircuit: (circuit: Circuit) => Promise<void>;
}

export const CreateCircuitModal: React.FC<Props> = ({ isOpen, onClose, onSaveCircuit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [svgViewBox, setSvgViewBox] = useState('0 0 700 400');
  const [svgContent, setSvgContent] = useState(
    `<g class="circuit-layer">\n  <rect x="20" y="20" width="660" height="360" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.2"/>\n  <circle cx="150" cy="200" r="30" fill="none" stroke="currentColor" stroke-width="2"/>\n  <text x="150" y="205" text-anchor="middle" fill="currentColor" font-size="14">V1</text>\n  <line x1="180" y1="200" x2="350" y2="200" stroke="currentColor" stroke-width="2"/>\n  <rect x="350" y="185" width="60" height="30" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2"/>\n  <text x="380" y="205" text-anchor="middle" fill="currentColor" font-size="13">R1</text>\n  <line x1="410" y1="200" x2="550" y2="200" stroke="currentColor" stroke-width="2"/>\n</g>`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Podaj tytuł nowego obwodu.');
      return;
    }
    if (!svgContent.trim()) {
      setErrorMessage('Kod wektora SVG nie może być pusty.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const generatedId = `custom-${Date.now()}`;
      const newCircuit: Circuit = {
        id: generatedId,
        title: title.trim(),
        description: description.trim(),
        svgViewBox: svgViewBox.trim() || '0 0 700 400',
        svgContent: svgContent.trim(),
        isCustom: true,
        symbols: [
          {
            id: 'elem-1',
            label: 'R_1',
            name: 'Rezystor obciążenia',
            x: 380,
            y: 200,
            physicalRole: 'Ogranicza prąd przepływający w gałęzi zgodnie z prawem Ohma.',
            formula: 'I = U / R_1',
            explanation: 'Główny rezystor w analizowanym obwodzie.',
          },
        ],
        socraticSteps: [
          {
            stepNumber: 1,
            title: 'Analiza architektury wstępnej',
            promptQuestion: 'Jaki rodzaj źródła zasila prezentowany obwód i w którą stronę popłynie prąd?',
            hint: 'Zwróć uwagę na biegunowość źródła oraz połączenie szeregowe elementów.',
            reflectionAnswer: 'Prąd wypływa z dodatniego zacisku źródła i płynie przez rezystor ku masie.',
            targetSymbolIds: ['elem-1'],
          },
        ],
      };

      await onSaveCircuit(newCircuit);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd zapisu obwodu w bazie danych.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Nowy Obwód w Cloud SQL
              </h2>
              <p className="text-xs text-slate-400">Dodaj własny schemat z wektorem SVG do prywatnej bazy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tytuł obwodu *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Mostek Graetza z filtrem wygładzającym"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Opis pedagogiczny
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis zjawiska fizycznego i celu dydaktycznego..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SVG viewBox
              </label>
              <input
                type="text"
                value={svgViewBox}
                onChange={(e) => setSvgViewBox(e.target.value)}
                placeholder="0 0 700 400"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-mono text-cyan-300 outline-none transition"
              />
            </div>
            <div className="flex items-end pb-1 text-[11px] text-slate-400">
              Format: minX minY szerokość wysokość
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Zawartość wektorowa SVG (&lt;g&gt;...&lt;/g&gt;) *
              </label>
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <Eye className="w-3 h-3" /> Podgląd na żywo
              </span>
            </div>
            <textarea
              rows={5}
              required
              value={svgContent}
              onChange={(e) => setSvgContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-mono text-slate-300 placeholder-slate-600 outline-none transition resize-none"
            />
          </div>

          {/* Live SVG Preview Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Podgląd wektora:
            </div>
            <div className="w-full h-36 bg-slate-900/80 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800/80">
              <svg
                viewBox={svgViewBox}
                className="w-full h-full text-cyan-400 p-2"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Zapisywanie w bazie...' : 'Zapisz w Cloud SQL'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
