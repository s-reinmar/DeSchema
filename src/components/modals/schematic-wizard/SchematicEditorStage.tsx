/**
 * @file SchematicEditorStage.tsx
 * @description Interactive editor and preview stage for synthesized circuits.
 * Allows tweaking metadata, vector SVG elements, and 4 Socratic pedagogy steps before database persistence.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { Eye, HelpCircle, Cpu, Check, AlertCircle, Layers } from 'lucide-react';
import type { CircuitAnalysisResult } from '../../../interfaces/circuit-analyzer.interface.ts';
import type { Circuit, SocraticStep, CircuitSymbol } from '../../../types/circuit.types.ts';

interface Props {
  readonly initialData: CircuitAnalysisResult;
  readonly originalImageUrl?: string | null;
  readonly onSave: (circuit: Circuit) => Promise<void>;
  readonly onBack: () => void;
  readonly isSaving: boolean;
}

export const SchematicEditorStage: React.FC<Props> = ({
  initialData,
  originalImageUrl,
  onSave,
  onBack,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'questions' | 'symbols' | 'svgSource'>('preview');
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [svgViewBox, setSvgViewBox] = useState(initialData.svgViewBox || '0 0 700 400');
  const [svgContent, setSvgContent] = useState(initialData.svgContent);
  const [steps, setSteps] = useState<SocraticStep[]>([...initialData.socraticSteps]);
  const [symbols, setSymbols] = useState<CircuitSymbol[]>([...initialData.symbols]);
  const [previewMode, setPreviewMode] = useState<'svg' | 'image' | 'split'>('svg');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleUpdateStep = (index: number, updatedFields: Partial<SocraticStep>) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updatedFields };
      return next;
    });
  };

  const handleSaveClick = async () => {
    if (!title.trim()) {
      setValidationError('Podaj tytuł obwodu.');
      return;
    }
    if (!svgContent.trim()) {
      setValidationError('Wektor SVG nie może być pusty.');
      return;
    }
    setValidationError(null);

    const circuitToSave: Circuit = {
      id: `ai-gen-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      svgViewBox: svgViewBox.trim() || '0 0 700 400',
      svgContent: svgContent.trim(),
      symbols,
      socraticSteps: steps,
      isCustom: true,
    };

    await onSave(circuitToSave);
  };

  return (
    <div className="space-y-4">
      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Top Metadata row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tytuł układu
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            SVG ViewBox
          </label>
          <input
            type="text"
            value={svgViewBox}
            onChange={(e) => setSvgViewBox(e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'preview'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Podgląd Wizualny SVG</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>4 Pytania Sokratejskie ({steps.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('symbols')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'symbols'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Komponenty ({symbols.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('svgSource')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'svgSource'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Kod SVG</span>
        </button>
      </div>

      {/* Tab 1: Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-2">
          {originalImageUrl && (
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('svg')}
                className={`px-2 py-1 rounded ${previewMode === 'svg' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                Tylko Wektor SVG
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('split')}
                className={`px-2 py-1 rounded ${previewMode === 'split' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                Porównaj Obok Siebie
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('image')}
                className={`px-2 py-1 rounded ${previewMode === 'image' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                Oryginalny Obraz
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(previewMode === 'svg' || previewMode === 'split') && (
              <div className={`${previewMode === 'split' ? 'col-span-1' : 'md:col-span-2'} p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center min-h-[260px]`}>
                <svg
                  viewBox={svgViewBox}
                  className="w-full max-h-[320px] text-slate-800 dark:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>
            )}
            {(previewMode === 'image' || previewMode === 'split') && originalImageUrl && (
              <div className={`${previewMode === 'split' ? 'col-span-1' : 'md:col-span-2'} p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center min-h-[260px]`}>
                <img
                  src={originalImageUrl}
                  alt="Oryginalny schemat referencyjny"
                  className="max-h-[320px] object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 4 Socratic Steps */}
      {activeTab === 'questions' && (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {steps.map((step, idx) => (
            <div
              key={step.stepNumber}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                <span>Krok {step.stepNumber}: {step.title}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Symbole: {step.targetSymbolIds.join(', ') || 'Ogólne'}
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Pytanie sokratejskie:</label>
                <textarea
                  rows={2}
                  value={step.promptQuestion}
                  onChange={(e) => handleUpdateStep(idx, { promptQuestion: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Wskazówka (Hint):</label>
                  <textarea
                    rows={2}
                    value={step.hint}
                    onChange={(e) => handleUpdateStep(idx, { hint: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Wyjaśnienie / Refleksja:</label>
                  <textarea
                    rows={2}
                    value={step.reflectionAnswer}
                    onChange={(e) => handleUpdateStep(idx, { reflectionAnswer: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Symbols */}
      {activeTab === 'symbols' && (
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {symbols.map((sym, idx) => (
            <div
              key={sym.id}
              className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {sym.label} — {sym.name || sym.id}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Pozycja: ({sym.x}, {sym.y})
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rola: </span>
                {sym.physicalRole || sym.explanation}
              </div>
              {sym.formula && (
                <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  Wzór: {sym.formula}
                </div>
              )}
              {sym.typicalValue && (
                <div className="text-[11px] text-slate-500">
                  Typowa wartość: {sym.typicalValue}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: SVG Source */}
      {activeTab === 'svgSource' && (
        <div>
          <textarea
            rows={10}
            value={svgContent}
            onChange={(e) => setSvgContent(e.target.value)}
            className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Wróć do analizy obrazu
        </button>
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Zapisuję w bazie...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Zatwierdź i Zapisz Układ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
