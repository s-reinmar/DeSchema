/**
 * @file circuits.router.ts
 * @description Single-user REST router managing circuit catalogs, retrieval, uploads, and deletions.
 * Follows SRP and secure two-layer error handling.
 * @author s-reinmar
 * @license MIT
 */

import { Router, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth.ts';
import {
  getCircuitsFromDb,
  getCircuitByIdFromDb,
  insertCircuitToDb,
  deleteCircuitFromDb,
} from '../db/circuits.ts';
import { CircuitAnalyzerService } from '../services/circuit-analyzer.service.ts';

export const circuitsRouter = Router();
const circuitAnalyzer = new CircuitAnalyzerService();

/**
 * POST /api/circuits/analyze-image
 * Analyzes an uploaded schematic image or clipboard screenshot and synthesizes SVG and 4 Socratic questions.
 */
circuitsRouter.post('/analyze-image', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType, pedagogicalFocus } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim() === '') {
      res.status(400).json({ error: 'Wymagane jest przesłanie obrazu schematu w formacie base64.' });
      return;
    }

    const result = await circuitAnalyzer.analyzeSchematicImage({
      imageBase64,
      mimeType,
      pedagogicalFocus,
    });

    res.json(result);
  } catch (error) {
    console.error('[API Circuits] Błąd analizy obrazu schematu:', error);
    const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd podczas analizy schematu.';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /api/circuits
 * Retrieves all circuits from the single-user database.
 */
circuitsRouter.get('/', optionalAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const circuitsList = await getCircuitsFromDb();
    res.json(circuitsList);
  } catch (error) {
    console.error('[API Circuits] Błąd pobierania obwodów:', error);
    res.status(500).json({ error: 'Nie udało się pobrać listy obwodów.' });
  }
});

/**
 * GET /api/circuits/:id
 * Retrieves full circuit details with symbols and socratic steps.
 */
circuitsRouter.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const circuit = await getCircuitByIdFromDb(req.params.id);
    if (!circuit) {
      res.status(404).json({ error: `Obwód o id "${req.params.id}" nie został znaleziony.` });
      return;
    }
    res.json(circuit);
  } catch (error) {
    console.error(`[API Circuits] Błąd pobierania obwodu ${req.params.id}:`, error);
    res.status(500).json({ error: 'Nie udało się pobrać szczegółów obwodu.' });
  }
});

/**
 * POST /api/circuits
 * Creates a new custom circuit in the single-user database.
 */
circuitsRouter.post('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    if (!body || !body.title || !body.svgContent) {
      res.status(400).json({ error: 'Nieprawidłowe dane obwodu: wymagany tytuł i wektor SVG.' });
      return;
    }

    const id = body.id?.trim() || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const created = await insertCircuitToDb({
      id,
      title: body.title,
      description: body.description ?? '',
      svgViewBox: body.svgViewBox ?? '0 0 700 400',
      svgContent: body.svgContent,
      isPublic: true,
      symbols: Array.isArray(body.symbols) ? body.symbols : [],
      socraticSteps: Array.isArray(body.socraticSteps) ? body.socraticSteps : [],
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('[API Circuits] Błąd tworzenia nowego obwodu:', error);
    res.status(500).json({ error: 'Nie udało się zapisać nowego obwodu.' });
  }
});

/**
 * DELETE /api/circuits/:id
 * Deletes a circuit from the database.
 */
circuitsRouter.delete('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const success = await deleteCircuitFromDb(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Obwód nie istnieje lub nie mógł zostać usunięty.' });
      return;
    }

    res.json({ success: true, message: 'Obwód został pomyślnie usunięty.' });
  } catch (error) {
    console.error(`[API Circuits] Błąd usuwania obwodu ${req.params.id}:`, error);
    res.status(500).json({ error: 'Nie udało się usunąć wskazanego obwodu.' });
  }
});
