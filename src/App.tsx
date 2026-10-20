/**
 * @file App.tsx
 * @description Main application entry point uniting AuthProvider, ThemeProvider, SettingsProvider,
 * TopNavbar, Cloud SQL circuit persistence, Socratic Mentor panel, and SvgSchematicViewer.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { LocalStorageService } from './services/local-storage-storage.service.ts';
import { CircuitRepository } from './services/circuit-repository.ts';
import { TopNavbar } from './components/TopNavbar.tsx';
import { SvgSchematicViewer } from './components/SvgSchematicViewer.tsx';
import { SocraticStepSection } from './components/SocraticStepSection.tsx';
import { Footer } from './components/Footer.tsx';
import type { Circuit } from './types/circuit.types.ts';
import type { SessionData } from './types/session.types.ts';
import type { ChatMessage } from './components/SocraticChatPanel.tsx';
import type { SchematicAnnotation } from './types/annotation.types.ts';

const INITIAL_MENTOR_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'mentor',
  text: 'Witaj! Jestem Twoim cierpliwym mentorem DeSchema. Nie podam Ci gotowych wyników liczbowych, lecz pomogę Ci samodzielnie prześledzić drogę ładunków, potencjałów i zjawisk w obwodzie. Jaka jest Twoja hipoteza do obecnego kroku?',
  modelUsed: 'gemini-3.5-flash-lite',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

function DeSchemaWorkspace() {
  const { idToken } = useAuth();
  const storageService = useMemo(() => new LocalStorageService(), []);
  const repository = useMemo(() => new CircuitRepository(storageService), [storageService]);

  const [circuits, setCircuits] = useState<readonly Circuit[]>(() => repository.getAll());
  const [currentCircuitId, setCurrentCircuitId] = useState<string>('half-wave-rectifier');
  const [currentStepNumber, setCurrentStepNumber] = useState<1 | 2 | 3 | 4>(1);
  const [completedStepNumbers, setCompletedStepNumbers] = useState<readonly number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Full session state shared between navbar export/import and workspace panels
  const [messages, setMessages] = useState<readonly ChatMessage[]>([INITIAL_MENTOR_MESSAGE]);
  const [annotations, setAnnotations] = useState<readonly SchematicAnnotation[]>([]);

  // Synchronize with database whenever idToken changes (login/logout/token refresh)
  useEffect(() => {
    let isMounted = true;
    repository.initialize(idToken).then(() => {
      if (!isMounted) return;
      const all = repository.getAll();
      setCircuits(all);
      if (all.length > 0 && !repository.getById(currentCircuitId)) {
        setCurrentCircuitId(all[0].id);
      }
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [repository, idToken, currentCircuitId]);

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
    setCompletedStepNumbers([]);
  };

  const handlePreviousCircuit = () => {
    const prevId = repository.getPreviousCircuitId(currentCircuitId);
    setCurrentCircuitId(prevId);
    setCurrentStepNumber(1);
    setCompletedStepNumbers([]);
  };

  const handleNextCircuit = () => {
    const nextId = repository.getNextCircuitId(currentCircuitId);
    setCurrentCircuitId(nextId);
    setCurrentStepNumber(1);
    setCompletedStepNumbers([]);
  };

  const handleToggleStepCompleted = useCallback((stepNumber: number) => {
    setCompletedStepNumbers((prev) =>
      prev.includes(stepNumber) ? prev.filter((n) => n !== stepNumber) : [...prev, stepNumber]
    );
  }, []);

  const handleStepAutoCompleted = useCallback((stepNumber: number) => {
    setCompletedStepNumbers((prev) => (prev.includes(stepNumber) ? prev : [...prev, stepNumber]));
  }, []);

  const handleSaveCustomCircuit = useCallback(
    async (circuit: Circuit): Promise<void> => {
      if (idToken) {
        const created = await repository.saveRemoteCircuit(circuit, idToken);
        setCircuits(repository.getAll());
        setCurrentCircuitId(created.id);
      } else {
        repository.saveCustomCircuit(circuit);
        setCircuits(repository.getAll());
        setCurrentCircuitId(circuit.id);
      }
      setCurrentStepNumber(1);
      setCompletedStepNumbers([]);
    },
    [repository, idToken]
  );

  const handleDeleteCircuit = useCallback(
    async (id: string): Promise<void> => {
      if (idToken) {
        await repository.deleteRemoteCircuit(id, idToken);
      } else {
        repository.deleteCustomCircuit(id);
      }
      const updated = repository.getAll();
      setCircuits(updated);
      if (currentCircuitId === id && updated.length > 0) {
        setCurrentCircuitId(updated[0].id);
        setCurrentStepNumber(1);
        setCompletedStepNumbers([]);
      }
    },
    [repository, idToken, currentCircuitId]
  );

  const handleExportSession = (): SessionData => {
    return {
      version: '1.0.0',
      sessionTitle: `Sesja - ${currentCircuit?.title ?? currentCircuitId}`,
      circuitId: currentCircuitId,
      circuitTitle: currentCircuit?.title ?? currentCircuitId,
      stepNumber: currentStepNumber,
      completedStepNumbers,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        modelUsed: m.modelUsed,
        timestamp: m.timestamp,
      })),
      annotations,
      savedAt: new Date().toLocaleString(),
    };
  };

  const handleRestoreSession = (session: SessionData) => {
    if (session.circuitId && repository.getById(session.circuitId)) {
      setCurrentCircuitId(session.circuitId);
    }
    if (session.stepNumber && session.stepNumber >= 1 && session.stepNumber <= 4) {
      setCurrentStepNumber(session.stepNumber);
    }
    if (session.completedStepNumbers && Array.isArray(session.completedStepNumbers)) {
      setCompletedStepNumbers(session.completedStepNumbers);
    }
    if (session.messages && Array.isArray(session.messages)) {
      setMessages(
        session.messages.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          modelUsed: m.modelUsed,
          timestamp: m.timestamp,
        }))
      );
    }
    if (session.annotations && Array.isArray(session.annotations)) {
      setAnnotations(session.annotations);
    }
  };

  if (!isLoaded && !currentCircuit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm font-mono text-slate-400">Łączenie z bazą Cloud SQL PostgreSQL...</p>
        </div>
      </div>
    );
  }

  const currentStep =
    currentCircuit?.socraticSteps?.find((s) => s.stepNumber === currentStepNumber) ??
    currentCircuit?.socraticSteps?.[0];
  const activeTargetSymbolIds = currentStep?.targetSymbolIds ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300">
      <TopNavbar
        summaries={summaries}
        currentCircuitId={currentCircuitId}
        onSelectCircuit={handleSelectCircuit}
        onExportSession={handleExportSession}
        onRestoreSession={handleRestoreSession}
        onSaveCustomCircuit={handleSaveCustomCircuit}
        onDeleteCircuit={handleDeleteCircuit}
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
              completedStepNumbers={completedStepNumbers}
              onToggleStepCompleted={handleToggleStepCompleted}
              onStepAutoCompleted={handleStepAutoCompleted}
              messages={messages}
              onMessagesChange={setMessages}
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
              annotations={annotations}
              onAnnotationsChange={setAnnotations}
              onSelectCircuit={handleSelectCircuit}
              onPreviousCircuit={handlePreviousCircuit}
              onNextCircuit={handleNextCircuit}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <DeSchemaWorkspace />
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
