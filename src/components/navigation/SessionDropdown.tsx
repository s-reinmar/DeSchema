/**
 * @file SessionDropdown.tsx
 * @description Dropdown menu handling session export to JSON, session import from JSON, and session history management.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  BookmarkCheck,
  Download,
  Upload,
  History,
  ChevronDown,
  Trash2,
  CheckCircle2,
  Play,
  FileCode,
} from 'lucide-react';
import type { SessionData, SessionHistoryEntry } from '../../types/session.types.ts';
import { SessionService } from '../../services/session.service.ts';
import { SymbolParser } from '../../utils/symbol-parser.ts';

interface Props {
  readonly onExportSession: () => SessionData;
  readonly onRestoreSession: (session: SessionData) => void;
}

export const SessionDropdown: React.FC<Props> = ({ onExportSession, onRestoreSession }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<readonly SessionHistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsHistoryOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      setHistoryEntries(SessionService.getHistory());
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExport = () => {
    const session = onExportSession();
    SessionService.exportSessionToJson(session);
    SessionService.saveToHistory(session);
    setHistoryEntries(SessionService.getHistory());
    showFeedback('Zapisano plik sesji JSON');
    setIsOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = SessionService.parseSessionFromJson(text);
      if (!result.isValid || !result.session) {
        alert(result.error || 'Nieprawidłowy plik sesji');
        return;
      }
      onRestoreSession(result.session);
      SessionService.saveToHistory(result.session);
      showFeedback(`Wczytano sesję: ${result.session.circuitTitle}`);
      setIsOpen(false);
    } catch (err) {
      alert(`Błąd odczytu pliku: ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRestoreFromHistory = (entry: SessionHistoryEntry) => {
    onRestoreSession(entry.data);
    showFeedback(`Wznowiono: ${entry.circuitTitle}`);
    setIsOpen(false);
    setIsHistoryOpen(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SessionService.deleteFromHistory(id);
    setHistoryEntries(SessionService.getHistory());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer ${
          isOpen
            ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
        }`}
      >
        <BookmarkCheck className="w-4 h-4 text-cyan-400" />
        <span>Sesja</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating feedback message */}
      {feedback && (
        <div className="absolute left-0 top-full mt-2 z-50 px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-mono shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu sesji"
          className="absolute left-0 mt-2 w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 backdrop-blur-md z-50 animate-fade-in text-slate-200 space-y-1"
        >
          {/* 1. Zapisz postęp (Eksportuj do JSON) */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold">Zapisz postęp</span>
              <span className="text-[10px] text-slate-400 font-normal">Eksportuj stan do pliku JSON</span>
            </div>
          </button>

          {/* 2. Wczytaj sesję (Importuj z JSON) */}
          <button
            onClick={handleImportClick}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold">Wczytaj sesję</span>
              <span className="text-[10px] text-slate-400 font-normal">Importuj z pliku JSON</span>
            </div>
          </button>

          {/* 3. Historia sesji / Wznów poprzednią */}
          <div className="border-t border-slate-800/80 pt-1 mt-1">
            <button
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                  <History className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold">Historia sesji</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {historyEntries.length > 0 ? `${historyEntries.length} zapisanych stanów` : 'Brak zapisanych'}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Sub-list of history */}
            {isHistoryOpen && (
              <div className="mt-1 space-y-1 pl-2 border-l border-slate-800 max-h-48 overflow-y-auto no-scrollbar">
                {historyEntries.length === 0 ? (
                  <p className="p-2 text-[11px] text-slate-500 italic">Brak wcześniejszych sesji.</p>
                ) : (
                  historyEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => handleRestoreFromHistory(entry)}
                      className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-cyan-500/40 hover:bg-slate-900 transition flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-semibold text-white block truncate text-[11px]">
                          {SymbolParser.formatSymbol(entry.circuitTitle)}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Krok {entry.stepNumber}/4</span>
                          <span>•</span>
                          <span>{entry.savedAt.slice(0, 16)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistory(entry.id, e)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                          title="Usuń wpis"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
