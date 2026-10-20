/**
 * @file svg-token-optimizer.service.ts
 * @description Headless domain service for Token-Safe SVG sanitization, metadata stripping,
 * floating-point coordinate precision compression, and token economy estimation.
 * Adheres strictly to SRP and DIP without any dependencies on UI frameworks.
 * @author @s-reinmar
 * @license MIT
 */

import type {
  ISvgTokenOptimizer,
  SvgUploadRules,
  SvgOptimizationReport,
  OptimizedSvgResult,
} from '../interfaces/svg-token-optimizer.interface.ts';
import type { CircuitSymbol } from '../types/circuit.types.ts';

export const DEFAULT_SVG_UPLOAD_RULES: SvgUploadRules = {
  maxRawSizeBytes: 150 * 1024,       // 150 KB max upload
  maxOptimizedSizeBytes: 35 * 1024,  // 35 KB target
  maxAllowedTokens: 4500,            // Strict context ceiling
  allowedSvgElements: [
    'svg', 'g', 'path', 'rect', 'circle', 'ellipse',
    'line', 'polyline', 'polygon', 'text', 'tspan', 'title', 'desc', 'defs',
  ],
  forbiddenTags: [
    'script', 'iframe', 'object', 'embed', 'foreignObject',
    'link', 'style', 'image', 'use', 'animate', 'set',
  ],
  forbiddenAttributes: [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onmousedown',
    'onmouseup', 'href', 'xlink:href',
  ],
};

export class SvgTokenOptimizer implements ISvgTokenOptimizer {
  public constructor(private readonly rules: SvgUploadRules = DEFAULT_SVG_UPLOAD_RULES) {}

  /**
   * Validates raw incoming SVG against strict size, structure, and XSS safety rules.
   */
  public validateUploadRules(rawSvg: string): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const trimmed = (rawSvg || '').trim();

    if (!trimmed) {
      errors.push('Wklejony kod lub plik SVG jest pusty.');
      return { isValid: false, errors, warnings };
    }

    const sizeBytes = new Blob([trimmed]).size;
    if (sizeBytes > this.rules.maxRawSizeBytes) {
      errors.push(
        `Rozmiar pliku SVG (${(sizeBytes / 1024).toFixed(1)} KB) przekracza dopuszczalny limit ${(this.rules.maxRawSizeBytes / 1024).toFixed(0)} KB.`
      );
    }

    // Security XSS check: forbidden tags
    for (const tag of this.rules.forbiddenTags) {
      const tagRegex = new RegExp(`<\\s*${tag}\\b`, 'i');
      if (tagRegex.test(trimmed)) {
        errors.push(`Wykryto niedozwolony ze względów bezpieczeństwa tag <${tag}>.`);
      }
    }

    // Security XSS check: event handlers
    for (const attr of this.rules.forbiddenAttributes) {
      const attrRegex = new RegExp(`\\b${attr}\\s*=`, 'i');
      if (attrRegex.test(trimmed)) {
        errors.push(`Wykryto zabroniony atrybut interaktywny lub link zewnętrzny: ${attr}.`);
      }
    }

    // Check SVG wrapper or group
    if (!/<svg\b|<g\b/i.test(trimmed)) {
      errors.push('Brak głównego węzła wektorowego <svg> lub warstwy <g>.');
    }

