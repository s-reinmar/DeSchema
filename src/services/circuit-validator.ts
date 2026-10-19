/**
 * @file circuit-validator.ts
 * @description Validates arbitrary JSON schema against the Circuit entity domain requirements.
 * @author s-reinmar
 * @license MIT
 */

import type { Circuit, CircuitSymbol, SocraticStep, ValidationResult } from '../types/circuit.types.ts';

export class CircuitValidator {
  /**
   * Validates parsed JSON or raw unknown input against Circuit contract.
   */
  public static validate(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Plik nie zawiera poprawnego obiektu JSON.'] };
    }

    const rec = data as Record<string, unknown>;

    if (typeof rec.id !== 'string' || rec.id.trim().length === 0) {
      errors.push('Brak lub niepoprawny parametr "id" (wymagany niepusty ciąg znaków).');
    }

    if (typeof rec.title !== 'string' || rec.title.trim().length === 0) {
      errors.push('Brak lub niepoprawny parametr "title" (wymagany tytuł obwodu).');
    }

    if (typeof rec.description !== 'string') {
      errors.push('Brak parametru "description" (opis obwodu).');
    }

    if (typeof rec.svgViewBox !== 'string' || !rec.svgViewBox.trim()) {
      errors.push('Brak parametru "svgViewBox" (np. "0 0 680 380").');
    }

    if (typeof rec.svgContent !== 'string' || !rec.svgContent.trim()) {
      errors.push('Brak parametru "svgContent" (zawartość grafiki SVG obwodu).');
    }

    const symbolValidation = this.validateSymbols(rec.symbols);
    errors.push(...symbolValidation.errors);

    const stepValidation = this.validateSteps(rec.socraticSteps);
    errors.push(...stepValidation.errors);

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedCircuit: Circuit = {
      id: (rec.id as string).trim(),
      title: (rec.title as string).trim(),
      description: (rec.description as string).trim(),
      svgViewBox: (rec.svgViewBox as string).trim(),
      svgContent: rec.svgContent as string,
      symbols: symbolValidation.symbols,
      socraticSteps: stepValidation.steps,
      isCustom: true,
    };

    return { isValid: true, errors: [], circuit: sanitizedCircuit };
  }

  private static validateSymbols(raw: unknown): { symbols: CircuitSymbol[]; errors: string[] } {
    const errors: string[] = [];
    if (!Array.isArray(raw) || raw.length === 0) {
      return { symbols: [], errors: ['Wymagana jest niepusta tablica "symbols".'] };
    }

    const symbols: CircuitSymbol[] = [];
    raw.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Symbol na pozycji [${index}] nie jest obiektem.`);
        return;
      }
      const s = item as Record<string, unknown>;
      if (typeof s.id !== 'string' || typeof s.label !== 'string' || typeof s.explanation !== 'string') {
        errors.push(`Symbol na pozycji [${index}] musi posiadać pola id, label oraz explanation.`);
        return;
      }
      symbols.push({
        id: s.id,
        label: s.label,
        x: typeof s.x === 'number' ? s.x : 0,
        y: typeof s.y === 'number' ? s.y : 0,
        explanation: s.explanation,
        name: typeof s.name === 'string' ? s.name : undefined,
        physicalRole: typeof s.physicalRole === 'string' ? s.physicalRole : undefined,
        formula: typeof s.formula === 'string' ? s.formula : undefined,
        formulaDescription: typeof s.formulaDescription === 'string' ? s.formulaDescription : undefined,
        typicalValue: typeof s.typicalValue === 'string' ? s.typicalValue : undefined,
      });
    });

    return { symbols, errors };
  }

  private static validateSteps(raw: unknown): { steps: SocraticStep[]; errors: string[] } {
    const errors: string[] = [];
    if (!Array.isArray(raw) || raw.length !== 4) {
      return { steps: [], errors: ['Wymagane są dokładnie 4 kroki sokratejskie ("socraticSteps").'] };
    }

    const steps: SocraticStep[] = [];
    raw.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Krok sokratejski [${index}] nie jest obiektem.`);
        return;
      }
      const st = item as Record<string, unknown>;
      const stepNum = st.stepNumber as number;
      if (![1, 2, 3, 4].includes(stepNum)) {
        errors.push(`Krok [${index}] ma niepoprawny stepNumber (oczekiwano 1, 2, 3 lub 4).`);
        return;
      }
      steps.push({
        stepNumber: stepNum as 1 | 2 | 3 | 4,
        title: typeof st.title === 'string' ? st.title : `Krok ${stepNum}`,
        promptQuestion: typeof st.promptQuestion === 'string' ? st.promptQuestion : '',
        hint: typeof st.hint === 'string' ? st.hint : '',
        reflectionAnswer: typeof st.reflectionAnswer === 'string' ? st.reflectionAnswer : '',
        targetSymbolIds: Array.isArray(st.targetSymbolIds) ? (st.targetSymbolIds as string[]) : [],
      });
    });

    return { steps, errors };
  }
}
