/**
 * @file label-formatter.tsx
 * @description Advanced scientific typography and symbol formatter eliminating LaTeX noise and rendering clean HTML/SVG subscripts.
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';

/**
 * Strips rogue LaTeX syntax artifacts like &, $, $$, \quad, \text{} and alignment delimiters.
 */
export function cleanLatexNoise(text: string): string {
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
 * Formats electronic schematic labels into styled JSX elements with <sub> and <sup>.
 * Handles patterns like R_b1, U_in, C_1, D_z, C_{filtr}, U_{CC}, P_{z,max}, V^2, etc.
 */
export function formatSchematicLabel(rawText: string): React.ReactNode {
  if (!rawText) return '';
  const text = cleanLatexNoise(rawText);

  // Match subscripts, superscripts, and common physical Greek/math symbols
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
        <sub key={`sub-${match.index}`} className="text-[0.72em] font-semibold leading-none opacity-95">
          {sub}
        </sub>
      );
    } else if (token.startsWith('^')) {
      const sup = match[4] ?? match[5];
      elements.push(
        <sup key={`sup-${match.index}`} className="text-[0.72em] font-semibold leading-none opacity-95">
          {sup}
        </sup>
      );
    } else {
      elements.push(mapLatexSymbolToUnicode(token));
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <span className="inline-flex items-baseline tracking-tight font-mono">{elements}</span>;
}

/**
 * Formats mathematical formulas, transforming \frac{num}{den} into readable fractional structures.
 */
export function formatFormulaHtml(rawFormula: string): React.ReactNode {
  if (!rawFormula) return '';
  const cleaned = cleanLatexNoise(rawFormula);

  // Match LaTeX fractions: \frac{num}{den}
  const fracRegex = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fracRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push(formatSchematicLabel(cleaned.substring(lastIndex, match.index)));
    }

    const num = match[1];
    const den = match[2];

    parts.push(
      <span
        key={`frac-${match.index}`}
        className="inline-flex flex-col items-center align-middle mx-1 text-center font-mono text-[0.88em]"
      >
        <span className="border-b border-current px-1 pb-0.5 leading-none">
          {formatSchematicLabel(num)}
        </span>
        <span className="pt-0.5 leading-none">
          {formatSchematicLabel(den)}
        </span>
      </span>
    );

    lastIndex = fracRegex.lastIndex;
  }

  if (lastIndex < cleaned.length) {
    parts.push(formatSchematicLabel(cleaned.substring(lastIndex)));
  }

  return <span className="inline-flex items-center flex-wrap leading-relaxed">{parts}</span>;
}

/**
 * Parses full prose blocks (such as chat responses, hints, questions) and formats inline scientific symbols.
 */
export function formatRichScientificText(rawText: string): React.ReactNode {
  if (!rawText) return '';
  const text = cleanLatexNoise(rawText);
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lineIdx) => {
        // Tokenize line preserving spaces and punctuation
        const tokens = line.split(/(\s+|[,;()]+)/);

        return (
          <React.Fragment key={lineIdx}>
            {tokens.map((token, tokIdx) => {
              // If token contains LaTeX fraction
              if (token.includes('\\frac')) {
                return (
                  <span key={tokIdx} className="font-mono text-cyan-300">
                    {formatFormulaHtml(token)}
                  </span>
                );
              }
              // If token is a formula / subscript / greek expression
              if (
                /[a-zA-Z]+_[a-zA-Z0-9{}]+|[a-zA-Z]+\^[a-zA-Z0-9{}]+|\\Delta|\\beta|\\pi|\\cdot|\\ge|\\le|\\approx|\\parallel|\\sqrt/.test(
                  token
                )
              ) {
                return (
                  <span key={tokIdx} className="font-mono text-cyan-300">
                    {formatSchematicLabel(token)}
                  </span>
                );
              }
              return token;
            })}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}

/**
 * Transforms raw SVG markup, replacing subscripts in <text> tags with native <tspan> elements.
 */
export function sanitizeSvgTextLabels(svgContent: string): string {
  if (!svgContent) return '';

  return svgContent.replace(/<text([^>]*)>(.*?)<\/text>/gis, (_fullMatch, attrs, textInner) => {
    // Process textInner: replace _{...} or _xyz with <tspan dy="3" font-size="0.74em">xyz</tspan><tspan dy="-3">
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
 * Maps single LaTeX macros to their Unicode equivalent.
 */
function mapLatexSymbolToUnicode(token: string): string {
  switch (token) {
    case '\\Delta':
      return 'Δ';
    case '\\pi':
      return 'π';
    case '\\beta':
      return 'β';
    case '\\cdot':
      return ' · ';
    case '\\ge':
      return ' ≥ ';
    case '\\le':
      return ' ≤ ';
    case '\\approx':
      return ' ≈ ';
    case '\\parallel':
      return ' ∥ ';
    case '\\sqrt':
      return '√';
    default:
      return token;
  }
}
