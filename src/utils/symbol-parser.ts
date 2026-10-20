/**
 * @file symbol-parser.ts
 * @description Dedicated SymbolParser module providing pure, uniform conversion of electrical formulas,
 * Greek alphabet symbols, LaTeX syntax, and subscripts into clean Unicode representations and semantic HTML elements.
 * Unifies all Greek alphabet glyphs (uppercase, lowercase, variants, and engineering unit symbols).
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
  normalizeGreekAlphabet(text: string): string;
}

/**
 * Map of characters to Unicode subscripts (numbers, basic letters, operators, Greek letters).
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
  // Greek letter subscripts
  'β': 'ᵦ', 'γ': 'ᵧ', 'ρ': 'ᵨ', 'φ': 'ᵩ', 'χ': 'ᵪ',
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
 * Canonical mapping to unify duplicate / compatibility Unicode glyphs into standard Greek Unicode glyphs.
 */
export const GREEK_CANONICAL_MAP: Readonly<Record<string, string>> = {
  '\u2126': 'Ω', // Ohm sign -> Greek Capital Letter Omega (\u03A9)
  '\u00B5': 'μ', // Micro sign -> Greek Small Letter Mu (\u03BC)
  '\u03D1': 'θ', // Greek theta symbol -> standard theta (\u03B8)
  '\u03D5': 'φ', // Greek phi symbol -> standard phi (\u03C6)
  '\u03D6': 'π', // Greek pi symbol -> standard pi (\u03C0)
  '\u03F1': 'ρ', // Greek rho symbol -> standard rho (\u03C1)
  '\u03F5': 'ε', // Greek lunate epsilon -> standard epsilon (\u03B5)
  '\u03F0': 'κ', // Greek kappa symbol -> standard kappa (\u03BA)
};

/**
 * Authoritative mapping of Greek alphabet and mathematical operators to standard Unicode glyphs.
 */
export const LATEX_SYMBOL_MAP: Readonly<Record<string, string>> = {
  // Lowercase Greek Alphabet (all 24 characters + variants)
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\vartheta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\varkappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\micro': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\omicron': 'ο',
  '\\pi': 'π',
  '\\varpi': 'π',
  '\\rho': 'ρ',
  '\\varrho': 'ρ',
  '\\sigma': 'σ',
  '\\varsigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\varphi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',

  // Uppercase Greek Alphabet
  '\\Alpha': 'Α',
  '\\Beta': 'Β',
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Epsilon': 'Ε',
  '\\Zeta': 'Ζ',
  '\\Eta': 'Η',
  '\\Theta': 'Θ',
  '\\Iota': 'Ι',
  '\\Kappa': 'Κ',
  '\\Lambda': 'Λ',
  '\\Mu': 'Μ',
  '\\Nu': 'Ν',
  '\\Xi': 'Ξ',
  '\\Omicron': 'Ο',
  '\\Pi': 'Π',
  '\\Rho': 'Ρ',
  '\\Sigma': 'Σ',
  '\\Tau': 'Τ',
  '\\Upsilon': 'Υ',
  '\\Phi': 'Φ',
  '\\Chi': 'Χ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',
  '\\ohm': 'Ω',

  // Mathematical & Physical Operators / Relations
  '\\cdot': ' · ',
  '\\times': ' × ',
  '\\div': ' ÷ ',
  '\\pm': '±',
  '\\mp': '∓',
  '\\ge': ' ≥ ',
  '\\geq': ' ≥ ',
  '\\le': ' ≤ ',
  '\\leq': ' ≤ ',
  '\\ne': ' ≠ ',
  '\\neq': ' ≠ ',
  '\\approx': ' ≈ ',
  '\\equiv': ' ≡ ',
  '\\parallel': ' ∥ ',
  '\\sqrt': '√',
  '\\infty': '∞',
  '\\to': ' → ',
  '\\rightarrow': ' → ',
  '\\circ': '°',
};

/**
 * Textual representations of Greek letters and electrical units without backslash in engineering descriptions.
 */
const GREEK_WORDS_REGEX =
  /\b(Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|micro|mikro|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|ohm|Ohm|OHM|kohm|kOhm|kOmega|Mohm|MOhm|MOmega|Gohm|GOhm)\b/g;

const GREEK_WORDS_MAP: Readonly<Record<string, string>> = {
  // Uppercase Greek
  Alpha: 'Α',
  Beta: 'Β',
  Gamma: 'Γ',
  Delta: 'Δ',
  Epsilon: 'Ε',
  Zeta: 'Ζ',
  Eta: 'Η',
  Theta: 'Θ',
  Iota: 'Ι',
  Kappa: 'Κ',
  Lambda: 'Λ',
  Mu: 'Μ',
  Nu: 'Ν',
  Xi: 'Ξ',
  Omicron: 'Ο',
  Pi: 'Π',
  Rho: 'Ρ',
  Sigma: 'Σ',
  Tau: 'Τ',
  Upsilon: 'Υ',
  Phi: 'Φ',
  Chi: 'Χ',
  Psi: 'Ψ',
  Omega: 'Ω',

  // Lowercase Greek
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  zeta: 'ζ',
  eta: 'η',
  theta: 'θ',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  mu: 'μ',
  micro: 'μ',
  mikro: 'μ',
  nu: 'ν',
  xi: 'ξ',
  omicron: 'ο',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω',

  // Electrical engineering units
  ohm: 'Ω',
  Ohm: 'Ω',
  OHM: 'Ω',
  kohm: 'kΩ',
  kOhm: 'kΩ',
  kOmega: 'kΩ',
  Mohm: 'MΩ',
  MOhm: 'MΩ',
  MOmega: 'MΩ',
  Gohm: 'GΩ',
  GOhm: 'GΩ',
};

