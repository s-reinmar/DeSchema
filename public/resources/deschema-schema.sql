-- =====================================================================
-- DeSchema Mentor: Single-User Relational Database Schema
-- Compatible with: PostgreSQL 14+, Google Cloud SQL, Supabase, Neon & Docker
-- Character Encoding: UTF-8
-- =====================================================================

-- 1. Tabela nadrzędna: Obwody i schematy elektroniczne (wektory SVG)
CREATE TABLE IF NOT EXISTS circuits (
  id VARCHAR(128) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  svg_view_box VARCHAR(64) NOT NULL DEFAULT '0 0 700 400',
  svg_content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela podrzędna: Symbole obwodu, punkty fizyczne i wzory
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

-- 3. Tabela podrzędna: 4-etapowe dydaktyczne pytania sokratejskie
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

-- 4. Indeksy relacyjne optymalizujące operacje wyszukiwania
CREATE INDEX IF NOT EXISTS idx_circuit_symbols_circuit_id ON circuit_symbols(circuit_id);
CREATE INDEX IF NOT EXISTS idx_socratic_steps_circuit_id ON socratic_steps(circuit_id);

-- =====================================================================
-- Przykładowe polecenie uruchomienia lokalnego kontenera PostgreSQL:
-- docker run --name deschema-postgres -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=deschema -p 5432:5432 -d postgres:15-alpine
-- Psuite / psql -h localhost -U postgres -d deschema -f deschema-schema.sql
-- =====================================================================
