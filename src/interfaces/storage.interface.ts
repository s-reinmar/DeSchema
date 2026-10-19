/**
 * @file storage.interface.ts
 * @description Contract for persistent browser storage mechanisms (SRP & DIP).
 * @author s-reinmar
 * @license MIT
 */

export interface IStorageService {
  /**
   * Retrieves a typed value from persistent storage.
   */
  getItem<T>(key: string): T | null;

  /**
   * Persists a typed value into storage.
   */
  setItem<T>(key: string, value: T): void;

  /**
   * Removes an entry from storage.
   */
  removeItem(key: string): void;
}
