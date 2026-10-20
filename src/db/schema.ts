/**
 * @file schema.ts
 * @description Single-user relational schema for Cloud SQL PostgreSQL using Drizzle ORM.
 * Defines circuits (vector SVGs), circuit symbols (physics roles & formulas), and socratic steps.
 * Designed for private single-operator architecture without multi-tenant overhead.
 * @author s-reinmar
 * @license MIT
 */

import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Master circuits table for the single-user application.
 */
export const circuits = pgTable('circuits', {
  id: varchar('id', { length: 128 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  svgViewBox: varchar('svg_view_box', { length: 64 }).notNull().default('0 0 700 400'),
  svgContent: text('svg_content').notNull(),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/**
 * Discrete circuit symbols containing mathematical formulas, physics roles, and coordinates.
 */
export const circuitSymbols = pgTable('circuit_symbols', {
  id: varchar('id', { length: 128 }).primaryKey(),
  circuitId: varchar('circuit_id', { length: 128 })
    .notNull()
    .references(() => circuits.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 64 }).notNull(),
  name: text('name').notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  physicalRole: text('physical_role'),
  formula: text('formula'),
  formulaDescription: text('formula_description'),
  typicalValue: text('typical_value'),
  explanation: text('explanation'),
});

/**
 * 4-stage Socratic inquiry steps guiding the learner through circuit analysis.
 */
export const socraticSteps = pgTable('socratic_steps', {
  id: serial('id').primaryKey(),
  circuitId: varchar('circuit_id', { length: 128 })
    .notNull()
    .references(() => circuits.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  promptQuestion: text('prompt_question').notNull(),
  hint: text('hint').notNull(),
  reflectionAnswer: text('reflection_answer').notNull(),
  targetSymbolIds: jsonb('target_symbol_ids').notNull().default('[]'),
});

/**
 * Relationships definitions for Drizzle relational queries.
 */
export const circuitsRelations = relations(circuits, ({ many }) => ({
  symbols: many(circuitSymbols),
  socraticSteps: many(socraticSteps),
}));

export const circuitSymbolsRelations = relations(circuitSymbols, ({ one }) => ({
  circuit: one(circuits, {
    fields: [circuitSymbols.circuitId],
    references: [circuits.id],
  }),
}));

export const socraticStepsRelations = relations(socraticSteps, ({ one }) => ({
  circuit: one(circuits, {
    fields: [socraticSteps.circuitId],
    references: [circuits.id],
  }),
}));