    if (!/viewBox\s*=/i.test(trimmed)) {
      warnings.push('Brak jawnego atrybutu viewBox (zostanie wyliczony z width/height lub przyjęty jako 0 0 740 460).');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Estimates tokens for XML/SVG string using code-token calibration (1 token ≈ 3.6 characters).
   */
  public estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 3.6);
  }

  /**
   * Executes the full Token-Safe optimization pipeline:
   * 1. Strips editor namespaces, RDF, sodipodi, and Inkscape metadata
   * 2. Rounds floating-point coordinates to 1 decimal place
   * 3. Collapses empty groups and redundant whitespace
   * 4. Normalizes viewBox and auto-detects circuit symbols
   */
  public optimizeSvg(rawSvg: string): OptimizedSvgResult {
    const startTime = performance.now();
    const rawBytes = new Blob([rawSvg]).size;
    const rawTokens = this.estimateTokens(rawSvg);
    const strippedCategories: string[] = [];

    const validation = this.validateUploadRules(rawSvg);
    if (!validation.isValid) {
      return {
        cleanSvgContent: '',
        viewBox: '0 0 740 460',
        width: 740,
        height: 460,
        report: {
          rawLengthBytes: rawBytes,
          optimizedLengthBytes: 0,
          rawTokensEstimated: rawTokens,
          optimizedTokensEstimated: 0,
          tokenSavingsPercent: 0,
          executionTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
          strippedMetadataCategories: [],
          detectedSymbols: [],
          isValid: false,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      };
    }

    let processed = rawSvg.trim();

    // 1. Remove XML declaration and comments
    if (/<\?xml|<!DOCTYPE|<!--/i.test(processed)) {
      processed = processed
        .replace(/<\?xml[\s\S]*?\?>/gi, '')
        .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
        .replace(/<!--[\s\S]*?-->/gi, '');
      strippedCategories.push('Komentarze i nagłówki XML/DOCTYPE');
    }

    // 2. Remove Editor Metadata: <metadata>, <rdf:RDF>, <sodipodi:*>, <inkscape:*>
    if (/<metadata|<sodipodi|<inkscape|<i:pgf/i.test(processed)) {
      processed = processed
        .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
        .replace(/<sodipodi:[^>]*\/>/gi, '')
        .replace(/<sodipodi:[^>]*>[\s\S]*?<\/sodipodi:[^>]*>/gi, '')
        .replace(/<inkscape:[^>]*\/>/gi, '')
        .replace(/<inkscape:[^>]*>[\s\S]*?<\/inkscape:[^>]*>/gi, '');
      strippedCategories.push('Metadane edytorów (Inkscape / Illustrator / Corel)');
    }

    // 3. Strip editor namespace declarations and attributes
    processed = processed
      .replace(/\s*xmlns:(?:inkscape|sodipodi|i|graph|adobe-illustrator-ns)="[^"]*"/gi, '')
      .replace(/\s*(?:inkscape|sodipodi):[a-z0-9\-]+="[^"]*"/gi, '')
      .replace(/\s*id="(?:namedview|defs)[^"]*"/gi, '')
      .replace(/\s*data-name="[^"]*"/gi, '');

    // 4. Extract viewBox
    const viewBox = this.extractViewBox(processed);
    const [w, h] = this.parseViewBoxDimensions(viewBox);

    // 5. Extract inner SVG content if enclosed in <svg> ... </svg>
    const svgMatch = processed.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    let innerContent = svgMatch ? svgMatch[1] : processed;

    // 6. Coordinate precision compression: round floating-point numbers with >= 2 decimals to max 1 decimal place
    const beforeCoordLength = innerContent.length;
    innerContent = innerContent.replace(
      /([0-9]+\.[0-9]{2,})/g,
      (match) => String(Math.round(parseFloat(match) * 10) / 10)
    );
    if (innerContent.length < beforeCoordLength) {
      strippedCategories.push('Kompresja precyzji współrzędnych zmiennoprzecinkowych do 1 miejsca');
    }

    // 7. Strip empty groups and collapse spaces
    innerContent = innerContent
      .replace(/<g[^>]*>\s*<\/g>/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();

    // 8. Auto-detect schematic symbols from <text> and <g id="...">
    const detectedSymbols = this.detectSymbols(innerContent);

    const optimizedBytes = new Blob([innerContent]).size;
    const optimizedTokens = this.estimateTokens(innerContent);
    const tokenSavingsPercent = rawTokens > 0
      ? Math.max(0, Math.round(((rawTokens - optimizedTokens) / rawTokens) * 1000) / 10)
      : 0;

    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      cleanSvgContent: innerContent,
      viewBox,
      width: w,
      height: h,
      report: {
        rawLengthBytes: rawBytes,
        optimizedLengthBytes: optimizedBytes,
        rawTokensEstimated: rawTokens,
        optimizedTokensEstimated: optimizedTokens,
        tokenSavingsPercent,
        executionTimeMs,
        strippedMetadataCategories: strippedCategories,
        detectedSymbols,
        isValid: true,
        errors: [],
        warnings: validation.warnings,
      },
    };
  }

  private extractViewBox(svg: string): string {
    const viewBoxMatch = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    if (viewBoxMatch && viewBoxMatch[1].trim()) {
      return viewBoxMatch[1].trim();
    }
    const widthMatch = svg.match(/width\s*=\s*["']?([0-9.]+)/i);
    const heightMatch = svg.match(/height\s*=\s*["']?([0-9.]+)/i);
    if (widthMatch && heightMatch) {
      const w = Math.round(parseFloat(widthMatch[1]));
      const h = Math.round(parseFloat(heightMatch[1]));
      return `0 0 ${w} ${h}`;
    }
    return '0 0 740 460';
  }

  private parseViewBoxDimensions(viewBox: string): [number, number] {
    const parts = viewBox.trim().split(/\s+/).map((n) => parseFloat(n));
    if (parts.length >= 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
      return [parts[2], parts[3]];
    }
    return [740, 460];
  }

  private detectSymbols(svgContent: string): CircuitSymbol[] {
    const symbols: CircuitSymbol[] = [];
    const textRegex = /<text[^>]*x=["']?([0-9.]+)["']?[^>]*y=["']?([0-9.]+)["']?[^>]*>(.*?)<\/text>/gi;
    let match: RegExpExecArray | null;

    let index = 1;
    while ((match = textRegex.exec(svgContent)) !== null && index <= 12) {
      const x = Math.round(parseFloat(match[1]) || 0);
      const y = Math.round(parseFloat(match[2]) || 0);
      const rawLabel = match[3].replace(/<[^>]+>/g, '').trim();

      // Only pick plausible electronic component designators (e.g. R1, R_1, C1, D1, Q1, U_in, GND)
      if (rawLabel && /^[A-Z][a-zA-Z0-9_{},^+-]*$/.test(rawLabel) && rawLabel.length <= 10) {
        symbols.push({
          id: `sym-${index}-${rawLabel.replace(/[{}_]/g, '')}`,
          label: rawLabel,
          name: `Komponent ${rawLabel}`,
          x,
          y,
          physicalRole: 'Zidentyfikowany element wektora schematu.',
          explanation: `Komponent schematu wektorowego oznaczony etykietą ${rawLabel}.`,
        });
        index++;
      }
    }

    return symbols;
  }
}

export const svgTokenOptimizer = new SvgTokenOptimizer();
