/**
 * @file symbol-parser.ts
 * @description Dedicated SymbolParser module providing pure, uniform conversion of electrical formulas,
 * LaTeX syntax, and subscripts into clean Unicode representations and semantic HTML elements.
 * @author @s-reinmar
 * @license MIT
 */

import React from 'react';

/**
 * Interface defining contract for symbol and mathematical formula parsing.
 */
export interface ISymbolParser {
  formatSymbol(label: string): string;
  cleanLatex(raw: string): string;
  toUnicodeSubscript(text: string): string;
  toUnicodeSuperscript(text: string): string;
}

/**
 * Map of characters to Unicode subscripts (numbers, basic letters, operators).
 */
const UNICODE_SUBSCRIPT_MAP: Readonly<Record<string, string>> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
  // Common electrical abbreviations fallback mapping to small capitals / indices
  'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ₑ', 'L': 'ʟ',
  'R': 'ᵣ', 'S': 'ₛ', 'T': 'ₜ', 'Z': 'ᴢ',
};

/**
 * Map of characters to Unicode superscripts.
 */
const UNICODE_SUPERSCRIPT_MAP: Readonly<Record<string, string>> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'i': 'ⁱ', 'n': 'ⁿ', 'o': 'ᵒ', 'r': 'ʳ', 't': 'ᵗ',
  'x': 'ˣ', 'y': 'ʸ',
};

/**
 * Common LaTeX macros mapped directly to standard Unicode mathematical glyphs.
 */
const LATEX_SYMBOL_MAP: Readonly<Record<string, string>> = {
  '\\Delta': 'Δ',
  '\\pi': 'π',
  '\\beta': 'β',
  '\\Omega': 'Ω',
  '\\mu': 'µ',
  '\\cdot': ' · ',
  '\\ge': ' ≥ ',
  '\\le': ' ≤ ',
  '\\approx': ' ≈ ',
  '\\parallel': ' ∥ ',
  '\\sqrt': '√',
  '\\pm': '±',
  '\\infty': '∞',
};

/**
 * Static domain class for parsing, cleaning, and formatting scientific symbols and formulas.
 */
export class SymbolParser {
  /**
   * Primary entry point: Cleans LaTeX noise (such as &, _, ^, \) and converts
   * indices into clean Unicode characters with safe textual representation.
   */
  public static formatSymbol(label: string): string {
    if (!label) return '';
    let result = SymbolParser.cleanLatexNoise(label);

    // Replace LaTeX symbols first
    for (const [macro, glyph] of Object.entries(LATEX_SYMBOL_MAP)) {
      result = result.split(macro).join(glyph);
    }

    // Convert subscripts: _{xyz} or _xyz
    result = result.replace(/_\{([^}]+)\}|_([a-zA-Z0-9+\-*(),]+)/g, (_match, group1, group2) => {
      const subContent = group1 ?? group2 ?? '';
      return SymbolParser.toUnicodeSubscript(subContent);
    });

