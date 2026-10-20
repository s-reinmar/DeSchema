/**
 * @file TokenSafeSvgUploadModal.tsx
 * @description Dedicated modal for uploading and pasting raw SVG circuit schematics with Token-Safe optimization.
 * Features live token economy benchmarks, metadata stripping, coordinate precision compression, and Cloud SQL saving.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Zap,
  Clock,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { svgTokenOptimizer } from '../../services/svg-token-optimizer.service.ts';
import type { OptimizedSvgResult } from '../../interfaces/svg-token-optimizer.interface.ts';
import type { Circuit } from '../../types/circuit.types.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaveCircuit: (circuit: Circuit) => Promise<void>;
}

export const TokenSafeSvgUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveCircuit,
}) => {
  const [rawSvgInput, setRawSvgInput] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [optimizedResult, setOptimizedResult] = useState<OptimizedSvgResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!rawSvgInput.trim()) {
      setOptimizedResult(null);
      return;
    }
    const result = svgTokenOptimizer.optimizeSvg(rawSvgInput);
    setOptimizedResult(result);
  }, [rawSvgInput]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setSubmitError('Wymagany jest plik wektorowy w formacie .svg');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setRawSvgInput(content);
        setSubmitError(null);
        if (!title) {
          const autoTitle = file.name.replace(/\.svg$/i, '').replace(/[-_]/g, ' ');
          setTitle(autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError('Podaj tytuł nowego obwodu.');
      return;
    }
    if (!optimizedResult || !optimizedResult.report.isValid) {
      setSubmitError('Wprowadzony kod SVG nie spełnia rygorystycznych reguł Token-Safe.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const generatedId = `custom-svg-${Date.now()}`;
      const symbols = optimizedResult.report.detectedSymbols.length > 0
        ? optimizedResult.report.detectedSymbols
        : [
            {
              id: 'elem-1',
              label: 'V_1',
              name: 'Główne źródło obwodu',
              x: 100,
              y: 100,
              explanation: 'Punkt odniesienia potencjału.',
            },
          ];

      const newCircuit: Circuit = {
        id: generatedId,
        title: title.trim(),
        description: description.trim() || 'Układ wprowadzony przez moduł Token-Safe SVG Upload.',
        svgViewBox: optimizedResult.viewBox,
        svgContent: optimizedResult.cleanSvgContent,
        isCustom: true,
        symbols,
        socraticSteps: [
          {
            stepNumber: 1,
            title: 'Analiza architektury schematu',
            promptQuestion: 'Jakie główne gałęzie i pętle występują w zaimportowanym układzie wektorowym?',
            hint: 'Prześledź drogę prądu od węzła zasilania ku masie obwodu.',
            reflectionAnswer: 'Układ posiada zdefiniowane węzły i elementy aktywne.',
            targetSymbolIds: symbols.map((s) => s.id).slice(0, 2),
          },
          {
            stepNumber: 2,
            title: 'Bilans potencjałów i prawo Ohma',
            promptQuestion: 'Na których elementach zaobserwujemy dominujące spadki napięć?',
            hint: 'Zastosuj II Prawo Kirchhoffa dla głównego oczka.',
            reflectionAnswer: 'Suma spadków napięć równoważy napięcie źródła.',
            targetSymbolIds: symbols.map((s) => s.id).slice(0, 3),
          },
          {
            stepNumber: 3,
            title: 'Charakterystyka punktu pracy',
            promptQuestion: 'W jaki sposób dobrane komponenty wpływają na stabilność układu?',
            hint: 'Zwróć uwagę na tolerancję i rolę sprzężenia zwrotnego.',
            reflectionAnswer: 'Właściwy dobór parametrów zapewnia odporność na wahania zasilania.',
            targetSymbolIds: symbols.map((s) => s.id).slice(1, 4),
          },
          {
            stepNumber: 4,
            title: 'Wnioski projektowe i optymalizacja',
            promptQuestion: 'Jakie warunki graniczne muszą zostać spełnione, aby układ nie uległ uszkodzeniu?',
            hint: 'Oceń moc traconą i maksymalne napięcia zaporowe.',
            reflectionAnswer: 'Moc wydzielana na złączach i rezystorach nie przekracza dopuszczalnych norm.',
            targetSymbolIds: symbols.map((s) => s.id),
          },
        ],
      };

      await onSaveCircuit(newCircuit);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd zapisu obwodu w bazie danych.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rep = optimizedResult?.report;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-safe-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Zap className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h2 id="token-safe-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Wgraj Schemat SVG (Token Safe)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Optymalizacja Tokenów
                </span>
              </h2>
              <p className="text-xs text-slate-400">Rygorystyczne oczyszczanie metadanych edytorów, kompresja i weryfikacja XSS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            aria-label="Zamknij okno"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {submitError && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30'
                : 'border-slate-700 hover:border-cyan-500/50 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload className="w-6 h-6 text-cyan-400" />
            <p className="text-xs font-semibold text-slate-200">
              Przeciągnij i upuść plik <span className="text-cyan-300">.SVG</span> lub kliknij, aby wybrać
            </p>
            <p className="text-[11px] text-slate-500">
              Maks. rozmiar: 150 KB • Dozwolone tylko wektory schematów bez skryptów
            </p>
          </div>

          {/* SVG Code Input Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lub wklej bezpośredni kod XML / SVG (Ctrl+V):
            </label>
            <textarea
              rows={4}
              value={rawSvgInput}
              onChange={(e) => setRawSvgInput(e.target.value)}
              placeholder="<svg viewBox='0 0 740 460'>...</svg>"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-mono text-cyan-300 placeholder-slate-600 outline-none transition resize-none"
            />
          </div>

          {/* Live Token-Safe Benchmark Metrics Banner */}
          {rep && (
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Raport Optymalizacji Token-Safe
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  Czas: {rep.executionTimeMs} ms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Rozmiar wejścia</span>
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {(rep.rawLengthBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Po optymalizacji</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {(rep.optimizedLengthBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estymacja tokenów</span>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {rep.rawTokensEstimated} → {rep.optimizedTokensEstimated}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/30 bg-emerald-500/5">
                  <span className="text-[10px] text-emerald-400 block">Oszczędność tokenów</span>
                  <span className="font-mono text-xs font-extrabold text-emerald-300">
                    -{rep.tokenSavingsPercent}%
                  </span>
                </div>
              </div>

              {rep.strippedMetadataCategories.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Usunięte zbędne metadane:</strong>{' '}
                  {rep.strippedMetadataCategories.join(' • ')}
                </div>
              )}

              {/* Visual preview */}
              {optimizedResult?.cleanSvgContent && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 pb-1.5 border-b border-slate-800 mb-2">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Eye className="w-3.5 h-3.5" />
                      Podgląd zoptymalizowanego wektora
                    </span>
                    <span>viewBox: {optimizedResult.viewBox}</span>
                  </div>
                  <div className="w-full max-h-40 overflow-hidden flex items-center justify-center">
                    <svg
                      viewBox={optimizedResult.viewBox}
                      className="w-full max-h-36 object-contain text-slate-200"
                      dangerouslySetInnerHTML={{ __html: optimizedResult.cleanSvgContent }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Meta Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tytuł schematu *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Zasilacz stabilizowany LM317"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Krótki opis układu
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="np. Liniowy stabilizator napięcia z regulacją..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          {/* Actions footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rawSvgInput.trim() || !optimizedResult?.report.isValid}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Zapisywanie w Cloud SQL...' : 'Zapisz zoptymalizowany schemat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
