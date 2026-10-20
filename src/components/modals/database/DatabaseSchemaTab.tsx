/**
 * @file DatabaseSchemaTab.tsx
 * @description Schema structure inspector, DDL SQL script viewer, and downloadable SQL schema for local environments.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { FileCode2, Copy, Check, Key, Link as LinkIcon, Download, Terminal, Server } from 'lucide-react';
import { databaseManagerClient } from '../../../services/database-manager-client.service.ts';

interface Props {
  readonly idToken?: string | null;
}

const STANDALONE_DDL = `-- DeSchema Mentor: Single-User Relational Database Schema
-- Compatible with: PostgreSQL 14+, Google Cloud SQL, Supabase, Neon & Docker

CREATE TABLE IF NOT EXISTS circuits (
  id VARCHAR(128) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  svg_view_box VARCHAR(64) NOT NULL DEFAULT '0 0 700 400',
  svg_content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circuit_symbols (
  id VARCHAR(128) PRIMARY KEY,
  circuit_id VARCHAR(128) NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
  label VARCHAR(64) NOT NULL,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  physical_role TEXT,
  formula TEXT,
  formula_description TEXT,
  typical_value TEXT,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS socratic_steps (
  id SERIAL PRIMARY KEY,
  circuit_id VARCHAR(128) NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  prompt_question TEXT NOT NULL,
  hint TEXT NOT NULL,
  reflection_answer TEXT NOT NULL,
  target_symbol_ids JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_circuit_symbols_circuit_id ON circuit_symbols(circuit_id);
CREATE INDEX IF NOT EXISTS idx_socratic_steps_circuit_id ON socratic_steps(circuit_id);`;

export const DatabaseSchemaTab: React.FC<Props> = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(STANDALONE_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = async () => {
    try {
      const sqlText = await databaseManagerClient.getDatabaseSqlSchema();
      const blob = new Blob([sqlText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deschema-schema.sql';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback do stałej
      const blob = new Blob([STANDALONE_DDL], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deschema-schema.sql';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info and Download Actions */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            Specyfikacja Bazy SQL (Drizzle ORM &amp; PostgreSQL)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Czysty schemat relacyjny dla modelu Single-User. Zabezpiecza aplikację przed uzależnieniem od chmury i pozwala na natychmiastowe uruchomienie lokalne.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pobierz plik SQL (.sql)</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Skopiowano' : 'Kopiuj DDL'}</span>
          </button>
        </div>
      </div>

      {/* SQL DDL Code View */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>deschema-schema.sql (PostgreSQL 14+)</span>
          <span className="text-[11px] text-emerald-400">Model Jednoosobowy (Single-User)</span>
        </div>
        <pre className="p-4 text-emerald-400 font-mono text-xs overflow-x-auto no-scrollbar leading-relaxed">
          {STANDALONE_DDL}
        </pre>
      </div>

      {/* Instructions for Alternative Local Databases */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
        <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Instrukcja Implementacji w Alternatywnych Narzędziach SQL (Zero-Cost / Offline)
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5 font-mono">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              1. Lokalny Docker (PostgreSQL 15)
            </span>
            <p className="text-slate-400 text-[11px]">
              Uruchom lokalny kontener bazodanowy jedną komendą:
            </p>
            <pre className="p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] overflow-x-auto">
{`docker run -d --name deschema-pg \\
  -e POSTGRES_PASSWORD=secret \\
  -e POSTGRES_DB=deschema \\
  -p 5432:5432 postgres:15-alpine`}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5 font-mono">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              2. Zmienne w pliku .env
            </span>
            <p className="text-slate-400 text-[11px]">
              Skieruj aplikację na lokalną lub darmową instancję Supabase / Neon:
            </p>
            <pre className="p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] overflow-x-auto">
{`SQL_HOST="127.0.0.1"
SQL_DB_NAME="deschema"
SQL_USER="postgres"
SQL_PASSWORD="secret"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
