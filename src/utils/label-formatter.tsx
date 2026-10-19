/**
 * @file label-formatter.tsx
 * @description Facade module re-exporting unified symbol parsing logic from SymbolParser.
 * @author @s-reinmar
 * @license MIT
 */

export {
  SymbolParser,
  formatSymbol,
  cleanLatexNoise,
  formatSchematicLabel,
  formatFormulaHtml,
  formatRichScientificText,
  sanitizeSvgTextLabels,
} from './symbol-parser.ts';

export type { ISymbolParser } from './symbol-parser.ts';
