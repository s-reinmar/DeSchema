/**
 * @file DatabaseTableBrowserTab.tsx
 * @description Visual SVG circuit explorer displaying vector diagram previews, bulleted component symbols,
 * bulleted Socratic questions (without active links), and pure SVG export actions.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Cpu, HelpCircle, Layers, CheckCircle2, Image } from 'lucide-react';
import type { CircuitVectorItem } from '../../../interfaces/database-manager.interface.ts';
import { databaseManagerClient } from '../../../services/database-manager-client.service.ts';
import { SymbolParser } from '../../../utils/symbol-parser.ts';

interface Props {
  readonly idToken?: string | null;
  readonly onDataModified: () => void;
}

export const DatabaseTableBrowserTab: React.FC<Props> = ({ idToken, onDataModified }) => {
  const [circuits, setCircuits] = useState<readonly CircuitVectorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
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
    <div className="space-y-5">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Image className="w-4 h-4 text-cyan-400" />
            Eksplorator Schematów SVG
          </h4>
          <p className="text-xs text-slate-400">
            Wizualny podgląd schematów wektorowych, zestawienie symboli i pytań dydaktycznych oraz eksport czystych plików SVG.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po nazwie lub ID..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Circuits List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          Wczytywanie schematów z bazy danych...
        </div>
      ) : filteredCircuits.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
          Brak schematów spełniających kryteria wyszukiwania.
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCircuits.map((circuit) => (
            <div
              key={circuit.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-sm sm:text-base">
                      {SymbolParser.formatSymbol(circuit.title)}
                    </h5>
                    <span className="font-mono text-[10px] text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                      ID: {circuit.id}
                    </span>
                  </div>
                  {circuit.description && (
                    <p className="text-xs text-slate-400">
                      {SymbolParser.formatSymbol(circuit.description)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadSvg(circuit)}
                    disabled={downloadingId === circuit.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl transition cursor-pointer disabled:opacity-50"
                    title="Pobierz wyłącznie czysty wektor schematu (.svg)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pobierz SVG</span>
                  </button>

                  <button
                    onClick={() => handleDelete(circuit.id)}
                    disabled={deletingId === circuit.id}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer disabled:opacity-50"
                    title="Usuń ten schemat z bazy danych"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Graphic SVG Preview + Bulleted Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* SVG Visual Graphic Preview */}
                <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800/90 flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 pb-2 border-b border-slate-800/60 mb-2">
                    <span>Podgląd wektora SVG</span>
                    <span>viewBox: {circuit.svgViewBox}</span>
                  </div>
                  <div className="w-full flex items-center justify-center overflow-hidden">
                    <svg
                      viewBox={circuit.svgViewBox}
                      className="w-full max-h-[240px] object-contain text-slate-200"
                      dangerouslySetInnerHTML={{ __html: circuit.svgContent }}
                    />
                  </div>
                </div>

                {/* Bulleted Symbols & Socratic Steps Details */}
                <div className="lg:col-span-7 space-y-4 text-xs font-sans">
                  {/* Bulleted Symbols */}
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
                    <h6 className="font-bold text-slate-300 text-xs flex items-center gap-2 font-mono uppercase tracking-wider">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      Wykryte Symbole i Elementy Fizyczne ({circuit.symbols.length}):
                    </h6>
                    <ul className="space-y-1.5 pl-2 text-slate-300 text-xs">
                      {circuit.symbols.map((sym) => (
                        <li key={sym.id} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-cyan-400 select-none">•</span>
                          <span>
                            <strong className="text-white font-mono">{sym.label}</strong>
                            {sym.name && sym.name !== sym.label && (
                              <span className="text-slate-400"> ({sym.name})</span>
                            )}
                            {sym.typicalValue && (
                              <span className="text-emerald-300 font-mono text-[11px] ml-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {sym.typicalValue}
                              </span>
                            )}
                            {sym.physicalRole && (
                              <span className="text-slate-400"> — {SymbolParser.formatSymbol(sym.physicalRole)}</span>
                            )}
                            {sym.formula && (
                              <span className="font-mono text-amber-300 ml-1.5 text-[11px]">
                                [{SymbolParser.formatSymbol(sym.formula)}]
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                      {circuit.symbols.length === 0 && (
                        <li className="text-slate-500 italic">Brak zdefiniowanych symboli w schemacie.</li>
                      )}
                    </ul>
                  </div>

                  {/* Bulleted Socratic Steps (no active links) */}
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
                    <h6 className="font-bold text-slate-300 text-xs flex items-center gap-2 font-mono uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      Pytania Dydaktyczne i Etapy Sokratejskie ({circuit.socraticSteps.length}):
                    </h6>
                    <ul className="space-y-2 pl-2 text-slate-300 text-xs">
                      {circuit.socraticSteps.map((step) => (
                        <li key={step.stepNumber} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-400 font-mono font-bold select-none">{step.stepNumber}.</span>
                          <div>
                            <span className="font-semibold text-slate-200">
                              {SymbolParser.formatSymbol(step.title)}
                            </span>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              {SymbolParser.formatSymbol(step.promptQuestion)}
                            </p>
                          </div>
                        </li>
                      ))}
                      {circuit.socraticSteps.length === 0 && (
                        <li className="text-slate-500 italic">Brak pytań sokratejskich dla tego obwodu.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
