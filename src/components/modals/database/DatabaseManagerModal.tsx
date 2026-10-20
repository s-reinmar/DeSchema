/**
 * @file DatabaseManagerModal.tsx
 * @description Coordinator modal dialog providing Cloud SQL PostgreSQL database inspection, live table explorer, and schema viewer.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import { X, Database, BarChart3, Table, FileCode2, RefreshCw } from 'lucide-react';
import { DatabaseOverviewTab } from './DatabaseOverviewTab.tsx';
import { DatabaseTableBrowserTab } from './DatabaseTableBrowserTab.tsx';
import { DatabaseSchemaTab } from './DatabaseSchemaTab.tsx';
import { databaseManagerClient } from '../../../services/database-manager-client.service.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import type { DatabaseStats } from '../../../interfaces/database-manager.interface.ts';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onDataModified?: () => void;
}

type TabType = 'overview' | 'tables' | 'schema';

export const DatabaseManagerModal: React.FC<Props> = ({ isOpen, onClose, onDataModified }) => {
  const { idToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await databaseManagerClient.getStats(idToken);
      setStats(data);
    } catch (err) {
      console.error('Błąd pobierania statystyk bazy:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się połączyć z bazą danych.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Panel Administratora Bazy Danych
                </h3>
                {stats?.connected ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    PostgreSQL Online ({stats.latencyMs}ms)
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Tryb Lokalny (Offline)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Prywatne narzędzie jednoosobowe (Single-User). Przeglądaj wektory SVG, zarządzaj schematami i eksportuj czyste pliki graficzne.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Przegląd &amp; Metryki</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'tables'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Eksplorator Schematów SVG</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'schema'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Schemat &amp; DDL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 no-scrollbar space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchStats}
                className="flex items-center gap-1 underline font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ponów
              </button>
            </div>
          )}

          {activeTab === 'overview' && stats && (
            <DatabaseOverviewTab stats={stats} onRefresh={fetchStats} idToken={idToken} />
          )}

          {activeTab === 'tables' && (
            <DatabaseTableBrowserTab
              idToken={idToken}
              onDataModified={() => {
                fetchStats();
                onDataModified?.();
              }}
            />
          )}

          {activeTab === 'schema' && <DatabaseSchemaTab idToken={idToken} />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Google Cloud SQL • PostgreSQL 15 • Drizzle ORM
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
