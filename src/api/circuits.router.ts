/**
 * @file circuits.router.ts
 * @description Express REST router managing circuit catalogs, detailed retrieval, user uploads, and deletions.
 * Follows SRP and secure two-layer error handling.
 * @author s-reinmar
 * @license MIT
 */

import { Router, Response } from 'express';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import {
  getCircuitsFromDb,
  getCircuitByIdFromDb,
  insertCircuitToDb,
  deleteCircuitFromDb,
} from '../db/circuits.ts';

export const circuitsRouter = Router();

/**
 * GET /api/circuits
 * Retrieves public circuits and private circuits owned by the authenticated caller.
 */
circuitsRouter.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const circuitsList = await getCircuitsFromDb(req.user?.uid);
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
    const circuit = await getCircuitByIdFromDb(req.params.id, req.user?.uid);
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
 * Creates a new custom circuit owned by the authenticated user.
 */
circuitsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Wymagane uwierzytelnienie użytkownika.' });
      return;
    }

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
      isPublic: false,
      userId,
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
 * Deletes a circuit owned by the requesting authenticated user.
 */
circuitsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Wymagane uwierzytelnienie użytkownika.' });
      return;
    }

    const success = await deleteCircuitFromDb(req.params.id, userId);
    if (!success) {
      res.status(404).json({ error: 'Obwód nie istnieje lub brak uprawnień do jego usunięcia.' });
      return;
    }

    res.json({ success: true, message: 'Obwód został pomyślnie usunięty.' });
  } catch (error) {
    console.error(`[API Circuits] Błąd usuwania obwodu ${req.params.id}:`, error);
    res.status(500).json({ error: 'Nie udało się usunąć wskazanego obwodu.' });
  }
});
