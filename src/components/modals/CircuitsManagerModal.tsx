/**
 * @file CircuitsManagerModal.tsx
 * @description Catalog modal for browsing public circuits and managing private user circuits in Cloud SQL PostgreSQL.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CircuitBoard,
  Layers,
  Check,
  Sparkles,
  PlusCircle,
  Globe,
  Lock,
  Trash2,
  LogIn,
} from 'lucide-react';
import type { Circuit, CircuitSummary } from '../../types/circuit.types.ts';
import { SymbolParser } from '../../utils/symbol-parser.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { CreateCircuitModal } from './CreateCircuitModal.tsx';
import { SchematicAiWizardModal } from './SchematicAiWizardModal.tsx';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly summaries: readonly CircuitSummary[];
  readonly currentCircuitId: string;
  readonly onSelectCircuit: (id: string) => void;
  readonly onSaveCustomCircuit?: (circuit: Circuit) => Promise<void>;
  readonly onDeleteCircuit?: (id: string) => Promise<void>;
}

export const CircuitsManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  summaries,
  currentCircuitId,
  onSelectCircuit,
  onSaveCustomCircuit,
  onDeleteCircuit,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const publicSummaries = summaries.filter((s) => !s.isCustom);
  const privateSummaries = summaries.filter((s) => s.isCustom);
  const displayedSummaries = activeTab === 'public' ? publicSummaries : privateSummaries;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onDeleteCircuit) return;
    if (confirm('Czy na pewno chcesz usunąć ten obwód ze swojej bazy Cloud SQL?')) {
      try {
        setDeletingId(id);
        await onDeleteCircuit(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="circuits-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      >
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-200">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-md">
                <CircuitBoard className="w-5 h-5" />
              </div>
              <div>
                <h2 id="circuits-modal-title" className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Baza Obwodów Cloud SQL
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {summaries.length} obwodów
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Przeglądaj katalog publiczny oraz zarządzaj własnymi układami</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              aria-label="Zamknij katalog układów"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-5 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('public')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'public'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Katalog Wzorcowy ({publicSummaries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('private')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'private'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Moje Układy ({privateSummaries.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAiWizardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition cursor-pointer"
                title="Generuj nowy układ z analizy obrazu lub wklejonego schematu"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generuj z obrazu (AI)</span>
              </button>

              {user && onSaveCustomCircuit && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Ręczny edytor</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 no-scrollbar">
            {activeTab === 'private' && !user ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl text-cyan-400">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Wymagane logowanie</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Zaloguj się kontem Google, aby tworzyć, edytować i synchronizować własne obwody w relacyjnej bazie Cloud SQL.
                  </p>
                </div>
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl shadow-md transition cursor-pointer hover:from-cyan-500 hover:to-indigo-500"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Zaloguj z Google</span>
                </button>
              </div>
            ) : displayedSummaries.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-2">
                <p className="text-sm text-slate-400 font-medium">Brak własnych obwodów w chmurze.</p>
                <p className="text-xs text-slate-500">Kliknij „Dodaj obwód”, aby zapisać swój pierwszy projekt.</p>
                {user && onSaveCustomCircuit && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-cyan-500 text-slate-950 rounded-xl transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Utwórz nowy obwód</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {displayedSummaries.map((item) => {
                  const isActive = item.id === currentCircuitId;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectCircuit(item.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/30 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <h3 className="font-bold text-sm text-white">
                            {SymbolParser.formatSymbol(item.title)}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                              <Check className="w-3 h-3" />
                              Aktywny
                            </span>
                          )}
                          {item.isCustom && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Prywatny
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {SymbolParser.formatSymbol(item.description)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                          <span>PostgreSQL Cloud SQL</span>
                          <span>•</span>
                          <span>Wektor SVG</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.isCustom && onDeleteCircuit && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, item.id)}
                            disabled={deletingId === item.id}
                            className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                            title="Usuń ze swojej bazy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                            isActive
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isActive ? 'Aktywny' : 'Wybierz układ'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Zsynchronizowano z bazą Cloud SQL (PostgreSQL)
            </span>
            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>

      {onSaveCustomCircuit && (
        <>
          <CreateCircuitModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSaveCircuit={onSaveCustomCircuit}
          />
          <SchematicAiWizardModal
            isOpen={isAiWizardOpen}
            onClose={() => setIsAiWizardOpen(false)}
            onSaveCircuit={async (circuit) => {
              await onSaveCustomCircuit(circuit);
              onSelectCircuit(circuit.id);
            }}
          />
        </>
      )}
    </>
  );
};
