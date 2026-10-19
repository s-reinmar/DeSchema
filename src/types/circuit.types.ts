/**
 * @file circuit.types.ts
 * @description Domain types and data models for DeSchema Mentor circuits, symbol physics, and socratic steps.
 * @author s-reinmar
 * @license MIT
 */

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
}

/**
 * Lightweight descriptor for select dropdowns and navigation lists.
 */
export interface CircuitSummary {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly isCustom: boolean;
}

/**
 * Result of circuit JSON schema validation.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly circuit?: Circuit;
}
