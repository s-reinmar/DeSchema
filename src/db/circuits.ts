/**
 * @file circuits.ts
 * @description Database query layer for electronic circuits, symbols, and socratic steps using Drizzle ORM.
 * Implements type-safe relational querying, sanitization of internal database errors, and atomic transactions.
 * @author s-reinmar
 * @license MIT
 */

import { eq, or, and } from 'drizzle-orm';
import { db } from './index.ts';
import { circuits, circuitSymbols, socraticSteps } from './schema.ts';
import type { Circuit, CircuitSymbol, SocraticStep } from '../types/circuit.types.ts';

export interface CreateCircuitInput {
  id: string;
  title: string;
  description: string;
  svgViewBox: string;
  svgContent: string;
  isPublic?: boolean;
  userId?: string | null;
  symbols: readonly {
    id: string;
    label: string;
    name?: string;
    x: number;
    y: number;
    physicalRole?: string;
    formula?: string;
    formulaDescription?: string;
    typicalValue?: string;
    explanation: string;
  }[];
  socraticSteps: readonly {
    stepNumber: 1 | 2 | 3 | 4;
    title: string;
    promptQuestion: string;
    hint: string;
    reflectionAnswer: string;
    targetSymbolIds: readonly string[];
  }[];
}

/**
 * Maps database relational rows to the domain Circuit entity.
 */
function mapToCircuitDomain(
  circuitRow: typeof circuits.$inferSelect,
  symbolsRows: (typeof circuitSymbols.$inferSelect)[],
  stepsRows: (typeof socraticSteps.$inferSelect)[]
): Circuit {
  const sortedSteps: SocraticStep[] = stepsRows
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map((s) => ({
      stepNumber: (s.stepNumber as 1 | 2 | 3 | 4) || 1,
      title: s.title,
      promptQuestion: s.promptQuestion,
      hint: s.hint,
      reflectionAnswer: s.reflectionAnswer,
      targetSymbolIds: Array.isArray(s.targetSymbolIds)
        ? (s.targetSymbolIds as string[])
        : [],
    }));

  const symbols: CircuitSymbol[] = symbolsRows.map((sym) => ({
    id: sym.id,
    label: sym.label,
    name: sym.name,
    x: sym.x,
    y: sym.y,
    explanation: sym.explanation ?? '',
    physicalRole: sym.physicalRole ?? undefined,
    formula: sym.formula ?? undefined,
    formulaDescription: sym.formulaDescription ?? undefined,
    typicalValue: sym.typicalValue ?? undefined,
  }));

  return {
    id: circuitRow.id,
    title: circuitRow.title,
    description: circuitRow.description ?? '',
    svgViewBox: circuitRow.svgViewBox,
    svgContent: circuitRow.svgContent,
    symbols,
    socraticSteps: sortedSteps,
    isCustom: !circuitRow.isPublic,
  };
}

/**
 * Retrieves all accessible circuits (all public circuits + private circuits belonging to userId).
 */
export async function getCircuitsFromDb(userId?: string): Promise<Circuit[]> {
  try {
    const whereCondition = userId
      ? or(eq(circuits.isPublic, true), eq(circuits.userId, userId))
      : eq(circuits.isPublic, true);

    const circuitRecords = await db
      .select()
      .from(circuits)
      .where(whereCondition);

    if (circuitRecords.length === 0) {
      return [];
    }

    const results: Circuit[] = [];
    for (const c of circuitRecords) {
      const symbols = await db
        .select()
        .from(circuitSymbols)
        .where(eq(circuitSymbols.circuitId, c.id));

      const steps = await db
        .select()
        .from(socraticSteps)
        .where(eq(socraticSteps.circuitId, c.id));

      results.push(mapToCircuitDomain(c, symbols, steps));
    }

    return results;
  } catch (error) {
    console.error('[DB Circuits] Błąd pobierania obwodów:', error);
    throw new Error('Nie udało się pobrać katalogu obwodów z bazy danych.', { cause: error });
  }
}

