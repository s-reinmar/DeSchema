/**
 * @file auth.ts
 * @description Express authentication middleware verifying Firebase ID Tokens via Firebase Admin SDK.
 * Supports mandatory authentication (requireAuth) and optional authentication (optionalAuth).
 * @author s-reinmar
 * @license MIT
 */

import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

/**
 * Enforces valid Firebase ID token in Authorization header (Bearer <token>).
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

    // Synchronize or touch user in PostgreSQL
    await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email ?? `${decodedToken.uid}@firebase.user`,
      decodedToken.name,
      decodedToken.picture
    );

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Błąd weryfikacji tokenu Firebase ID:', error);
    res.status(401).json({ error: 'Brak autoryzacji: Nieprawidłowy lub wygasły token sesji.' });
  }
};

/**
 * Inspects Authorization header if present, decorating req.user without blocking anonymous requests.
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email ?? `${decodedToken.uid}@firebase.user`,
      decodedToken.name,
      decodedToken.picture
    );
  } catch (error) {
    console.warn('[AuthMiddleware] Opcjonalna weryfikacja tokenu nie powiodła się:', error);
  }

  next();
};
