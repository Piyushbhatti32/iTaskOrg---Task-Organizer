'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '../store';
import { getFirebaseAuth } from "@/lib/firebase-client";

const auth = getFirebaseAuth();

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const settings = useSettings();
  const [isDark, setIsDark] = useState(false);
  const [accentColor, setAccentColor] = useState('blue');

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (settings.theme === 'system') {
        setIsDark(e.matches);
        updateDocumentTheme(e.matches, settings.accentColor);
      }
    };

    // Set initial theme based on settings
    if (settings.theme === 'dark') {
      setIsDark(true);
      updateDocumentTheme(true, settings.accentColor);
    } else if (settings.theme === 'light') {
      setIsDark(false);
      updateDocumentTheme(false, settings.accentColor);
    } else if (settings.theme === 'system') {
      const systemIsDark = mediaQuery.matches;
      setIsDark(systemIsDark);
      updateDocumentTheme(systemIsDark, settings.accentColor);
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [settings.theme, settings.accentColor]);

  // Update accent color when it changes
  useEffect(() => {
    console.log('ThemeContext - accent color effect triggered');
    console.log('ThemeContext - settings.accentColor:', settings.accentColor);
    console.log('ThemeContext - isDark:', isDark);
    setAccentColor(settings.accentColor);
    updateDocumentTheme(isDark, settings.accentColor);
  }, [settings.accentColor, isDark]);

  // Define accent colors outside of updateDocumentTheme so they can be accessed by context
  const accentColors = {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    green: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },
    yellow: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12'
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81'
    },
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63'
    }
  };

  const updateDocumentTheme = (dark, accent) => {
    console.log('ThemeContext - updateDocumentTheme called with:', { dark, accent });
    const root = document.documentElement;

    // Apply dark/light theme with improved contrast
    if (dark) {
      root.classList.add('dark');
      root.style.setProperty('--background-color', '#0f0f0f');
      root.style.setProperty('--foreground-color', '#ffffff');
      root.style.setProperty('--muted-text-color', '#a3a3a3');
      root.style.setProperty('--border-color', '#262626');
      
      // Update new CSS variables for dark mode
      root.style.setProperty('--background-primary', '#0f0f0f');
      root.style.setProperty('--background-secondary', '#1a1a1a');
      root.style.setProperty('--background-tertiary', '#262626');
      root.style.setProperty('--surface-primary', '#171717');
      root.style.setProperty('--surface-secondary', '#262626');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--text-tertiary', '#9ca3af');
      root.style.setProperty('--text-muted', '#6b7280');
      root.style.setProperty('--border-primary', '#374151');
      root.style.setProperty('--border-secondary', '#4b5563');
      root.style.setProperty('--divider', '#374151');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background-color', '#f9fafb');
      root.style.setProperty('--foreground-color', '#111827');
      root.style.setProperty('--muted-text-color', '#6b7280');
      root.style.setProperty('--border-color', '#e5e7eb');
      
      // Update new CSS variables for light mode
      root.style.setProperty('--background-primary', '#ffffff');
      root.style.setProperty('--background-secondary', '#f8fafc');
      root.style.setProperty('--background-tertiary', '#f1f5f9');
      root.style.setProperty('--surface-primary', '#ffffff');
      root.style.setProperty('--surface-secondary', '#f8fafc');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-tertiary', '#64748b');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-primary', '#e2e8f0');
      root.style.setProperty('--border-secondary', '#cbd5e1');
      root.style.setProperty('--divider', '#f1f5f9');
    }

    // Apply accent color CSS variables - ensure we have a valid accent color
    const validAccent = accent && accentColors[accent] ? accent : 'blue';
    const colors = accentColors[validAccent];
    console.log('ThemeContext - applying accent color:', validAccent, colors);
    
    // Set CSS custom properties for the accent color
    Object.entries(colors).forEach(([shade, color]) => {
      const cssVar = `--color-primary-${shade}`;
      root.style.setProperty(cssVar, color);
      console.log('ThemeContext - set CSS var:', cssVar, '=', color);
    });
    
    console.log('ThemeContext - theme update complete');
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    updateDocumentTheme(!isDark, accentColor);
    
    // Update local settings in the store first (immediate UI feedback)
    const updateLocalSettings = useSettings.getState().updateFocusSettings || (() => {});
    
    // Try to sync with server if user is authenticated
    const user = auth.currentUser;
    const userId = user?.uid;
    console.log('ThemeContext - toggleTheme - user object:', user);
    console.log('ThemeContext - toggleTheme - userId:', userId);
    console.log('ThemeContext - toggleTheme - userId type:', typeof userId);
    console.log('ThemeContext - toggleTheme - newTheme:', newTheme);
    
    // Try to sync with server if user is authenticated
    if (user && userId && typeof userId === 'string') {
      try {
        const updateSettings = useSettings.getState().updateSettings;
        await updateSettings(userId, { theme: newTheme });
        console.log('ThemeContext - toggleTheme - server sync success');
      } catch (error) {
        console.error('ThemeContext - toggleTheme - server sync failed (continuing with local change):', error);
        // Don't throw the error - theme change should still work locally
      }
    } else {
      console.log('ThemeContext - toggleTheme - no authenticated user, saving to localStorage only');
    }
    
    // Always store in localStorage as fallback
    try {
      localStorage.setItem('theme-preference', newTheme);
      console.log('ThemeContext - toggleTheme - saved to localStorage');
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
  };

  const setTheme = (theme) => {
    if (theme === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemIsDark);
      updateDocumentTheme(systemIsDark, accentColor);
    } else {
      const newIsDark = theme === 'dark';
      setIsDark(newIsDark);
      updateDocumentTheme(newIsDark, accentColor);
    }
  };

  const changeAccentColor = async (newAccentColor) => {
    console.log('ThemeContext - changeAccentColor called with:', newAccentColor);
    
    // Update local state immediately
    setAccentColor(newAccentColor);
    updateDocumentTheme(isDark, newAccentColor);
    
    // Try to sync with server if user is authenticated
    const user = auth.currentUser;
    if (user && user.uid) {
      try {
        const updateSettings = useSettings.getState().updateSettings;
        await updateSettings(user.uid, { accentColor: newAccentColor });
        console.log('ThemeContext - accent color sync success');
      } catch (error) {
        console.error('ThemeContext - accent color sync failed:', error);
      }
    }
    
    // Always store in localStorage as fallback
    try {
      localStorage.setItem('accent-color-preference', newAccentColor);
    } catch (e) {
      console.warn('Could not save accent color to localStorage:', e);
    }
  };

  const value = {
    isDark,
    accentColor,
    accentColors,
    theme: settings.theme,
    toggleTheme,
    setTheme,
    changeAccentColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
