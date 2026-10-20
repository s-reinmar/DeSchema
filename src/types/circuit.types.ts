/**
 * @file circuit.types.ts
 * @description Domain types and data models for DeSchema Mentor circuits, symbol physics, and socratic steps.
 * Includes taxonomy categories and English semantic slugs.
 * @author s-reinmar
 * @license MIT
 */

/**
 * 4 canonical categories of electronic circuits.
 */
export type CircuitCategory =
  | 'Zasilacze'
  | 'Wzmacniacze'
  | 'Technika w.cz. i filtry'
  | 'Układy cyfrowe';

export const CIRCUIT_CATEGORIES: readonly CircuitCategory[] = [
  'Zasilacze',
  'Wzmacniacze',
  'Technika w.cz. i filtry',
  'Układy cyfrowe',
] as const;

/**
 * Represents a discrete electrical/electronic symbol with educational metadata, physics, and design formulas.
 */
export interface CircuitSymbol {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly explanation: string;
  readonly name?: string;
  readonly physicalRole?: string;
  readonly formula?: string;
  readonly formulaDescription?: string;
  readonly typicalValue?: string;
}

/**
 * Represents one step in the 4-stage Socratic inquiry pedagogical methodology.
 */
export interface SocraticStep {
  readonly stepNumber: 1 | 2 | 3 | 4;
  readonly title: string;
  readonly promptQuestion: string;
  readonly hint: string;
  readonly reflectionAnswer: string;
  readonly targetSymbolIds: readonly string[];
}

/**
 * Core entity representing a full electronic circuit definition.
 */
export interface Circuit {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly svgViewBox: string;
  readonly svgContent: string;
  readonly symbols: readonly CircuitSymbol[];
  readonly socraticSteps: readonly SocraticStep[];
  readonly isCustom?: boolean;
  readonly category?: CircuitCategory;
  readonly englishSlug?: string;
}

/**
 * Lightweight descriptor for select dropdowns and navigation lists.
 */
export interface CircuitSummary {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly isCustom: boolean;
  readonly category?: CircuitCategory;
  readonly englishSlug?: string;
}

/**
 * Result of circuit JSON schema validation.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly circuit?: Circuit;
}
