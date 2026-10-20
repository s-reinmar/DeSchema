/**
 * @file UserAuthButton.tsx
 * @description Header authentication widget supporting Google Sign-In, user profile badge, and sign-out menu.
 * @author s-reinmar
 * @license MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, User, Loader2, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  readonly onOpenDatabaseManager?: () => void;
}

export const UserAuthButton: React.FC<Props> = ({ onOpenDatabaseManager }) => {
  const { user, isLoading, signInWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        <span className="hidden sm:inline">Autoryzacja...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl shadow-md transition cursor-pointer"
        title="Zaloguj się przez konto Google, aby tworzyć i zapisywać własne układy w Cloud SQL"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Zaloguj z Google</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition cursor-pointer"
        title={user.displayName || user.email || 'Profil użytkownika'}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Avatar'}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-500/50"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center text-xs font-bold ring-1 ring-cyan-500/40">
            <User className="w-3.5 h-3.5" />
          </div>
        )}
        <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate text-slate-200">
          {user.displayName?.split(' ')[0] || 'Moje konto'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 animate-fade-in text-slate-200">
          <div className="p-3 border-b border-slate-800">
            <p className="text-xs font-bold text-white truncate">{user.displayName || 'Użytkownik DeSchema'}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{user.email}</p>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDatabaseManager?.();
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
              title="Otwórz panel zarządzania bazą danych Cloud SQL"
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>Baza Cloud SQL aktywna</span>
            </button>
          </div>

          <div className="py-1 border-b border-slate-800 space-y-1">
            {onOpenDatabaseManager && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenDatabaseManager();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zarządzaj bazą danych</span>
              </button>
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Wyloguj się</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
