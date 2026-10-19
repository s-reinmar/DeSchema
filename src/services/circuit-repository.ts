/**
 * @file circuit-repository.ts
 * @description Implementation of ICircuitRepository for circuit lifecycle, storage, and navigation.
 * @author s-reinmar
 * @license MIT
 */

import type { Circuit, CircuitSummary, ValidationResult } from '../types/circuit.types.ts';
import type { ICircuitRepository } from '../interfaces/circuit-repository.interface.ts';
import type { IStorageService } from '../interfaces/storage.interface.ts';
import { CircuitValidator } from './circuit-validator.ts';
import { PREDEFINED_CIRCUITS } from '../data/predefined-circuits.ts';

const CUSTOM_CIRCUITS_STORAGE_KEY = 'deschema_mentor_custom_circuits';

export class CircuitRepository implements ICircuitRepository {
  private predefinedMap = new Map<string, Circuit>();
  private customMap = new Map<string, Circuit>();

  public constructor(
    private readonly storageService: IStorageService,
    initialPredefined: readonly Circuit[] = PREDEFINED_CIRCUITS
  ) {
    initialPredefined.forEach((c) => this.predefinedMap.set(c.id, c));
  }

  /**
   * Initializes predefined circuits from /resources/ and hydrates localStorage customs.
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
    const predefinedSummaries = Array.from(this.predefinedMap.values()).map((c) => ({
      id: c.id,
      title: c.title,
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
    const all = this.getAll();
    if (all.length === 0) return currentId;
    const currentIndex = all.findIndex((c) => c.id === currentId);
    if (currentIndex === -1) return all[0].id;
    const nextIndex = (currentIndex + 1) % all.length;
    return all[nextIndex].id;
  }

  public getPreviousCircuitId(currentId: string): string {
    const all = this.getAll();
    if (all.length === 0) return currentId;
    const currentIndex = all.findIndex((c) => c.id === currentId);
    if (currentIndex === -1) return all[all.length - 1].id;
    const prevIndex = (currentIndex - 1 + all.length) % all.length;
    return all[prevIndex].id;
  }

  private async tryFetchResources(): Promise<void> {
    const resourceFiles = [
      'half-wave-rectifier.json',
      'npn-common-emitter.json',
      'zener-regulator.json',
    ];

    for (const fileName of resourceFiles) {
      try {
        const response = await fetch(`/resources/${fileName}`);
        if (!response.ok) continue;
        const data = (await response.json()) as unknown;
        const validation = CircuitValidator.validate(data);
        if (validation.isValid && validation.circuit) {
          this.predefinedMap.set(validation.circuit.id, { ...validation.circuit, isCustom: false });
        }
      } catch {
        // Fallback to static bundled data if offline or fetch restricted
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
