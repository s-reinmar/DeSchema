/**
 * @file session.service.ts
 * @description Domain service for session export, import, validation, and localStorage history persistence.
 * @author @s-reinmar
 * @license MIT
 */

import type { SessionData, SessionHistoryEntry } from '../types/session.types.ts';

const SESSION_STORAGE_KEY = 'deschema_session_history';
const MAX_HISTORY_ENTRIES = 10;
const CURRENT_VERSION = '1.0.0';

export class SessionService {
  /**
   * Triggers a browser file download containing the serialized session JSON.
   */
  public static exportSessionToJson(session: SessionData): void {
    const jsonString = JSON.stringify(session, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const sanitizedTitle = session.circuitId.replace(/[^a-z0-9_-]/gi, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `deschema-sesja-${sanitizedTitle}-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates and parses raw JSON text into a typed SessionData structure.
   */
  public static parseSessionFromJson(
    jsonString: string
  ): { isValid: boolean; session?: SessionData; error?: string } {
    try {
      const parsed = JSON.parse(jsonString) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return { isValid: false, error: 'Plik nie zawiera poprawnego obiektu JSON' };
      }

      const candidate = parsed as Record<string, unknown>;
      if (!candidate.circuitId || typeof candidate.circuitId !== 'string') {
        return { isValid: false, error: 'Brak wymaganego pola "circuitId" w pliku sesji' };
      }

      const stepNum = typeof candidate.stepNumber === 'number' && candidate.stepNumber >= 1 && candidate.stepNumber <= 4
        ? (candidate.stepNumber as 1 | 2 | 3 | 4)
        : 1;

      const validSession: SessionData = {
        version: typeof candidate.version === 'string' ? candidate.version : CURRENT_VERSION,
        sessionTitle: typeof candidate.sessionTitle === 'string' ? candidate.sessionTitle : 'Sesja DeSchema',
        circuitId: candidate.circuitId,
        circuitTitle: typeof candidate.circuitTitle === 'string' ? candidate.circuitTitle : candidate.circuitId,
        stepNumber: stepNum,
        messages: Array.isArray(candidate.messages) ? candidate.messages : [],
        annotations: Array.isArray(candidate.annotations) ? candidate.annotations : [],
        savedAt: typeof candidate.savedAt === 'string' ? candidate.savedAt : new Date().toLocaleString(),
      };

      return { isValid: true, session: validSession };
    } catch (err) {
      return {
        isValid: false,
        error: `Błąd składni JSON: ${err instanceof Error ? err.message : 'Nieznany błąd'}`,
      };
    }
  }

  /**
   * Persists a session snapshot into local storage history.
   */
  public static saveToHistory(session: SessionData): void {
    try {
      const history = SessionService.getHistory();
      const newEntry: SessionHistoryEntry = {
        id: `sess-${Date.now()}`,
        circuitId: session.circuitId,
        circuitTitle: session.circuitTitle,
        stepNumber: session.stepNumber,
        messagesCount: session.messages.length,
        savedAt: new Date().toLocaleString(),
        data: session,
      };

      const updated = [newEntry, ...history.filter((h) => h.circuitId !== session.circuitId)].slice(
        0,
        MAX_HISTORY_ENTRIES
      );
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Nie udało się zapisać historii sesji w localStorage:', err);
    }
  }

  /**
   * Retrieves all saved sessions from localStorage.
   */
  public static getHistory(): readonly SessionHistoryEntry[] {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Removes a single session from history.
   */
  public static deleteFromHistory(id: string): void {
    try {
      const history = SessionService.getHistory();
      const updated = history.filter((item) => item.id !== id);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Nie udało się usunąć wpisu historii:', err);
    }
  }
}
