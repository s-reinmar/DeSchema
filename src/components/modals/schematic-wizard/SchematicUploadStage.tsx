/**
 * @file SchematicUploadStage.tsx
 * @description Upload and clipboard paste stage for electronic schematic images.
 * Supports Drag & Drop, native Ctrl+V paste, and pedagogical prompt hints.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, FileText, X } from 'lucide-react';

interface Props {
  readonly onImageSelected: (base64Image: string, pedagogicalFocus?: string) => Promise<void>;
  readonly isAnalyzing: boolean;
  readonly error: string | null;
}

export const SchematicUploadStage: React.FC<Props> = ({
  onImageSelected,
  isAnalyzing,
  error,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pedagogicalFocus, setPedagogicalFocus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global listener for clipboard paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setSelectedImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;
    await onImageSelected(selectedImage, pedagogicalFocus.trim() || undefined);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedImage ? (
        <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-4">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-1.5 bg-slate-800/80 text-white rounded-lg hover:bg-slate-700 transition-colors z-10"
            title="Usuń zdjęcie"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/2 max-h-72 overflow-hidden rounded-lg bg-black/10 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Wgrany schemat"
                className="max-h-72 object-contain rounded"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                Obraz gotowy do multimodalnej analizy
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Model Gemini 3.8 Flash przetworzy geometrię połączeń, wygeneruje wektor SVG oraz sformułuje 4 sokratejskie pytania dydaktyczne.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Wskazówka dydaktyczna (opcjonalnie):
                </label>
                <input
                  type="text"
                  value={pedagogicalFocus}
                  onChange={(e) => setPedagogicalFocus(e.target.value)}
                  placeholder="np. Skup się na roli diody zenera i tętnieniach napięcia"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analizuję obwód i generuję SVG...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rozpocznij Analizę Schematu (AI)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Przeciągnij schemat lub kliknij, aby wybrać plik
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Obsługiwane formaty: PNG, JPG, WebP. Możesz także nacisnąć{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[11px]">
              Ctrl+V
            </kbd>{' '}
            lub{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[11px]">
              Cmd+V
            </kbd>
            , aby wkleić zrzut ze schowka!
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Automatyczna detekcja elementów, wektoryzacja SVG i generowanie 4 pytań</span>
          </div>
        </div>
      )}
    </div>
  );
};
