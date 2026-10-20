/**
 * @file DatabaseTableBrowserTab.tsx
 * @description Visual SVG circuit explorer displaying an accordion list of schematic vectors.
 * Items are collapsed by default with single-expansion support, clear bulleted symbols, and pure SVG export.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import { Search, Image, RefreshCw } from 'lucide-react';
import type { CircuitVectorItem } from '../../../interfaces/database-manager.interface.ts';
import { databaseManagerClient } from '../../../services/database-manager-client.service.ts';
import { CircuitAccordionItem } from './CircuitAccordionItem.tsx';

interface Props {
  readonly idToken?: string | null;
  readonly onDataModified: () => void;
}

export const DatabaseTableBrowserTab: React.FC<Props> = ({ idToken, onDataModified }) => {
  const [circuits, setCircuits] = useState<readonly CircuitVectorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadCircuits = async () => {
    setIsLoading(true);
    try {
      const data = await databaseManagerClient.getCircuitsPreview(idToken);
      setCircuits(data);
    } catch (err) {
      console.error('Błąd pobierania schematów:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCircuits();
  }, []);

  const handleToggleExpand = (circuitId: string) => {
    setExpandedId((prev) => (prev === circuitId ? null : circuitId));
  };

  const handleDownloadSvg = async (circuit: CircuitVectorItem) => {
    setDownloadingId(circuit.id);
    try {
      const svgText = await databaseManagerClient.getPureSvg(circuit.id, idToken);
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${circuit.id}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Błąd pobierania SVG:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (circuitId: string) => {
    if (!window.confirm(`Czy na pewno usunąć schemat "${circuitId}" z bazy danych?`)) {
      return;
    }
    setDeletingId(circuitId);
    try {
      await databaseManagerClient.deleteCircuit(circuitId, idToken);
      if (expandedId === circuitId) {
        setExpandedId(null);
      }
      await loadCircuits();
      onDataModified();
    } catch (err) {
      console.error('Błąd usuwania schematu:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCircuits = circuits.filter((c) => {
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Compact Top Bar: Search and Count to maximize content visibility */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white">
              Schematy SVG ({circuits.length})
            </span>
            <p className="text-[11px] text-slate-400">
              Domyślnie zwinięte • Rozwiń pojedynczy schemat, aby zobaczyć wektor i symbole.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po nazwie lub ID..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64 transition"
          />
        </div>
      </div>

      {/* Accordion Circuits List */}
      {isLoading ? (
        <div className="p-10 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>Wczytywanie schematów z bazy danych...</span>
        </div>
      ) : filteredCircuits.length === 0 ? (
        <div className="p-10 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
          Brak schematów spełniających kryteria wyszukiwania.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCircuits.map((circuit) => (
            <CircuitAccordionItem
              key={circuit.id}
              circuit={circuit}
              isExpanded={expandedId === circuit.id}
              isDownloading={downloadingId === circuit.id}
              isDeleting={deletingId === circuit.id}
              onToggle={() => handleToggleExpand(circuit.id)}
              onDownload={handleDownloadSvg}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
