/**
 * @file App.tsx
 * @description Main application entry point uniting dual-panel Socratic Mentor (left) and SvgSchematicViewer (right).
 * @author @s-reinmar
 * @license MIT
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { LocalStorageService } from './services/local-storage-storage.service.ts';
import { CircuitRepository } from './services/circuit-repository.ts';
import { TopNavbar } from './components/TopNavbar.tsx';
import { SvgSchematicViewer } from './components/SvgSchematicViewer.tsx';
import { SocraticStepSection } from './components/SocraticStepSection.tsx';
import { Footer } from './components/Footer.tsx';
import { UploadModal } from './components/modals/UploadModal.tsx';
import type { Circuit } from './types/circuit.types.ts';

export default function App() {
  const storageService = useMemo(() => new LocalStorageService(), []);
  const repository = useMemo(() => new CircuitRepository(storageService), [storageService]);

  const [circuits, setCircuits] = useState<readonly Circuit[]>(() => repository.getAll());
  const [currentCircuitId, setCurrentCircuitId] = useState<string>('half-wave-rectifier');
  const [currentStepNumber, setCurrentStepNumber] = useState<1 | 2 | 3 | 4>(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    repository.initialize().then(() => {
      const all = repository.getAll();
      setCircuits(all);
      if (all.length > 0 && !repository.getById(currentCircuitId)) {
        setCurrentCircuitId(all[0].id);
      }
      setIsLoaded(true);
    });
  }, [repository, currentCircuitId]);

  const currentCircuit = useMemo(() => {
    return repository.getById(currentCircuitId) ?? circuits[0];
  }, [repository, currentCircuitId, circuits]);

  const summaries = useMemo(() => {
    return repository.getSummaries();
  }, [repository, circuits]);

  // Keyboard navigation for circuits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        const prevId = repository.getPreviousCircuitId(currentCircuitId);
        setCurrentCircuitId(prevId);
        setCurrentStepNumber(1);
      } else if (e.key === 'ArrowRight') {
        const nextId = repository.getNextCircuitId(currentCircuitId);
        setCurrentCircuitId(nextId);
        setCurrentStepNumber(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [repository, currentCircuitId]);

  const handleSelectCircuit = (id: string) => {
    setCurrentCircuitId(id);
    setCurrentStepNumber(1);
  };

  const handlePreviousCircuit = () => {
    const prevId = repository.getPreviousCircuitId(currentCircuitId);
    setCurrentCircuitId(prevId);
    setCurrentStepNumber(1);
  };

  const handleNextCircuit = () => {
    const nextId = repository.getNextCircuitId(currentCircuitId);
    setCurrentCircuitId(nextId);
    setCurrentStepNumber(1);
  };

  const handleCircuitUploaded = (newId: string) => {
    setCircuits(repository.getAll());
    setCurrentCircuitId(newId);
    setCurrentStepNumber(1);
  };

  if (!isLoaded && !currentCircuit) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm font-mono text-slate-400">Wczytywanie obwodów wzorcowych DeSchema...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const currentStep = currentCircuit?.socraticSteps?.find((s) => s.stepNumber === currentStepNumber) ?? currentCircuit?.socraticSteps?.[0];
  const activeTargetSymbolIds = currentStep?.targetSymbolIds ?? [];

  return (
    <ThemeProvider>
      <SettingsProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
          <TopNavbar
            repository={repository}
            onCircuitUploaded={handleCircuitUploaded}
          />

          {/* Dual Panel Workspace Layout */}
          <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Panel: Socratic Pedagogical Inquiry & Dialogue */}
              <section
                aria-label="Panel pedagogiczny analizy sokratejskiej"
                className="xl:col-span-5 flex flex-col gap-6 xl:max-h-[calc(100vh-8.5rem)] xl:overflow-y-auto overscroll-contain no-scrollbar"
              >
                <SocraticStepSection
                  circuit={currentCircuit}
                  steps={currentCircuit.socraticSteps}
                  currentStepNumber={currentStepNumber}
                  onStepChange={setCurrentStepNumber}
                />
              </section>

              {/* Right Panel: Advanced SvgSchematicViewer Engine */}
              <section
                aria-label="Prawy panel wizualizacji schematu elektronicznego"
                className="xl:col-span-7 flex flex-col gap-6 xl:sticky xl:top-20 overscroll-contain no-scrollbar"
              >
                <SvgSchematicViewer
                  circuit={currentCircuit}
                  summaries={summaries}
                  activeTargetSymbolIds={activeTargetSymbolIds}
                  onSelectCircuit={handleSelectCircuit}
                  onPreviousCircuit={handlePreviousCircuit}
                  onNextCircuit={handleNextCircuit}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              </section>
            </div>
          </main>

          <Footer />

          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            repository={repository}
            onCircuitUploaded={handleCircuitUploaded}
          />
        </div>
      </SettingsProvider>
    </ThemeProvider>
  );
}
