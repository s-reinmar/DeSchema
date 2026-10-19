/**
 * @file circuit-repository.interface.ts
 * @description Contract for Circuit repository operations (load, switch, select, upload, validate)
 * supporting both local storage and Cloud SQL PostgreSQL backend.
 * @author s-reinmar
 * @license MIT
 */

import type { Circuit, CircuitSummary, ValidationResult } from '../types/circuit.types.ts';

export interface ICircuitRepository {
  /**
   * Initializes circuits from Cloud SQL PostgreSQL backend and falls back to /resources/.
   */
  initialize(token?: string | null): Promise<void>;

  /**
   * Refreshes circuit catalog using optional authenticated user token.
   */
  refresh(token?: string | null): Promise<void>;

  /**
   * Returns all registered circuits (public catalog and user custom circuits).
   */
  getAll(): readonly Circuit[];

  /**
   * Retrieves a single circuit by its unique identifier.
   */
  getById(id: string): Circuit | undefined;

  /**
   * Returns a list of summaries categorized for selection menus.
   */
  getSummaries(): readonly CircuitSummary[];

  /**
   * Persists a custom circuit remotely in Cloud SQL when token is provided, or in localStorage.
   */
  saveRemoteCircuit(circuit: Circuit, token: string): Promise<Circuit>;

  /**
   * Deletes a custom circuit remotely in Cloud SQL or in localStorage.
   */
  deleteRemoteCircuit(id: string, token: string): Promise<boolean>;

  /**
   * Persists a validated custom circuit into repository and local storage.
   */
  saveCustomCircuit(circuit: Circuit): void;

  /**
   * Deletes a custom user circuit from local storage.
   */
  deleteCustomCircuit(id: string): boolean;

  /**
   * Validates raw JSON string or object against Circuit domain schema.
   */
  validateCircuit(rawJson: unknown): ValidationResult;

  /**
   * Computes the next circuit id in circular order.
   */
  getNextCircuitId(currentId: string): string;

  /**
   * Computes the previous circuit id in circular order.
   */
  getPreviousCircuitId(currentId: string): string;
}
