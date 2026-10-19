/**
 * @file SchematicAiWizardModal.tsx
 * @description 3-step AI creation modal turning photos, diagrams, and clipboard screenshots into interactive Socratic circuits.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { SchematicUploadStage } from './schematic-wizard/SchematicUploadStage.tsx';
import { SchematicEditorStage } from './schematic-wizard/SchematicEditorStage.tsx';
import { circuitAnalyzerClient } from '../../services/circuit-analyzer-client.service.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { CircuitAnalysisResult } from '../../interfaces/circuit-analyzer.interface.ts';
import type { Circuit } from '../../types/circuit.types.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaveCircuit: (circuit: Circuit) => Promise<void>;
}

export const SchematicAiWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveCircuit,
}) => {
  const { idToken } = useAuth();
  const [stage, setStage] = useState<'upload' | 'edit'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CircuitAnalysisResult | null>(null);
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageAnalysis = async (base64Image: string, pedagogicalFocus?: string) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentImageBase64(base64Image);

    try {
      const result = await circuitAnalyzerClient.analyzeSchematicImage(
        { imageBase64: base64Image, pedagogicalFocus },
        idToken
      );
      setAnalysisResult(result);
      setStage('edit');
    } catch (err) {
      console.error('[Schematic Wizard] Błąd analizy:', err);
      const msg = err instanceof Error ? err.message : 'Wystąpił błąd podczas analizy schematu przez AI.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCircuit = async (circuit: Circuit) => {
    setIsSaving(true);
    setError(null);
    try {
      await onSaveCircuit(circuit);
      onClose();
      // Reset state for next launch
      setStage('upload');
      setAnalysisResult(null);
      setCurrentImageBase64(null);
    } catch (err) {
      console.error('[Schematic Wizard] Błąd zapisu:', err);
      const msg = err instanceof Error ? err.message : 'Nie udało się zapisać wygenerowanego układu.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isAnalyzing || isSaving) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Wgraj Schemat (Analiza Multimodalna Gemini)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wgraj plik graficzny (PNG/JPG), przeciągnij schemat lub wklej ze schowka (Ctrl+V), aby wygenerować wektor SVG i 4 pytania sokratejskie.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on active stage */}
        {stage === 'upload' && (
          <SchematicUploadStage
            onImageSelected={handleImageAnalysis}
            isAnalyzing={isAnalyzing}
            error={error}
          />
        )}

        {stage === 'edit' && analysisResult && (
          <SchematicEditorStage
            initialData={analysisResult}
            originalImageUrl={currentImageBase64}
            onSave={handleSaveCircuit}
            onBack={() => setStage('upload')}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
};