/**
 * Static domain class for parsing, cleaning, and formatting scientific symbols and formulas.
 */
export class SymbolParser {
  /**
   * Unifies all Greek alphabet glyphs (Unicode variants, words, LaTeX macros, and micro units).
   */
  public static normalizeGreekAlphabet(text: string): string {
    if (!text) return '';
    let result = text;

    // 1. Canonicalize Unicode variants
    for (const [variant, canonical] of Object.entries(GREEK_CANONICAL_MAP)) {
      result = result.split(variant).join(canonical);
    }

    // 2. Replace LaTeX macros
    for (const [macro, glyph] of Object.entries(LATEX_SYMBOL_MAP)) {
      result = result.split(macro).join(glyph);
    }

    // 3. Replace word tokens
    result = result.replace(GREEK_WORDS_REGEX, (match) => GREEK_WORDS_MAP[match] ?? match);

    // 4. Normalize micro engineering units (e.g. 470uF -> 470 μF, 10uH -> 10 μH)
    result = result.replace(/(\d+)\s*u([FfHhAaVvSsMmWw]|sec|sek)\b/g, '$1 μ$2');

    return result;
  }

  /**
   * Primary entry point: Cleans LaTeX noise and converts Greek letters and indices
   * into clean Unicode characters with safe textual representation.
   */
  public static formatSymbol(label: string): string {
    if (!label) return '';
    let result = SymbolParser.cleanLatexNoise(label);
    result = SymbolParser.normalizeGreekAlphabet(result);

    // Convert subscripts: _{xyz} or _xyz (supporting Greek characters)
    result = result.replace(
      /_\{([^}]+)\}|_([a-zA-Z0-9+\-*(),\u0370-\u03FF]+)/g,
      (_match, group1, group2) => {
        const subContent = group1 ?? group2 ?? '';
        return SymbolParser.toUnicodeSubscript(subContent);
      }
    );

    // Convert superscripts: ^{xyz} or ^xyz (supporting Greek characters)
    result = result.replace(
      /\^\{([^}]+)\}|\^([a-zA-Z0-9+\-*(),\u0370-\u03FF]+)/g,
      (_match, group1, group2) => {
        const supContent = group1 ?? group2 ?? '';
        return SymbolParser.toUnicodeSuperscript(supContent);
      }
    );

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
   * Transforms raw SVG markup to replace subscripts and Greek letters in <text> tags with proper elements.
   */
  public static sanitizeSvg(svgContent: string): string {
    if (!svgContent) return '';
    return svgContent.replace(/<text([^>]*)>(.*?)<\/text>/gis, (_fullMatch, attrs, textInner) => {
      let processed = textInner
        .replace(/_\{([^}]+)\}/g, '<tspan baseline-shift="sub" font-size="0.74em">$1</tspan>')
        .replace(/_([a-zA-Z0-9]+)/g, '<tspan baseline-shift="sub" font-size="0.74em">$1</tspan>')
        .replace(/\^\{([^}]+)\}/g, '<tspan baseline-shift="super" font-size="0.74em">$1</tspan>')
        .replace(/\^([a-zA-Z0-9]+)/g, '<tspan baseline-shift="super" font-size="0.74em">$1</tspan>')
        .replace(/\s*&\s*/g, ' ');

      // Normalize all Greek alphabet symbols and operators in SVG
      processed = SymbolParser.normalizeGreekAlphabet(processed);

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
   * Formats electronic schematic labels into styled elements with semantic <sub>, <sup>, and Unicode Greek symbols.
   */
  public static formatToHtml(rawText: string): React.ReactNode {
    if (!rawText) return '';
    const text = SymbolParser.cleanLatexNoise(rawText);
    const tokenRegex =
      /(_\{([^}]+)\}|_([a-zA-Z0-9+\-*(),\u0370-\u03FF]+)|\^\{([^}]+)\}|\^([a-zA-Z0-9+\-*(),\u0370-\u03FF]+)|\\[a-zA-Z]+)/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(SymbolParser.normalizeGreekAlphabet(text.substring(lastIndex, match.index)));
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
            SymbolParser.normalizeGreekAlphabet(sub)
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
            SymbolParser.normalizeGreekAlphabet(sup)
          )
        );
      } else if (token in LATEX_SYMBOL_MAP) {
        elements.push(LATEX_SYMBOL_MAP[token]);
      } else {
        // Fallback for any other backslash token
        elements.push(SymbolParser.normalizeGreekAlphabet(token.replace(/^\\/, '')));
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(SymbolParser.normalizeGreekAlphabet(text.substring(lastIndex)));
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
            /[a-zA-Z]+_[a-zA-Z0-9{}]+|[a-zA-Z]+\^[a-zA-Z0-9{}]+|\\[a-zA-Z]+|[\u0370-\u03FF]/.test(
              token
            )
          ) {
            return React.createElement(
              'span',
              { key: tokIdx, className: 'font-mono text-cyan-300' },
              SymbolParser.formatToHtml(token)
            );
          }
          return SymbolParser.normalizeGreekAlphabet(token);
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
