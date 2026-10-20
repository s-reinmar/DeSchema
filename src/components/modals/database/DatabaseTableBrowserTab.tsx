/**
 * @file DatabaseTableBrowserTab.tsx
 * @description Visual SVG circuit explorer displaying an accordion list of schematic vectors.
 * Items are collapsed by default with single-expansion support, clear bulleted symbols, and pure SVG export.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import { Search, Image, RefreshCw, Filter } from 'lucide-react';
import type { CircuitVectorItem } from '../../../interfaces/database-manager.interface.ts';
import { databaseManagerClient } from '../../../services/database-manager-client.service.ts';
import { CircuitAccordionItem } from './CircuitAccordionItem.tsx';
import { CircuitSlugGenerator } from '../../../services/circuit-slug-generator.service.ts';

const CATEGORIES = [
  'Wszystkie',
  'Zasilacze',
  'Wzmacniacze',
  'Technika w.cz. i filtry',
  'Układy cyfrowe',
] as const;

interface Props {
  readonly idToken?: string | null;
  readonly onDataModified: () => void;
}

export const DatabaseTableBrowserTab: React.FC<Props> = ({ idToken, onDataModified }) => {
  const [circuits, setCircuits] = useState<readonly CircuitVectorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
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
    const cat = c.category ?? CircuitSlugGenerator.detectCategory(c.title, c.description);
    if (selectedCategory !== 'Wszystkie' && cat !== selectedCategory) {
      return false;
    }
    const q = search.toLowerCase();
    const slug = CircuitSlugGenerator.resolveDisplaySlug(c.id, c.title, c.englishSlug).toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      slug.includes(q)
    );
  });

  return (
    <div className="space-y-3.5">
      {/* Compact Top Bar: Search and Count */}
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

      {/* Segmented Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = cat === 'Wszystkie'
            ? circuits.length
            : circuits.filter((c) => (c.category ?? CircuitSlugGenerator.detectCategory(c.title, c.description)) === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 text-xs ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                isActive ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
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