/**
 * Retrieves a single circuit by ID, verifying public visibility or user ownership.
 */
export async function getCircuitByIdFromDb(id: string, userId?: string): Promise<Circuit | null> {
  try {
    const records = await db
      .select()
      .from(circuits)
      .where(eq(circuits.id, id));

    if (records.length === 0) return null;
    const c = records[0];

    // Access check: circuit must be public or owned by user
    if (!c.isPublic && (!userId || c.userId !== userId)) {
      return null;
    }

    const symbols = await db
      .select()
      .from(circuitSymbols)
      .where(eq(circuitSymbols.circuitId, c.id));

    const steps = await db
      .select()
      .from(socraticSteps)
      .where(eq(socraticSteps.circuitId, c.id));

    return mapToCircuitDomain(c, symbols, steps);
  } catch (error) {
    console.error(`[DB Circuits] Błąd pobierania obwodu ${id}:`, error);
    throw new Error(`Nie udało się pobrać szczegółów obwodu ${id}.`, { cause: error });
  }
}

/**
 * Saves a new circuit atomically within a database transaction.
 */
export async function insertCircuitToDb(input: CreateCircuitInput): Promise<Circuit> {
  try {
    return await db.transaction(async (tx) => {
      await tx.insert(circuits).values({
        id: input.id,
        title: input.title,
        description: input.description,
        svgViewBox: input.svgViewBox,
        svgContent: input.svgContent,
        isPublic: Boolean(input.isPublic),
        userId: input.userId ?? null,
      });

      if (input.symbols && input.symbols.length > 0) {
        for (const s of input.symbols) {
          await tx.insert(circuitSymbols).values({
            id: s.id,
            circuitId: input.id,
            label: s.label,
            name: s.name ?? s.label ?? s.id,
            x: s.x,
            y: s.y,
            physicalRole: s.physicalRole ?? null,
            formula: s.formula ?? null,
            formulaDescription: s.formulaDescription ?? null,
            typicalValue: s.typicalValue ?? null,
            explanation: s.explanation,
          });
        }
      }

      if (input.socraticSteps && input.socraticSteps.length > 0) {
        for (const st of input.socraticSteps) {
          await tx.insert(socraticSteps).values({
            circuitId: input.id,
            stepNumber: st.stepNumber,
            title: st.title,
            promptQuestion: st.promptQuestion,
            hint: st.hint,
            reflectionAnswer: st.reflectionAnswer,
            targetSymbolIds: Array.from(st.targetSymbolIds),
          });
        }
      }

      const createdCircuits = await tx.select().from(circuits).where(eq(circuits.id, input.id));
      const createdSymbols = await tx.select().from(circuitSymbols).where(eq(circuitSymbols.circuitId, input.id));
      const createdSteps = await tx.select().from(socraticSteps).where(eq(socraticSteps.circuitId, input.id));

      return mapToCircuitDomain(createdCircuits[0], createdSymbols, createdSteps);
    });
  } catch (error) {
    console.error('[DB Circuits] Błąd zapisu obwodu:', error);
    throw new Error('Nie udało się zapisać nowego obwodu w bazie danych.', { cause: error });
  }
}

/**
 * Deletes a circuit if the requesting user is the owner.
 */
export async function deleteCircuitFromDb(id: string, userId: string): Promise<boolean> {
  try {
    const existing = await db
      .select()
      .from(circuits)
      .where(and(eq(circuits.id, id), eq(circuits.userId, userId)));

    if (existing.length === 0) {
      return false;
    }

    await db.delete(circuits).where(eq(circuits.id, id));
    return true;
  } catch (error) {
    console.error(`[DB Circuits] Błąd usuwania obwodu ${id}:`, error);
    throw new Error('Nie udało się usunąć obwodu z bazy danych.', { cause: error });
  }
}
