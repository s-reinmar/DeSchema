/**
 * @file session.types.ts
 * @description Strongly-typed contracts for session state persistence, JSON import/export, and session history.
 * @author @s-reinmar
 * @license MIT
 */

import type { SchematicAnnotation } from './annotation.types.ts';

/**
 * Single chat message snapshot preserved across sessions.
 */
export interface SessionChatMessage {
  readonly id: string;
  readonly role: 'student' | 'mentor';
  readonly text: string;
  readonly modelUsed?: string;
  readonly timestamp: string;
}

/**
 * Complete serialized state of a student's pedagogical session.
 */
export interface SessionData {
  readonly version: string;
  readonly sessionTitle: string;
  readonly circuitId: string;
  readonly circuitTitle: string;
  readonly stepNumber: 1 | 2 | 3 | 4;
  readonly messages: readonly SessionChatMessage[];
  readonly annotations: readonly SchematicAnnotation[];
  readonly savedAt: string;
}

/**
 * Local history entry for quick session resumption.
 */
export interface SessionHistoryEntry {
  readonly id: string;
  readonly circuitId: string;
  readonly circuitTitle: string;
  readonly stepNumber: number;
  readonly messagesCount: number;
  readonly savedAt: string;
  readonly data: SessionData;
}
