/**
 * @file ThemeContext.tsx
 * @description Theme context managing dark and light mode state with smooth animated transitions.
 * @author s-reinmar
 * @license MIT
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  readonly theme: Theme;
  readonly toggleTheme: () => void;
  readonly setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('deschema_theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark'; // Domyślny tryb ciemny (Default Dark Mode)
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    const root = document.documentElement;

    // Apply smooth transition class only after initial mount to avoid flickering on page load
    if (!isInitialMount.current) {
      root.classList.add('theme-transitioning');
    } else {
      isInitialMount.current = false;
    }

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    try {
      window.localStorage?.setItem('deschema_theme', theme);
    } catch {
      // ignore storage unavailability in restrictive iframes
    }

    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 400);

    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
