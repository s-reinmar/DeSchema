/**
 * @file circuit-analyzer.service.ts
 * @description Implementation of ICircuitAnalyzerService powered by @google/genai multimodal vision.
 * Translates schematic diagrams into SVG vectors and 4-tier Socratic questions.
 * @author s-reinmar
 * @license MIT
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  CircuitAnalysisRequest,
  CircuitAnalysisResult,
  ICircuitAnalyzerService,
} from '../interfaces/circuit-analyzer.interface.ts';
import { CircuitSymbol, SocraticStep } from '../types/circuit.types.ts';

/**
 * System prompt setting pedagogical guidelines, SVG coordinate standards, and 4-tier Socratic methodology.
 */
const SCHEMATIC_SYSTEM_PROMPT = `
Jesteś elitarnym profesorem inżynierii elektronicznej oraz ekspertem wizualizacji wektorowej SVG w projekcie dydaktycznym DeSchema Mentor.
Twoim zadaniem jest gruntowna analiza przesłanego zdjęcia, skanu lub schematu obwodu elektronicznego i wygenerowanie:
1. Znormalizowanego, pięknego schematu wektorowego SVG wewnątrz viewBox="0 0 700 400".
2. Listy wykrytych komponentów elektronicznych (symbole, role fizyczne, wzory projektowe, wartości typowe).
3. Dokładnie 4 pytań w metodyce sokratejskiej (krok po kroku bez dawania gotowców, zmuszających do myślenia).

Standard SVG:
- Używaj stroke="currentColor", stroke-width="2.5", fill="none" dla ścieżek i przewodów.
- Punkty węzłowe (połączenia przewodów) oznaczaj jako <circle cx="..." cy="..." r="4" fill="currentColor"/>.
- Symbole komponentów umieszczaj w grupach <g id="elem-{id}" transform="translate(x, y)"> z oznaczeniami zacisków i etykietami <text>.
- Oznaczaj punkty pomiarowe i kontrolne (np. Wejście U_in, Wyjście U_wy, Punkty kontrolne TP1, TP2, Masa GND).
- Kolorystyka musi współpracować z motywem jasnym i ciemnym (dlatego stosuj stroke="currentColor", fill-opacity="0.15").

Metodyka 4 Kroków Sokratejskich:
- Krok 1 (stepNumber=1): Identyfikacja topologii i stan początkowy (kierunek przewodzenia, stan spoczynkowy).
- Krok 2 (stepNumber=2): Mechanizm dynamiczny (wzmocnienie, wygładzanie tętnień, reakcja na częstotliwość).
- Krok 3 (stepNumber=3): Graniczne warunki pracy i marginesy bezpieczeństwa (napięcie wsteczne PIV, moc dopuszczalna).
- Krok 4 (stepNumber=4): Stany nieustalone i diagnoza awarii (prąd udarowy, skutek zwarcia/przebicia elementu).
Odpowiedzi i pytania muszą być w języku polskim, zwięzłe, merytoryczne i precyzyjne pod kątem fizyki półprzewodników i praw elektrotechniki.
`;

/**
 * Response schema enforcing strict JSON format for Gemini output.
 */
const ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    category: { type: Type.STRING },
    svgViewBox: { type: Type.STRING },
    svgContent: { type: Type.STRING },
    symbols: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          name: { type: Type.STRING },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          physicalRole: { type: Type.STRING },
          formula: { type: Type.STRING },
          formulaDescription: { type: Type.STRING },
          typicalValue: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'label', 'x', 'y', 'explanation'],
      },
    },
    socraticSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          promptQuestion: { type: Type.STRING },
          hint: { type: Type.STRING },
          reflectionAnswer: { type: Type.STRING },
          targetSymbolIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['stepNumber', 'title', 'promptQuestion', 'hint', 'reflectionAnswer', 'targetSymbolIds'],
      },
    },
  },
  required: ['title', 'description', 'category', 'svgViewBox', 'svgContent', 'symbols', 'socraticSteps'],
};

export class CircuitAnalyzerService implements ICircuitAnalyzerService {
  private readonly genAiClient: GoogleGenAI | null;

  constructor(genAiClient?: GoogleGenAI | null) {
    if (genAiClient !== undefined) {
      this.genAiClient = genAiClient;
    } else {
      const apiKey = process.env.GEMINI_API_KEY;
      this.genAiClient = apiKey ? new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      }) : null;
    }
  }

  public async analyzeSchematicImage(request: CircuitAnalysisRequest): Promise<CircuitAnalysisResult> {
    if (!this.genAiClient) {
      throw new Error('Klucz API Gemini (GEMINI_API_KEY) nie jest skonfigurowany w środowisku serwera.');
    }

    const { rawBase64, mimeType } = this.extractBase64Data(request.imageBase64, request.mimeType);

    const promptText = request.pedagogicalFocus
      ? `Przeanalizuj poniższy schemat. Zwróć szczególną uwagę na zagadnienie dydaktyczne: "${request.pedagogicalFocus}". Stwórz schemat SVG i 4 kroki sokratejskie.`
      : 'Przeanalizuj poniższy schemat obwodu elektronicznego. Stwórz precyzyjny schemat wektorowy SVG oraz 4 kroki sokratejskie.';

    const response = await this.genAiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: rawBase64,
              mimeType,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: SCHEMATIC_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Model Gemini nie zwrócił odpowiedzi podczas analizy obrazu.');
    }

    return this.parseAndValidateResponse(outputText);
  }

  private extractBase64Data(input: string, fallbackMime?: string): { rawBase64: string; mimeType: string } {
    let rawBase64 = input.trim();
    let mimeType = fallbackMime || 'image/png';

    if (rawBase64.startsWith('data:')) {
      const parts = rawBase64.split(';base64,');
      if (parts.length === 2) {
        mimeType = parts[0].replace('data:', '');
        rawBase64 = parts[1];
      }
    }

    return { rawBase64, mimeType };
  }

  private parseAndValidateResponse(jsonString: string): CircuitAnalysisResult {
    const parsed = JSON.parse(jsonString) as CircuitAnalysisResult;

    const validatedSteps: SocraticStep[] = (parsed.socraticSteps || []).map((step, idx) => ({
      stepNumber: ((idx + 1) as 1 | 2 | 3 | 4),
      title: step.title || `Krok ${idx + 1}`,
      promptQuestion: step.promptQuestion || '',
      hint: step.hint || '',
      reflectionAnswer: step.reflectionAnswer || '',
      targetSymbolIds: Array.isArray(step.targetSymbolIds) ? step.targetSymbolIds : [],
    }));

    const validatedSymbols: CircuitSymbol[] = (parsed.symbols || []).map((sym) => ({
      id: sym.id || `sym-${Math.random().toString(36).slice(2, 6)}`,
      label: sym.label || sym.id,
      name: sym.name,
      x: Number(sym.x) || 100,
      y: Number(sym.y) || 100,
      physicalRole: sym.physicalRole,
      formula: sym.formula,
      formulaDescription: sym.formulaDescription,
      typicalValue: sym.typicalValue,
      explanation: sym.explanation || '',
    }));

    return {
      title: parsed.title || 'Rozpoznany Układ Elektroniczny',
      description: parsed.description || 'Schemat wygenerowany z obrazu przez model sztucznej inteligencji.',
      category: parsed.category || 'Ogólne',
      svgViewBox: parsed.svgViewBox || '0 0 700 400',
      svgContent: parsed.svgContent || '',
      symbols: validatedSymbols,
      socraticSteps: validatedSteps,
    };
  }
}
