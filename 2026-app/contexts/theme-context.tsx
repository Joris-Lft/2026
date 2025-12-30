import React, { createContext, useContext } from 'react';
import { useThemeToggle, ThemeMode } from '@/hooks/use-theme-toggle';

type ThemeContextType = ReturnType<typeof useThemeToggle>;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeToggle = useThemeToggle();

  return (
    <ThemeContext.Provider value={themeToggle}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

