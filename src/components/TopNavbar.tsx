/**
 * @file TopNavbar.tsx
 * @description Application top navigation bar with branding, modal triggers, and theme toggle.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { Cpu, HelpCircle, BookOpen, Info, Sun, Moon, Upload, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { WhyWeDidThisModal } from './modals/WhyWeDidThisModal.tsx';
import { CheatsheetModal } from './modals/CheatsheetModal.tsx';
import { AboutModal } from './modals/AboutModal.tsx';
import { UploadModal } from './modals/UploadModal.tsx';
import type { ICircuitRepository } from '../interfaces/circuit-repository.interface.ts';

interface Props {
  readonly repository: ICircuitRepository;
  readonly onCircuitUploaded: (circuitId: string) => void;
}

export const TopNavbar: React.FC<Props> = ({ repository, onCircuitUploaded }) => {
  const { theme, toggleTheme } = useTheme();
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isCheatsheetModalOpen, setIsCheatsheetModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <nav className="hidden lg:flex items-center gap-1.5 text-sm">
            <button
              onClick={() => setIsWhyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Dlaczego tak zrobiliśmy</span>
            </button>

            <button
              onClick={() => setIsCheatsheetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Ściągawka praw</span>
            </button>

            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>O programie</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition border border-emerald-500/20 ml-2"
            >
              <Upload className="w-4 h-4" />
              <span>Wgraj JSON</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Przełącz motyw"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
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
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition lg:hidden"
              aria-label="Menu mobilne"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
            <button
              onClick={() => {
                setIsWhyModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Dlaczego tak zrobiliśmy</span>
            </button>

            <button
              onClick={() => {
                setIsCheatsheetModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Ściągawka praw</span>
            </button>

            <button
              onClick={() => {
                setIsAboutModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>O programie</span>
            </button>

            <button
              onClick={() => {
                setIsUploadModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-emerald-400 hover:bg-emerald-950/30 rounded-lg border border-emerald-500/20"
            >
              <Upload className="w-4 h-4" />
              <span>Wgraj własny obwód JSON</span>
            </button>
          </div>
        )}
      </header>

      {/* Modals */}
      <WhyWeDidThisModal isOpen={isWhyModalOpen} onClose={() => setIsWhyModalOpen(false)} />
      <CheatsheetModal
        isOpen={isCheatsheetModalOpen}
        onClose={() => setIsCheatsheetModalOpen(false)}
      />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        repository={repository}
        onCircuitUploaded={(newId) => {
          onCircuitUploaded(newId);
          setIsUploadModalOpen(false);
        }}
      />
    </>
  );
};
