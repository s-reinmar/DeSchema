/**
 * @file circuit-analyzer-client.service.ts
 * @description Client-side HTTP service calling /api/circuits/analyze-image.
 * Conforms to ICircuitAnalyzerService, isolating networking from UI components.
 * @author s-reinmar
 * @license MIT
 */

import {
  CircuitAnalysisRequest,
  CircuitAnalysisResult,
  ICircuitAnalyzerService,
} from '../interfaces/circuit-analyzer.interface.ts';

export class CircuitAnalyzerClientService implements ICircuitAnalyzerService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/circuits') {
    this.baseUrl = baseUrl;
  }

  /**
   * Dispatches the image analysis request to the backend Gemini proxy endpoint.
   */
  public async analyzeSchematicImage(
    request: CircuitAnalysisRequest,
    token?: string | null
  ): Promise<CircuitAnalysisResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/analyze-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `Błąd serwera (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson && typeof errorJson.error === 'string') {
          errorMessage = errorJson.error;
        }
      } catch {
        // Ignoruj błąd parsowania JSON
      }
      throw new Error(errorMessage);
    }

    const result = (await response.json()) as CircuitAnalysisResult;
    return result;
  }
}

export const circuitAnalyzerClient = new CircuitAnalyzerClientService();
