/**
 * @file database.router.ts
 * @description Single-user Express REST router for Cloud SQL inspection, visual SVG circuit explorer, and pure SVG export.
 * Follows SRP, genuine connection probing without simulated telemetry, and pure SVG output boundaries.
 * @author s-reinmar
 * @license MIT
 */

import { Router, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { db, pool } from '../db/index.ts';
import { circuits, circuitSymbols, socraticSteps } from '../db/schema.ts';
import { seedInitialCircuits } from '../db/seed.ts';
import { optionalAuth, AuthRequest } from '../middleware/auth.ts';
import type { DatabaseStats, CircuitVectorItem } from '../interfaces/database-manager.interface.ts';
import type { Circuit } from '../types/circuit.types.ts';
import { CircuitSlugGenerator } from '../services/circuit-slug-generator.service.ts';

export const databaseRouter = Router();

const STANDALONE_SQL_SCHEMA = `-- DeSchema Mentor: Single-User Relational Database Schema
-- Compatible with PostgreSQL 14+, Cloud SQL, Supabase, Neon & Local Docker
-- Character Encoding: UTF-8

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

-- Indeksy przyspieszające wyszukiwanie relacji
CREATE INDEX IF NOT EXISTS idx_circuit_symbols_circuit_id ON circuit_symbols(circuit_id);
CREATE INDEX IF NOT EXISTS idx_socratic_steps_circuit_id ON socratic_steps(circuit_id);
`;

/**
 * Probes the genuine connection state to PostgreSQL with a 2500ms timeout.
 */
async function probePostgresConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  host: string;
  database: string;
  version: string;
  serverTime: string;
}> {
  const start = Date.now();
  const client = await Promise.race([
    pool.connect(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Przekroczono limit czasu połączenia (2500ms)')), 2500)
    ),
  ]);

  try {
    const res = await client.query(
      'SELECT inet_server_addr() as host, inet_server_port() as port, current_database() as db, version() as version, NOW() as now'
    );
    const latencyMs = Date.now() - start;
    const row = res.rows[0];

    const hostDisplay = row?.host
      ? `${row.host}:${row.port || 5432}`
      : process.env.SQL_HOST || '127.0.0.1 (Cloud SQL Proxy)';

    return {
      connected: true,
      latencyMs,
      host: hostDisplay,
      database: row?.db || process.env.SQL_DB_NAME || 'postgres',
      version: row?.version ? String(row.version).split(' on ')[0] : 'PostgreSQL 15',
      serverTime: row?.now ? new Date(row.now).toISOString() : new Date().toISOString(),
    };
  } finally {
    client.release();
  }
}

/**
 * Counts fallback circuits stored in local files (/public/resources/).
 */
function getLocalFallbackCounts(): { circuits: number; symbols: number; steps: number } {
  const resourceFiles = ['half-wave-rectifier.json', 'npn-common-emitter.json', 'zener-regulator.json'];
  let totalSymbols = 0;
  let totalSteps = 0;

  for (const f of resourceFiles) {
    try {
      const p = path.resolve(process.cwd(), 'public', 'resources', f);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw) as Circuit;
        totalSymbols += parsed.symbols?.length || 0;
        totalSteps += parsed.socraticSteps?.length || 0;
      }
    } catch {
      // ignore
    }
  }

  return { circuits: resourceFiles.length, symbols: totalSymbols, steps: totalSteps };
}

/**
 * GET /api/database/stats
 * Evaluates genuine PostgreSQL connection status and returns precise single-user metrics.
 */
