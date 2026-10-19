/**
 * @file TopNavbar.tsx
 * @description Application top navigation bar coordinating Settings, Help Drawer, About modal, and JSON upload.
 * @author @s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { Cpu, HelpCircle, Info, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { SettingsDropdown } from './navigation/SettingsDropdown.tsx';
import { HelpDrawer } from './navigation/HelpDrawer.tsx';
import { JsonUploadButton } from './navigation/JsonUploadButton.tsx';
import { AboutModal } from './modals/AboutModal.tsx';
import { CheatsheetModal } from './modals/CheatsheetModal.tsx';
import type { ICircuitRepository } from '../interfaces/circuit-repository.interface.ts';

interface Props {
  readonly repository: ICircuitRepository;
  readonly onCircuitUploaded: (circuitId: string) => void;
}

export const TopNavbar: React.FC<Props> = ({ repository, onCircuitUploaded }) => {
  const { theme, toggleTheme } = useTheme();
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCheatsheetModalOpen, setIsCheatsheetModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleJsonLoaded = (data: unknown) => {
    const validation = repository.validateCircuit(data);
    if (!validation.isValid || !validation.circuit) {
      alert(`Błąd walidacji schematu JSON:\n• ${validation.errors.join('\n• ')}`);
      return;
    }
    repository.saveCustomCircuit(validation.circuit);
    onCircuitUploaded(validation.circuit.id);
  };

  const handleJsonError = (errorMsg: string) => {
    alert(`Nie udało się wczytać pliku: ${errorMsg}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl shadow-md text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  DeSchema
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Mentor
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                Prowadzi krok po kroku • Analiza schematów i obwodów • Cierpliwy dialog bez gotowców
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 text-sm">
            {/* 1. Ustawienia (Dropdown) */}
            <SettingsDropdown />

            {/* 2. Pomoc (Boczny Drawer) */}
            <button
              onClick={() => setIsHelpDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition cursor-pointer"
              title="Otwórz centrum pomocy i bazę podpowiedzi"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Pomoc</span>
            </button>

            {/* 3. O programie (Modal) */}
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition cursor-pointer"
              title="Informacje o projekcie, wersji i licencji"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>O programie</span>
            </button>

            {/* 4. Wgraj JSON */}
            <JsonUploadButton
              onJsonLoaded={handleJsonLoaded}
              onError={handleJsonError}
              className="ml-2"
            />
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Przełącz motyw"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title={theme === 'dark' ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition lg:hidden cursor-pointer"
              aria-label="Menu nawigacji"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2 animate-fade-in">
            <div className="py-1">
              <SettingsDropdown />
            </div>

            <button
              onClick={() => {
                setIsHelpDrawerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900 rounded-xl"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Pomoc &amp; Baza podpowiedzi</span>
            </button>

            <button
              onClick={() => {
                setIsAboutModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900 rounded-xl"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>O programie</span>
            </button>

            <div className="pt-2 border-t border-slate-800/80">
              <JsonUploadButton
                onJsonLoaded={(data) => {
                  handleJsonLoaded(data);
                  setIsMobileMenuOpen(false);
                }}
                onError={handleJsonError}
                className="w-full justify-center"
              />
            </div>
          </div>
        )}
      </header>

      {/* Drawer Pomocy */}
      <HelpDrawer
        isOpen={isHelpDrawerOpen}
        onClose={() => setIsHelpDrawerOpen(false)}
        onOpenCheatsheet={() => setIsCheatsheetModalOpen(true)}
      />

      {/* Modal O programie */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Modal Ściągawka praw (wyzwalany z HelpDrawer) */}
      <CheatsheetModal
        isOpen={isCheatsheetModalOpen}
        onClose={() => setIsCheatsheetModalOpen(false)}
      />
    </>
  );
};
