/**
 * @file auth.ts
 * @description Express authentication middleware verifying Firebase ID Tokens via Firebase Admin SDK.
 * Implements Single-User Owner verification without multi-user database tables or user sync overhead.
 * @author s-reinmar
 * @license MIT
 */

import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

/**
 * Enforces valid Firebase ID token in Authorization header (Bearer <token>).
 * Validates owner identity without creating records in a database users table.
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Brak autoryzacji: Wymagany poprawny token Bearer.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Błąd weryfikacji tokenu Firebase ID:', error);
    res.status(401).json({ error: 'Brak autoryzacji: Nieprawidłowy lub wygasły token sesji.' });
  }
};

/**
 * Inspects Authorization header if present, decorating req.user without blocking unauthenticated requests.
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
  } catch {
    // Optional auth - continue even on token verification errors
  }

  next();
};
