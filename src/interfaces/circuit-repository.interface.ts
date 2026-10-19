/**
 * @file circuit-repository.interface.ts
 * @description Contract for Circuit repository operations (load, switch, select, upload, validate).
 * @author s-reinmar
 * @license MIT
 */

import type { Circuit, CircuitSummary, ValidationResult } from '../types/circuit.types.ts';

export interface ICircuitRepository {
  /**
   * Initializes predefined circuits and hydrates stored custom circuits.
   */
  initialize(): Promise<void>;

  /**
   * Returns all registered circuits (predefined and user custom).
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
   * Persists a validated custom circuit into repository and local storage.
   */
  saveCustomCircuit(circuit: Circuit): void;

  /**
   * Deletes a custom user circuit.
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
