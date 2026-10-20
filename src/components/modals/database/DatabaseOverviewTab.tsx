/**
 * @file DatabaseOverviewTab.tsx
 * @description Cloud SQL PostgreSQL connection telemetry, table row counts, and maintenance actions.
 * Displays genuine connection metrics, single-user architecture indicators, and pure SVG batch exports.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { Database, CheckCircle2, RefreshCw, Download, RotateCcw, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import type { DatabaseStats } from '../../../interfaces/database-manager.interface.ts';
import { databaseManagerClient } from '../../../services/database-manager-client.service.ts';

interface Props {
  readonly stats: DatabaseStats;
  readonly onRefresh: () => Promise<void>;
  readonly idToken?: string | null;
}

export const DatabaseOverviewTab: React.FC<Props> = ({ stats, onRefresh, idToken }) => {
  const [isReseeding, setIsReseeding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleReseed = async () => {
    setIsReseeding(true);
    setActionMessage(null);
    try {
      const res = await databaseManagerClient.reseedCanonicalCircuits(idToken);
      setActionMessage(res.message);
      await onRefresh();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Błąd podczas przywracania danych.');
    } finally {
      setIsReseeding(false);
    }
  };

  const handleExportAllSvg = async () => {
    setIsExporting(true);
    setActionMessage(null);
    try {
      const circuits = await databaseManagerClient.getCircuitsPreview(idToken);
      if (circuits.length === 0) {
        setActionMessage('Brak schematów do wyeksportowania.');
        return;
      }

      // Eksportujemy czysty plik SVG dla każdego obwodu
      for (const c of circuits) {
        const svgData = await databaseManagerClient.getPureSvg(c.id, idToken);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${c.id}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setActionMessage(`Pomyślnie wygenerowano i wyeksportowano ${circuits.length} czystych plików wektorowych SVG.`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Nie udało się wyeksportować schematów SVG.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-cyan-400 hover:text-white text-xs font-semibold">
            OK
          </button>
        </div>
      )}

      {/* Connection Header Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl border ${stats.connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base">
                {stats.connected ? 'Google Cloud SQL PostgreSQL' : 'Tryb Lokalny / Standalone'}
              </h4>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold border px-2.5 py-0.5 rounded-full ${
                stats.connected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${stats.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {stats.connected ? `Połączono (${stats.latencyMs} ms)` : 'Lokalna pamięć podręczna'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Host: <span className="text-slate-200">{stats.host}</span> | Baza: <span className="text-cyan-400">{stats.database}</span> | Silnik: <span className="text-slate-300">{stats.engine}</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats.statusMessage}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer self-start md:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Odśwież metryki</span>
        </button>
      </div>

      {/* Summary Stat Cards - Exact user-requested labels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium font-mono">Obwody (`circuits`)</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalCircuits}</p>
          <p className="text-[11px] text-cyan-400 font-mono mt-0.5">Wektory SVG &amp; schematy</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium font-mono">Symbole (`circuit_symbols`)</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalSymbols}</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Punkty fizyczne &amp; wzory</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium font-mono">Kroki (`socratic_steps`)</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalSteps}</p>
          <p className="text-[11px] text-amber-400 font-mono mt-0.5">Pytania sokratejskie</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium font-mono">Konta (`users`)</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
          <p className="text-[11px] text-indigo-400 font-mono mt-0.5">Model Single-User (Właściciel)</p>
        </div>
      </div>

      {/* Administrative Operations */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Operacje Administracyjne i Konserwacja Bazy
        </h5>
        <p className="text-xs text-slate-400">
          Zarządzanie schematami i eksport wektorowy. Eksport generuje wyłącznie czyste pliki SVG bez powiązanych pytań dydaktycznych, wyników czy punktów kontrolnych.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleReseed}
            disabled={isReseeding}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Przywraca wzorcowe schematy elektroniczne (prostownik, wzmacniacz OE, dioda Zenera) w bazie"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
            <span>Przywróć obwody wzorcowe (Re-seed)</span>
          </button>

          <button
            onClick={handleExportAllSvg}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Pobiera wyłącznie czyste pliki wektorowe SVG dla wszystkich schematów"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generowanie plików SVG...' : 'Eksportuj schematy (Czyste SVG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
