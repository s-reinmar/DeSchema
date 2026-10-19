/**
 * @file Footer.tsx
 * @description Application footer component with author attribution and MIT license.
 * @author s-reinmar
 * @license MIT
 */

import React from 'react';
import { Cpu, ShieldCheck, Heart, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/80 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Brand and Tagline */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-600/20 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200">DeSchema Mentor</span>
            <span className="mx-2 text-slate-600">•</span>
            <span>Cierpliwy dialog bez gotowców</span>
          </div>
        </div>

        {/* Legal & Author */}
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1 font-mono">
            <span>Autor:</span>
            <span className="text-cyan-400 font-bold">@s-reinmar</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">Licencja MIT</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1 text-slate-500 font-mono">
            <Terminal className="w-3 h-3" />
            <span>TypeScript Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
