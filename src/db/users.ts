/**
 * @file users.ts
 * @description Database helper operations for users entity using Drizzle ORM.
 * @author s-reinmar
 * @license MIT
 */

import { db } from './index.ts';
import { users } from './schema.ts';

/**
 * Upserts a user synchronized from Firebase Authentication.
 */
export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
        photoUrl: photoUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName ?? null,
          photoUrl: photoUrl ?? null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('[DB Users] Nie udało się zsynchronizować użytkownika:', error);
    throw new Error('Database operation failed for user.', { cause: error });
  }
}
