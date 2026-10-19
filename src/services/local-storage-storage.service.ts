/**
 * @file local-storage-storage.service.ts
 * @description Robust localStorage wrapper with in-memory fallback for private modes or restricted iframes.
 * @author s-reinmar
 * @license MIT
 */

import type { IStorageService } from '../interfaces/storage.interface.ts';

export class LocalStorageService implements IStorageService {
  private readonly memoryFallback = new Map<string, string>();

  public getItem<T>(key: string): T | null {
    try {
      const raw = typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(key)
        : this.memoryFallback.get(key) ?? null;

      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      }
      this.memoryFallback.set(key, serialized);
    } catch {
      // Storage quota exceeded or disabled; fallback memory map persists in-session
    }
  }

  public removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
    } catch {
      // Ignore cleanup error
    }
  }
}
