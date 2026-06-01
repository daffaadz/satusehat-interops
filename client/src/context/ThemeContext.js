"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react';
import {
  applyThemeToDocument,
  getThemeColors,
  persistTheme,
  resolveIsDark,
} from '../lib/theme';

const ThemeContext = createContext(null);

function readIsDarkFromDom() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.theme === 'dark';
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => readIsDarkFromDom());
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const initialDark = resolveIsDark();
    setIsDark(initialDark);
    applyThemeToDocument(initialDark);
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    applyThemeToDocument(isDark);
  }, [isDark, ready]);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('theme-transition-enabled');
    setIsDark((prev) => {
      const next = !prev;
      persistTheme(next);
      return next;
    });
  }, []);

  const colors = getThemeColors(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, ready }}>
      <div
        className={`min-h-full ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: ready ? 'opacity 0.15s ease-out' : 'none' }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
