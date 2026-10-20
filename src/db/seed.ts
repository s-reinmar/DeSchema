/**
 * @file seed.ts
 * @description Automatic seeding utility to populate Cloud SQL PostgreSQL with the 3 canonical public circuits.
 * @author s-reinmar
 * @license MIT
 */

import fs from 'fs';
import path from 'path';
import { db } from './index.ts';
import { circuits } from './schema.ts';
import { eq } from 'drizzle-orm';
import { insertCircuitToDb } from './circuits.ts';
import type { Circuit } from '../types/circuit.types.ts';

const PREDEFINED_FILES = [
  'half-wave-rectifier.json',
  'npn-common-emitter.json',
  'zener-regulator.json',
];

/**
 * Seeds initial public circuits into PostgreSQL if they do not yet exist.
 */
export async function seedInitialCircuits(): Promise<void> {
  try {
    for (const fileName of PREDEFINED_FILES) {
      const filePath = path.resolve(process.cwd(), 'public', 'resources', fileName);
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw) as Circuit;
      if (!data.id) continue;

      const existing = await db
        .select({ id: circuits.id })
        .from(circuits)
        .where(eq(circuits.id, data.id));

      if (existing.length === 0) {
        console.log(`[Seed] Inicjalizacja wzorcowego obwodu w bazie: ${data.id}`);
        await insertCircuitToDb({
          id: data.id,
          title: data.title,
          description: data.description,
          svgViewBox: data.svgViewBox,
          svgContent: data.svgContent,
          isPublic: true,
          symbols: data.symbols,
          socraticSteps: data.socraticSteps,
        });
      }
    }
  } catch (error) {
    console.error('[Seed] Błąd podczas automatycznego seedowania obwodów:', error);
  }
}
