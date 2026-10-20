/**
 * @file database-manager.interface.ts
 * @description Contract definitions and DTOs for single-user Cloud SQL PostgreSQL inspection,
 * SVG vector circuit previews, pure SVG export, and SQL DDL specifications.
 * Follows Interface-Driven Development (DIP) and strict typing rules without `any`.
 * @author s-reinmar
 * @license MIT
 */

export interface DatabaseStats {
  readonly connected: boolean;
  readonly host: string;
  readonly database: string;
  readonly engine: string;
  readonly latencyMs: number;
  readonly totalCircuits: number;
  readonly totalSymbols: number;
  readonly totalSteps: number;
  readonly totalUsers: number;
  readonly serverTime: string;
  readonly isStandaloneFallback: boolean;
  readonly statusMessage: string;
}

export interface CircuitPreviewSymbol {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly physicalRole?: string;
  readonly formula?: string;
  readonly typicalValue?: string;
  readonly explanation?: string;
}

export interface CircuitPreviewStep {
  readonly stepNumber: number;
  readonly title: string;
  readonly promptQuestion: string;
}

export interface CircuitVectorItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly svgViewBox: string;
  readonly svgContent: string;
  readonly symbols: readonly CircuitPreviewSymbol[];
  readonly socraticSteps: readonly CircuitPreviewStep[];
  readonly createdAt?: string;
}

export interface IDatabaseManagerService {
  getStats(token?: string | null): Promise<DatabaseStats>;
  getCircuitsPreview(token?: string | null): Promise<readonly CircuitVectorItem[]>;
  getPureSvg(circuitId: string, token?: string | null): Promise<string>;
  deleteCircuit(id: string, token?: string | null): Promise<{ success: boolean; message: string }>;
  reseedCanonicalCircuits(token?: string | null): Promise<{ success: boolean; message: string; seededCount: number }>;
  getDatabaseSqlSchema(): Promise<string>;
}
