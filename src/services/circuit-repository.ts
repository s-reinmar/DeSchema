/**
 * @file circuit-repository.ts
 * @description Implementation of ICircuitRepository loading circuits from Cloud SQL PostgreSQL (/api/circuits)
 * with graceful fallback to /resources/ and local storage caching.
 * @author @s-reinmar
 * @license MIT
 */

import type { Circuit, CircuitSummary, ValidationResult } from '../types/circuit.types.ts';
import type { ICircuitRepository } from '../interfaces/circuit-repository.interface.ts';
import type { IStorageService } from '../interfaces/storage.interface.ts';
import { CircuitValidator } from './circuit-validator.ts';
import { CircuitSlugGenerator } from './circuit-slug-generator.service.ts';
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
   * Initializes circuits from Cloud SQL database via /api/circuits, falling back to static resources.
   */
  public async initialize(token?: string | null): Promise<void> {
    await this.refresh(token);
    this.hydrateCustomCircuits();
  }

  /**
   * Refreshes catalog by querying the PostgreSQL backend with optional user Bearer token.
   */
  public async refresh(token?: string | null): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/circuits', { headers });
      if (response.ok) {
        const data = (await response.json()) as Circuit[];
        if (Array.isArray(data) && data.length > 0) {
          this.predefinedMap.clear();
          this.customMap.clear();

          for (const c of data) {
            if (c.isCustom) {
              this.customMap.set(c.id, c);
            } else {
              this.predefinedMap.set(c.id, c);
            }
          }
          return;
        }
      }
    } catch (err) {
      console.warn('[CircuitRepository] Błąd zapytania /api/circuits, aktywacja fallbacku:', err);
    }

    // Fallback to static JSON files in /resources/
    await this.tryFetchResources();
  }

  public getAll(): readonly Circuit[] {
    return [...Array.from(this.predefinedMap.values()), ...Array.from(this.customMap.values())];
  }

  public getById(id: string): Circuit | undefined {
    return this.customMap.get(id) ?? this.predefinedMap.get(id);
  }

  public getSummaries(): readonly CircuitSummary[] {
    const predefinedSummaries =
      this.predefinedMap.size > 0
        ? Array.from(this.predefinedMap.values()).map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            isCustom: false,
            category: c.category ?? CircuitSlugGenerator.detectCategory(c.title, c.description),
            englishSlug: c.englishSlug ?? CircuitSlugGenerator.resolveDisplaySlug(c.id, c.title),
          }))
        : PREDEFINED_CIRCUITS_META.map((meta) => ({
            id: meta.id,
            title: meta.title,
            description: undefined,
            isCustom: false,
            category: meta.category,
            englishSlug: meta.englishSlug,
          }));

    const customSummaries = Array.from(this.customMap.values()).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      isCustom: true,
      category: c.category ?? CircuitSlugGenerator.detectCategory(c.title, c.description),
      englishSlug: c.englishSlug ?? CircuitSlugGenerator.resolveDisplaySlug(c.id, c.title),
    }));

    return [...predefinedSummaries, ...customSummaries];
  }

  /**
   * Persists a validated custom circuit into Cloud SQL PostgreSQL database.
   */
  public async saveRemoteCircuit(circuit: Circuit, token: string): Promise<Circuit> {
    const response = await fetch('/api/circuits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(circuit),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Nie udało się zapisać obwodu w bazie danych.');
    }

    const created = (await response.json()) as Circuit;
    this.customMap.set(created.id, { ...created, isCustom: true });
    return created;
  }

  /**
   * Deletes a circuit from Cloud SQL PostgreSQL database.
   */
  public async deleteRemoteCircuit(id: string, token: string): Promise<boolean> {
    const response = await fetch(`/api/circuits/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      this.customMap.delete(id);
      this.deleteCustomCircuit(id);
      return true;
    }
    return false;
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
