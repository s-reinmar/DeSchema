/**
 * @file UploadModal.tsx
 * @description Upload and validation modal for custom circuit JSON files with localStorage persistence.
 * @author s-reinmar
 * @license MIT
 */

import React, { useRef, useState } from 'react';
import { X, Upload, FileCode, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import type { Circuit } from '../../types/circuit.types.ts';
import type { ICircuitRepository } from '../../interfaces/circuit-repository.interface.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly repository: ICircuitRepository;
  readonly onCircuitUploaded: (circuitId: string) => void;
}

export const UploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  repository,
  onCircuitUploaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessJsonString = (content: string) => {
    setErrors([]);
    setSuccessMessage(null);

    try {
      const parsed = JSON.parse(content) as unknown;
      const result = repository.validateCircuit(parsed);

      if (!result.isValid || !result.circuit) {
        setErrors(result.errors);
        return;
      }

      repository.saveCustomCircuit(result.circuit);
      setSuccessMessage(`Pomyślnie załadowano obwód: "${result.circuit.title}"`);
      onCircuitUploaded(result.circuit.id);

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setJsonText('');
      }, 1200);
    } catch (err) {
      setErrors([`Błąd parsowania JSON: ${err instanceof Error ? err.message : 'Nieznany błąd'}`]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setJsonText(content);
        handleProcessJsonString(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template: Circuit = {
      id: "moj-obwod-testowy",
      title: "Mój Własny Obwód Testowy",
      description: "Przykładowy szablon obwodu do analizy sokratejskiej.",
      svgViewBox: "0 0 600 300",
      svgContent: "<line x1=\"50\" y1=\"150\" x2=\"550\" y2=\"150\" stroke=\"currentColor\" stroke-width=\"3\"/><circle cx=\"300\" cy=\"150\" r=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"/><text x=\"300\" y=\"155\" font-size=\"14\" text-anchor=\"middle\" fill=\"currentColor\">R_1</text>",
      symbols: [
        {
          id: "R1",
          label: "R_1",
          x: 300,
          y: 150,
          explanation: "Przykładowy rezystor testowy."
        }
      ],
      socraticSteps: [
        {
          stepNumber: 1,
          title: "Topologia i węzły",
          promptQuestion: "Jak połączone są elementy w tym obwodzie?",
          hint: "Sprawdź węzły połączeń.",
          reflectionAnswer: "Elementy połączone są szeregowo.",
          targetSymbolIds: ["R1"]
        },
        {
          stepNumber: 2,
          title: "Punkt pracy",
          promptQuestion: "Jaki prąd płynie w gałęzi?",
          hint: "Zastosuj prawo Ohma.",
          reflectionAnswer: "I = V / R.",
          targetSymbolIds: ["R1"]
        },
        {
          stepNumber: 3,
          title: "Dynamika sygnału",
          promptQuestion: "Jak układ reaguje na zmianę napięcia?",
          hint: "Zależność jest liniowa.",
          reflectionAnswer: "Zmiana napięcia wywołuje proporcjonalną zmianę prądu.",
          targetSymbolIds: ["R1"]
        },
        {
          stepNumber: 4,
          title: "Stany graniczne",
          promptQuestion: "Co stanie się przy przekroczeniu mocy dopuszczalnej?",
          hint: "Zwróć uwagę na ciepło Joule'a.",
          reflectionAnswer: "Rezystor może ulec przegrzaniu (P = I^2 * R).",
          targetSymbolIds: ["R1"]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deschema-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Wgraj własny obwód JSON
            </h2>
            <p className="text-sm text-slate-400">
              Dodaj własny schemat z pytaniami sokratejskimi (zapis w localStorage)
            </p>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-indigo-600/25"
          >
            <FileCode className="w-4 h-4" />
            Wybierz plik .json z dysku
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm transition border border-slate-700"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Pobierz szablon JSON
          </button>
        </div>

        {/* Text area fallback */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Lub wklej zawartość pliku JSON:
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{ "id": "moj-obwod", "title": "...", "svgViewBox": "0 0 600 400", ... }'
            className="w-full h-44 p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" /> Błędy walidacji schematu:
            </div>
            {errors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm transition"
          >
            Anuluj
          </button>
          <button
            onClick={() => handleProcessJsonString(jsonText)}
            disabled={!jsonText.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition shadow-lg shadow-emerald-600/25"
          >
            Waliduj i zapisz
          </button>
        </div>
      </div>
    </div>
  );
};
