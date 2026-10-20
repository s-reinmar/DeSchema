/**
 * @file svg-token-optimizer.interface.ts
 * @description Contracts, strict upload rules, and optimization metrics for Token-Safe SVG processing.
 * @author @s-reinmar
 * @license MIT
 */

import type { CircuitSymbol } from '../types/circuit.types.ts';

/**
 * Strict rules and thresholds enforced during SVG upload.
 */
export interface SvgUploadRules {
  readonly maxRawSizeBytes: number;       // e.g. 150 KB (153,600 bytes)
  readonly maxOptimizedSizeBytes: number; // e.g. 35 KB (35,840 bytes)
  readonly maxAllowedTokens: number;      // e.g. 4,500 tokens
  readonly allowedSvgElements: readonly string[];
  readonly forbiddenTags: readonly string[];
  readonly forbiddenAttributes: readonly string[];
}

/**
 * Performance and token economy benchmark report produced by SvgTokenOptimizer.
 */
export interface SvgOptimizationReport {
  readonly rawLengthBytes: number;
  readonly optimizedLengthBytes: number;
  readonly rawTokensEstimated: number;
  readonly optimizedTokensEstimated: number;
  readonly tokenSavingsPercent: number;
  readonly executionTimeMs: number;
  readonly strippedMetadataCategories: readonly string[];
  readonly detectedSymbols: readonly CircuitSymbol[];
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Output of the SVG optimization pipeline ready for Cloud SQL and AI context.
 */
export interface OptimizedSvgResult {
  readonly cleanSvgContent: string;
  readonly viewBox: string;
  readonly width: number;
  readonly height: number;
  readonly report: SvgOptimizationReport;
}

/**
 * Headless domain interface for token-safe SVG sanitization, compression, and analysis.
 */
export interface ISvgTokenOptimizer {
  optimizeSvg(rawSvg: string): OptimizedSvgResult;
  validateUploadRules(rawSvg: string): { isValid: boolean; errors: string[]; warnings: string[] };
  estimateTokens(text: string): number;
}
