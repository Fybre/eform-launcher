import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { storageUtils } from '@/utils/storage';
import { ThemeMode } from '@/types/eform';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  effectiveColorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await storageUtils.getTheme();
    setThemeModeState(savedTheme);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await storageUtils.saveTheme(mode);
  };

  const effectiveColorScheme: 'light' | 'dark' =
    themeMode === 'system'
      ? (systemColorScheme ?? 'light')
      : themeMode;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, effectiveColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
