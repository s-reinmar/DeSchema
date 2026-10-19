/**
 * @file JsonUploadButton.tsx
 * @description Accessible button triggering a hidden file input with safe async JSON parsing and reset.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useRef, useState } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  readonly onJsonLoaded: (parsedData: unknown) => void;
  readonly onError?: (errorMessage: string) => void;
  readonly className?: string;
}

export const JsonUploadButton: React.FC<Props> = ({
  onJsonLoaded,
  onError,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFeedback(null);

    try {
      // Async text reading through standard File API
      const fileText = await file.text();
      const parsedData = JSON.parse(fileText) as unknown;

      onJsonLoaded(parsedData);
      setFeedback({ type: 'success', message: 'Wczytano JSON' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Nieprawidłowa składnia pliku JSON';
      setFeedback({ type: 'error', message: errorMsg });
      onError?.(errorMsg);
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsProcessing(false);
      // Clean up input value so the same file can be uploaded again if modified
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Wgraj plik obwodu JSON"
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isProcessing}
        aria-label="Wgraj plik JSON obwodu"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover:text-white border border-emerald-500/40 shadow-sm ${className}`}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        ) : (
          <Upload className="w-4 h-4 text-emerald-400" />
        )}
        <span>Wgraj JSON</span>
      </button>

      {/* Floating temporary validation feedback badge */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute left-0 top-full mt-1.5 z-50 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-lg whitespace-nowrap animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-200'
              : 'bg-red-950 border border-red-500 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
