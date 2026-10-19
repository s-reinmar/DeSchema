/**
 * @file circuit-repository.ts
 * @description Implementation of ICircuitRepository loading circuits from /public/resources/ (SSOT) and localStorage.
 * @author @s-reinmar
 * @license MIT
 */

import type { Circuit, CircuitSummary, ValidationResult } from '../types/circuit.types.ts';
import type { ICircuitRepository } from '../interfaces/circuit-repository.interface.ts';
import type { IStorageService } from '../interfaces/storage.interface.ts';
import { CircuitValidator } from './circuit-validator.ts';
import { PREDEFINED_RESOURCE_FILES, PREDEFINED_CIRCUITS_META } from '../data/predefined-circuits.ts';

const CUSTOM_CIRCUITS_STORAGE_KEY = 'deschema_mentor_custom_circuits';

export class CircuitRepository implements ICircuitRepository {
  private predefinedMap = new Map<string, Circuit>();
  private customMap = new Map<string, Circuit>();

  public constructor(
    private readonly storageService: IStorageService,
    initialPredefined: readonly Circuit[] = []
  ) {
    initialPredefined.forEach((c) => this.predefinedMap.set(c.id, c));
  }

  /**
   * Initializes predefined circuits from /public/resources/ via HTTP fetch and hydrates localStorage customs.
   */
  public async initialize(): Promise<void> {
    await this.tryFetchResources();
    this.hydrateCustomCircuits();
  }

  public getAll(): readonly Circuit[] {
    return [...Array.from(this.predefinedMap.values()), ...Array.from(this.customMap.values())];
  }

  public getById(id: string): Circuit | undefined {
    return this.customMap.get(id) ?? this.predefinedMap.get(id);
  }

  public getSummaries(): readonly CircuitSummary[] {
    // If predefined circuits haven't finished fetching yet, use PREDEFINED_CIRCUITS_META
    const predefinedSummaries =
      this.predefinedMap.size > 0
        ? Array.from(this.predefinedMap.values()).map((c) => ({
            id: c.id,
            title: c.title,
            isCustom: false,
          }))
        : PREDEFINED_CIRCUITS_META.map((meta) => ({
            id: meta.id,
            title: meta.title,
            isCustom: false,
          }));

    const customSummaries = Array.from(this.customMap.values()).map((c) => ({
      id: c.id,
      title: c.title,
      isCustom: true,
    }));

    return [...predefinedSummaries, ...customSummaries];
  }

  public saveCustomCircuit(circuit: Circuit): void {
    const customCircuit: Circuit = { ...circuit, isCustom: true };
    this.customMap.set(circuit.id, customCircuit);
    this.persistCustomCircuits();
  }

  public deleteCustomCircuit(id: string): boolean {
    const deleted = this.customMap.delete(id);
    if (deleted) {
      this.persistCustomCircuits();
    }
    return deleted;
  }

  public validateCircuit(rawJson: unknown): ValidationResult {
    return CircuitValidator.validate(rawJson);
  }

  public getNextCircuitId(currentId: string): string {
    const summaries = this.getSummaries();
    if (summaries.length === 0) return currentId;
    const currentIndex = summaries.findIndex((c) => c.id === currentId);
    if (currentIndex === -1) return summaries[0].id;
    const nextIndex = (currentIndex + 1) % summaries.length;
    return summaries[nextIndex].id;
  }

  public getPreviousCircuitId(currentId: string): string {
    const summaries = this.getSummaries();
    if (summaries.length === 0) return currentId;
    const currentIndex = summaries.findIndex((c) => c.id === currentId);
    if (currentIndex === -1) return summaries[summaries.length - 1].id;
    const prevIndex = (currentIndex - 1 + summaries.length) % summaries.length;
    return summaries[prevIndex].id;
  }

  /**
   * Fetches the 3 built-in circuits from the Single Source of Truth at /resources/ (served from public/resources/).
   */
  private async tryFetchResources(): Promise<void> {
    for (const fileName of PREDEFINED_RESOURCE_FILES) {
      try {
        const response = await fetch(`/resources/${fileName}`);
        if (!response.ok) continue;
        const data = (await response.json()) as unknown;
        const validation = CircuitValidator.validate(data);
        if (validation.isValid && validation.circuit) {
          this.predefinedMap.set(validation.circuit.id, { ...validation.circuit, isCustom: false });
        }
      } catch (err) {
        console.warn(`[CircuitRepository] Nie udało się pobrać /resources/${fileName}:`, err);
      }
    }
  }

  private hydrateCustomCircuits(): void {
    const stored = this.storageService.getItem<Circuit[]>(CUSTOM_CIRCUITS_STORAGE_KEY);
    if (Array.isArray(stored)) {
      stored.forEach((item) => {
        const validation = CircuitValidator.validate(item);
        if (validation.isValid && validation.circuit) {
          this.customMap.set(validation.circuit.id, { ...validation.circuit, isCustom: true });
        }
      });
    }
  }

  private persistCustomCircuits(): void {
    const list = Array.from(this.customMap.values());
    this.storageService.setItem(CUSTOM_CIRCUITS_STORAGE_KEY, list);
  }
}