databaseRouter.get('/stats', optionalAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const probe = await probePostgresConnection();

    const [circuitsCountRes, symbolsCountRes, stepsCountRes] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(circuits),
      db.select({ count: sql<number>`count(*)::int` }).from(circuitSymbols),
      db.select({ count: sql<number>`count(*)::int` }).from(socraticSteps),
    ]);

    const totalCircuits = circuitsCountRes[0]?.count ?? 0;
    const totalSymbols = symbolsCountRes[0]?.count ?? 0;
    const totalSteps = stepsCountRes[0]?.count ?? 0;

    const stats: DatabaseStats = {
      connected: true,
      host: probe.host,
      database: probe.database,
      engine: probe.version,
      latencyMs: probe.latencyMs,
      serverTime: probe.serverTime,
      totalCircuits,
      totalSymbols,
      totalSteps,
      totalUsers: 1, // Single-User Architecture: Właściciel
      isStandaloneFallback: false,
      statusMessage: 'Połączono z bazą Google Cloud SQL PostgreSQL. Metryki czasu rzeczywistego aktywne.',
    };

    res.json(stats);
  } catch (error) {
    const fallback = getLocalFallbackCounts();
    const errorMessage = error instanceof Error ? error.message : 'Brak połączenia';

    const stats: DatabaseStats = {
      connected: false,
      host: process.env.SQL_HOST ? `${process.env.SQL_HOST} (Offline)` : 'Tryb lokalny / Standalone (Brak instancji Cloud SQL)',
      database: process.env.SQL_DB_NAME || 'Lokalny magazyn /resources',
      engine: 'Lokalny fallback (Pamięć podręczna JSON & localStorage)',
      latencyMs: 0,
      serverTime: new Date().toISOString(),
      totalCircuits: fallback.circuits,
      totalSymbols: fallback.symbols,
      totalSteps: fallback.steps,
      totalUsers: 1, // Single-User Architecture: Właściciel
      isStandaloneFallback: true,
      statusMessage: `Baza PostgreSQL nie odpowiada (${errorMessage}). Aplikacja działa stabilnie w autonomicznym trybie lokalnym.`,
    };

    res.json(stats);
  }
});

/**
 * GET /api/database/circuits-preview
 * Returns all circuits with graphical SVG content, symbols list, and socratic steps.
 */
databaseRouter.get('/circuits-preview', optionalAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allCircuits = await db.select().from(circuits);
    const items: CircuitVectorItem[] = [];

    for (const c of allCircuits) {
      const symbols = await db
        .select()
        .from(circuitSymbols)
        .where(eq(circuitSymbols.circuitId, c.id));

      const steps = await db
        .select()
        .from(socraticSteps)
        .where(eq(socraticSteps.circuitId, c.id));

      items.push({
        id: c.id,
        title: c.title,
        description: c.description ?? undefined,
        svgViewBox: c.svgViewBox,
        svgContent: c.svgContent,
        category: CircuitSlugGenerator.detectCategory(c.title, c.description ?? undefined),
        englishSlug: CircuitSlugGenerator.resolveDisplaySlug(c.id, c.title),
        symbols: symbols.map((s) => ({
          id: s.id,
          label: s.label,
          name: s.name,
          physicalRole: s.physicalRole ?? undefined,
          formula: s.formula ?? undefined,
          typicalValue: s.typicalValue ?? undefined,
          explanation: s.explanation ?? undefined,
        })),
        socraticSteps: steps
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((st) => ({
            stepNumber: st.stepNumber,
            title: st.title,
            promptQuestion: st.promptQuestion,
          })),
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
      });
    }

    res.json(items);
  } catch (error) {
    console.warn('[API Database] Pobieranie z bazy nie powiodło się, pobieram z zasobów lokalnych:', error);
    // Fallback do plików lokalnych
    const resourceFiles = ['half-wave-rectifier.json', 'npn-common-emitter.json', 'zener-regulator.json'];
    const items: CircuitVectorItem[] = [];

    for (const f of resourceFiles) {
      try {
        const p = path.resolve(process.cwd(), 'public', 'resources', f);
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          const data = JSON.parse(raw) as Circuit;
          items.push({
            id: data.id,
            title: data.title,
            description: data.description,
            svgViewBox: data.svgViewBox,
            svgContent: data.svgContent,
            category: data.category ?? CircuitSlugGenerator.detectCategory(data.title, data.description),
            englishSlug: data.englishSlug ?? CircuitSlugGenerator.resolveDisplaySlug(data.id, data.title),
            symbols: (data.symbols || []).map((s) => ({
              id: s.id,
              label: s.label,
              name: s.name || s.label || s.id,
              physicalRole: s.physicalRole,
              formula: s.formula,
              typicalValue: s.typicalValue,
              explanation: s.explanation,
            })),
            socraticSteps: (data.socraticSteps || []).map((st) => ({
              stepNumber: st.stepNumber,
              title: st.title,
              promptQuestion: st.promptQuestion,
            })),
          });
        }
      } catch {
        // ignore
      }
    }

    res.json(items);
  }
});