    // Convert superscripts: ^{xyz} or ^xyz
    result = result.replace(/\^\{([^}]+)\}|\^([a-zA-Z0-9+\-*(),]+)/g, (_match, group1, group2) => {
      const supContent = group1 ?? group2 ?? '';
      return SymbolParser.toUnicodeSuperscript(supContent);
    });

    // Clean remaining unparsed braces or backslashes
    return result.replace(/[{}]/g, '').replace(/\\/g, '').trim();
  }

  /**
   * Cleans raw LaTeX artifacts: alignment delimiters (&), math delimiters ($), \begin{aligned}, etc.
   */
  public static cleanLatexNoise(text: string): string {
    if (!text) return '';
    return text
      .replace(/\$\$/g, '')
      .replace(/\$/g, '')
      .replace(/\\begin\{aligned\}|\\end\{aligned\}/g, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\quad|\\qquad/g, ' ')
      .replace(/\s*&\s*=/g, ' =')
      .replace(/\s*&\s*/g, ' ')
      .replace(/\\\\/g, '\n');
  }

  /**
   * Converts a string sequence to Unicode subscripts where available.
   */
  public static toUnicodeSubscript(text: string): string {
    return text
      .split('')
      .map((char) => UNICODE_SUBSCRIPT_MAP[char] ?? char)
      .join('');
  }

  /**
   * Converts a string sequence to Unicode superscripts where available.
   */
  public static toUnicodeSuperscript(text: string): string {
    return text
      .split('')
      .map((char) => UNICODE_SUPERSCRIPT_MAP[char] ?? char)
      .join('');
  }

  /**
   * Transforms raw SVG markup to replace subscripts in <text> tags with proper <tspan> elements.
   */
  public static sanitizeSvg(svgContent: string): string {
    if (!svgContent) return '';
    return svgContent.replace(/<text([^>]*)>(.*?)<\/text>/gis, (_fullMatch, attrs, textInner) => {
      let processed = textInner
        .replace(/_\{([^}]+)\}/g, '<tspan dy="3" font-size="0.74em">$1</tspan><tspan dy="-3">')
        .replace(/_([a-zA-Z0-9]+)/g, '<tspan dy="3" font-size="0.74em">$1</tspan><tspan dy="-3">')
        .replace(/\^\{([^}]+)\}/g, '<tspan dy="-3" font-size="0.74em">$1</tspan><tspan dy="3">')
        .replace(/\^([a-zA-Z0-9]+)/g, '<tspan dy="-3" font-size="0.74em">$1</tspan><tspan dy="3">')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\pi/g, 'π')
        .replace(/\\beta/g, 'β')
        .replace(/\\cdot/g, '·')
        .replace(/\s*&\s*/g, ' ');

      return `<text${attrs}>${processed}</text>`;
    });
  }

  /**
   * Formats mathematical formulas, transforming \frac{num}{den} into accessible vertical fractional structures.
   */
  public static formatFormulaHtml(rawFormula: string): React.ReactNode {
    if (!rawFormula) return '';
    const cleaned = SymbolParser.cleanLatexNoise(rawFormula);
    const fracRegex = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = fracRegex.exec(cleaned)) !== null) {
      if (match.index > lastIndex) {
        parts.push(SymbolParser.formatToHtml(cleaned.substring(lastIndex, match.index)));
      }
      const num = match[1];
      const den = match[2];
      parts.push(
        React.createElement(
          'span',
          {
            key: `frac-${match.index}`,
            className:
              'inline-flex flex-col items-center align-middle mx-1 text-center font-mono text-[0.88em]',
          },
          React.createElement(
            'span',
            { className: 'border-b border-current px-1 pb-0.5 leading-none' },
            SymbolParser.formatToHtml(num)
          ),
          React.createElement(
            'span',
            { className: 'pt-0.5 leading-none' },
            SymbolParser.formatToHtml(den)
          )
        )
      );
      lastIndex = fracRegex.lastIndex;
    }

    if (lastIndex < cleaned.length) {
      parts.push(SymbolParser.formatToHtml(cleaned.substring(lastIndex)));
    }

    return React.createElement(
      'span',
      { className: 'inline-flex items-center flex-wrap leading-relaxed' },
      ...parts
    );
  }

  /**
   * Formats electronic schematic labels into styled elements with semantic <sub> and <sup> tags.
   */
  public static formatToHtml(rawText: string): React.ReactNode {
    if (!rawText) return '';
    const text = SymbolParser.cleanLatexNoise(rawText);
    const tokenRegex =
      /(_\{([^}]+)\}|_([a-zA-Z0-9+\-*(),]+)|\^\{([^}]+)\}|\^([a-zA-Z0-9+\-*(),]+)|\\Delta|\\pi|\\beta|\\cdot|\\ge|\\le|\\approx|\\parallel|\\sqrt)/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('_')) {
        const sub = match[2] ?? match[3];
        elements.push(
          React.createElement(
            'sub',
            {
              key: `sub-${match.index}`,
              className: 'text-[0.72em] font-semibold leading-none opacity-95',
            },
            sub
          )
        );
      } else if (token.startsWith('^')) {
        const sup = match[4] ?? match[5];
        elements.push(
          React.createElement(
            'sup',
            {
              key: `sup-${match.index}`,
              className: 'text-[0.72em] font-semibold leading-none opacity-95',
            },
            sup
          )
        );
      } else {
        elements.push(LATEX_SYMBOL_MAP[token] ?? token);
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return React.createElement(
      'span',
      { className: 'inline-flex items-baseline tracking-tight font-mono' },
      ...elements
    );
  }

  /**
   * Parses full prose blocks (mentor dialogue, questions, hints) and formats inline scientific symbols and fractions.
   */
  public static formatRichScientificText(rawText: string): React.ReactNode {
    if (!rawText) return '';
    const text = SymbolParser.cleanLatexNoise(rawText);
    const lines = text.split('\n');

    return React.createElement(
      React.Fragment,
      null,
      ...lines.map((line, lineIdx) => {
        const tokens = line.split(/(\s+|[,;()]+)/);
        const lineElements: React.ReactNode[] = tokens.map((token, tokIdx) => {
          if (token.includes('\\frac')) {
            return React.createElement(
              'span',
              { key: tokIdx, className: 'font-mono text-cyan-300' },
              SymbolParser.formatFormulaHtml(token)
            );
          }
          if (
            /[a-zA-Z]+_[a-zA-Z0-9{}]+|[a-zA-Z]+\^[a-zA-Z0-9{}]+|\\Delta|\\beta|\\pi|\\cdot|\\ge|\\le|\\approx|\\parallel|\\sqrt/.test(
              token
            )
          ) {
            return React.createElement(
              'span',
              { key: tokIdx, className: 'font-mono text-cyan-300' },
              SymbolParser.formatToHtml(token)
            );
          }
          return token;
        });

        if (lineIdx < lines.length - 1) {
          lineElements.push(React.createElement('br', { key: `br-${lineIdx}` }));
        }

        return React.createElement(React.Fragment, { key: lineIdx }, ...lineElements);
      })
    );
  }
}

/**
 * Direct exported functions conforming to required function signatures and backwards compatibility.
 */
export const formatSymbol = (label: string): string => SymbolParser.formatSymbol(label);
export const cleanLatexNoise = (text: string): string => SymbolParser.cleanLatexNoise(text);
export const formatSchematicLabel = (rawText: string): React.ReactNode => SymbolParser.formatToHtml(rawText);
export const formatFormulaHtml = (rawFormula: string): React.ReactNode => SymbolParser.formatFormulaHtml(rawFormula);
export const formatRichScientificText = (rawText: string): React.ReactNode => SymbolParser.formatRichScientificText(rawText);
export const sanitizeSvgTextLabels = (svgContent: string): string => SymbolParser.sanitizeSvg(svgContent);
