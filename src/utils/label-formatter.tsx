/**
 * @file label-formatter.tsx
 * @description Advanced symbol formatter rendering LaTeX-like subscripts (<sub>) and superscripts (<sup>).
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';

/**
 * Formats electronic schematic labels and formulas into styled JSX elements with <sub> and <sup>.
 * Supports patterns like R_b1, U_in, C_1, D_z, C_{filtr}, U_{CC}, P_{z,max}, V^2, etc.
 */
export function formatSchematicLabel(text: string): React.ReactNode {
  if (!text) return '';

  // Match:
  // 1. Subscripts: _{...} or _([a-zA-Z0-9+\-*(),]+)
  // 2. Superscripts: ^{...} or \^([a-zA-Z0-9+\-*(),]+)
  // 3. Greek/LaTeX symbols: \Delta, \pi, \beta, \cdot, \ge, \le, \approx, \parallel
  const tokenRegex = /(_\{([^}]+)\}|_([a-zA-Z0-9+\-*(),]+)|\^\{([^}]+)\}|\^([a-zA-Z0-9+\-*(),]+)|\\Delta|\\pi|\\beta|\\cdot|\\ge|\\le|\\approx|\\parallel|\\sqrt)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith('_')) {
      const subContent = match[2] ?? match[3];
      elements.push(
        <sub key={`sub-${match.index}`} className="text-[0.72em] font-semibold leading-none opacity-95">
          {subContent}
        </sub>
      );
    } else if (token.startsWith('^')) {
      const supContent = match[4] ?? match[5];
      elements.push(
        <sup key={`sup-${match.index}`} className="text-[0.72em] font-semibold leading-none opacity-95">
          {supContent}
        </sup>
      );
    } else {
      // Map common math/Greek tokens
      switch (token) {
        case '\\Delta':
          elements.push('Δ');
          break;
        case '\\pi':
          elements.push('π');
          break;
        case '\\beta':
          elements.push('β');
          break;
        case '\\cdot':
          elements.push(' · ');
          break;
        case '\\ge':
          elements.push(' ≥ ');
          break;
        case '\\le':
          elements.push(' ≤ ');
          break;
        case '\\approx':
          elements.push(' ≈ ');
          break;
        case '\\parallel':
          elements.push(' ∥ ');
          break;
        case '\\sqrt':
          elements.push('√');
          break;
        default:
          elements.push(token);
      }
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <span className="inline-flex items-baseline tracking-tight font-mono">{elements}</span>;
}