/**
 * GET /api/database/circuits/:id/svg
 * Exports purely the clean SVG vector file, without questions, test answers, or checkpoints.
 */
databaseRouter.get('/circuits/:id/svg', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    let svgViewBox = '0 0 700 400';
    let svgContent = '';
    let title = id;

    // Najpierw sprawdzamy bazę danych
    try {
      const records = await db.select().from(circuits).where(eq(circuits.id, id));
      if (records.length > 0) {
        svgViewBox = records[0].svgViewBox;
        svgContent = records[0].svgContent;
        title = records[0].title;
      }
    } catch {
      // Ignorujemy błąd bazy i sprawdzamy pliki lokalne
    }

    // Jeśli brak w bazie, sprawdzamy pliki /public/resources/
    if (!svgContent) {
      const localPath = path.resolve(process.cwd(), 'public', 'resources', `${id}.json`);
      if (fs.existsSync(localPath)) {
        const data = JSON.parse(fs.readFileSync(localPath, 'utf-8')) as Circuit;
        svgViewBox = data.svgViewBox;
        svgContent = data.svgContent;
        title = data.title;
      }
    }

    if (!svgContent) {
      res.status(404).json({ error: `Obwód "${id}" nie został odnaleziony.` });
      return;
    }

    // Generujemy czysty, poprawny syntaktycznie dokument SVG
    const pureSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="100%" height="100%">
  <!-- DeSchema Mentor Pure Vector Schematic Export: ${title} -->
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  </style>
  ${svgContent}
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.svg"`);
    res.send(pureSvg);
  } catch (error) {
    console.error(`[API Database] Błąd eksportu SVG dla ${id}:`, error);
    res.status(500).json({ error: 'Nie udało się wyeksportować schematu SVG.' });
  }
});

/**
 * DELETE /api/database/circuits/:id
 * Removes a circuit and its cascades.
 */
databaseRouter.delete('/circuits/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await db.delete(circuits).where(eq(circuits.id, id));
    res.json({ success: true, message: `Obwód "${id}" został pomyślnie usunięty z bazy.` });
  } catch (error) {
    console.error(`[API Database] Błąd usuwania obwodu ${id}:`, error);
    res.status(500).json({ error: 'Nie udało się usunąć wskazanego obwodu.' });
  }
});

/**
 * POST /api/database/reseed
 * Reseeds canonical reference circuits from /public/resources/ into PostgreSQL.
 */
databaseRouter.post('/reseed', optionalAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    await seedInitialCircuits();
    const circuitsList = await db.select({ count: sql<number>`count(*)::int` }).from(circuits);
    res.json({
      success: true,
      message: 'Pomyślnie zweryfikowano i przywrócono wzorcowe schematy elektroniczne.',
      seededCount: circuitsList[0]?.count ?? 0,
    });
  } catch (error) {
    console.error('[API Database] Błąd re-seedowania bazy:', error);
    res.status(500).json({ error: 'Błąd podczas przywracania danych wzorcowych do bazy.' });
  }
});

/**
 * GET /api/database/schema-sql
 * Returns the complete standalone PostgreSQL / Drizzle DDL script for local setups.
 */
databaseRouter.get('/schema-sql', optionalAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="deschema-schema.sql"');
  res.send(STANDALONE_SQL_SCHEMA);
});
