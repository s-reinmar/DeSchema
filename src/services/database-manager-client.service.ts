/**
 * @file database-manager-client.service.ts
 * @description Single-user client-side service for Cloud SQL monitoring, visual circuit explorer, and pure SVG downloads.
 * Follows IDatabaseManagerService contract and Dependency Inversion Principle.
 * @author s-reinmar
 * @license MIT
 */

import type {
  DatabaseStats,
  CircuitVectorItem,
  IDatabaseManagerService,
} from '../interfaces/database-manager.interface.ts';

export class DatabaseManagerClientService implements IDatabaseManagerService {
  private readonly baseUrl = '/api/database';

  private getHeaders(token?: string | null): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getStats(token?: string | null): Promise<DatabaseStats> {
    const res = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Błąd połączenia z bazą (${res.status})`);
    }
    return res.json();
  }

  async getCircuitsPreview(token?: string | null): Promise<readonly CircuitVectorItem[]> {
    const res = await fetch(`${this.baseUrl}/circuits-preview`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Błąd pobierania schematów z bazy');
    }
    return res.json();
  }

  async getPureSvg(circuitId: string, token?: string | null): Promise<string> {
    const res = await fetch(`${this.baseUrl}/circuits/${encodeURIComponent(circuitId)}/svg`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Błąd pobierania wektora SVG dla ${circuitId}`);
    }
    return res.text();
  }

  async deleteCircuit(id: string, token?: string | null): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${this.baseUrl}/circuits/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Nie udało się usunąć obwodu ${id}`);
    }
    return res.json();
  }

  async reseedCanonicalCircuits(token?: string | null): Promise<{ success: boolean; message: string; seededCount: number }> {
    const res = await fetch(`${this.baseUrl}/reseed`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Błąd ponownego seedowania bazy');
    }
    return res.json();
  }

  async getDatabaseSqlSchema(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/schema-sql`);
    if (!res.ok) {
      throw new Error('Błąd pobierania schematu SQL');
    }
    return res.text();
  }
}

export const databaseManagerClient = new DatabaseManagerClientService();
