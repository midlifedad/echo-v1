'use client';

/**
 * Theme Context
 *
 * Provides theme state and switching functionality to the entire application.
 * Implements ThemeContextValue interface from contracts.
 *
 * Performance target: <100ms theme switching
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { themes, lightTheme, darkTheme } from '@/lib/design-system/themes';
import type {
  ThemeContextValue,
  ThemeId,
  ThemeSource,
  ThemeConfiguration,
  ThemeProviderProps,
} from '@/lib/design-system/types';

/**
 * Storage key for theme preference
 */
const STORAGE_KEY = 'echo-theme';

/**
 * Create the theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Get a nested value from an object using dot notation
 * Example: getNestedValue(obj, 'colors.primary.500')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Theme Provider Component
 *
 * Wraps the application and provides theme context.
 * Handles theme persistence, FOUC prevention, and state management.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  enablePersistence = true,
  storageKey = STORAGE_KEY,
  customThemes,
}: ThemeProviderProps) {
  const [current, setCurrent] = useState<ThemeId>(defaultTheme);
  const [source, setSource] = useState<ThemeSource>('default');
  const [isApplying, setIsApplying] = useState(false);
  const [lastChanged, setLastChanged] = useState(Date.now());

  /**
   * Load saved theme from localStorage on mount
   */
  useEffect(() => {
    if (!enablePersistence) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && (saved === 'light' || saved === 'dark')) {
        setCurrent(saved);
        setSource('user');
        setLastChanged(Date.now());
      }
    } catch (error) {
      // localStorage not available (incognito mode, etc.)
      console.warn('[ThemeContext] localStorage not available:', error);
    }
  }, [enablePersistence, storageKey]);

  /**
   * Apply theme to DOM
   * Updates data-theme attribute on document element
   */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', current);
  }, [current]);

  /**
   * Set theme
   * Switches to a specific theme with validation and persistence
   */
  const setTheme = useCallback(
    (theme: ThemeId) => {
      const startTime = performance.now();
      setIsApplying(true);

      try {
        // Validate theme exists
        if (!themes[theme]) {
          throw new Error(`Theme "${theme}" is not available`);
        }

        // Update state
        setCurrent(theme);
        setSource('user');
        setLastChanged(Date.now());

        // Persist to localStorage
        if (enablePersistence) {
          try {
            localStorage.setItem(storageKey, theme);
          } catch (error) {
            console.warn('[ThemeContext] Failed to persist theme:', error);
          }
        }

        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);

        const endTime = performance.now();
        const duration = endTime - startTime;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[ThemeContext] Theme switched to "${theme}" in ${duration.toFixed(2)}ms`);
        }

        // Verify performance requirement
        if (duration > 100) {
          console.warn(
            `[ThemeContext] Theme switching took ${duration.toFixed(2)}ms (target: <100ms)`
          );
        }
      } catch (error) {
        console.error('[ThemeContext] Failed to set theme:', error);
        // Fallback to default theme
        setCurrent(defaultTheme);
        setSource('default');
      } finally {
        setIsApplying(false);
      }
    },
    [defaultTheme, enablePersistence, storageKey]
  );

  /**
   * Toggle theme
   * Switches between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    const newTheme: ThemeId = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [current, setTheme]);

  /**
   * Get current theme configuration
   */
  const getThemeConfig = useCallback((): ThemeConfiguration => {
    if (customThemes && customThemes[current]) {
      return customThemes[current];
    }
    return themes[current];
  }, [current, customThemes]);

  /**
   * Get a specific design token value
   * Supports dot-notation paths like 'colors.primary.500'
   */
  const getToken = useCallback(
    (path: string): any => {
      const config = getThemeConfig();

      // Try to get value from theme configuration
      const value = getNestedValue(config, path);

      if (value !== undefined) {
        return value;
      }

      // Fallback: try to get from CSS variables
      if (config.cssVariables && config.cssVariables[path]) {
        return config.cssVariables[path];
      }

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ThemeContext] Token not found: "${path}"`);
      }

      return undefined;
    },
    [getThemeConfig]
  );

  /**
   * Check if current theme supports a feature
   */
  const supports = useCallback(
    (feature: string): boolean => {
      // Future feature flags can be added to theme configuration
      const config = getThemeConfig();

      // Built-in features
      const builtInFeatures: Record<string, boolean> = {
        darkMode: current === 'dark',
        lightMode: current === 'light',
        customColors: false, // Future feature
        gradients: true,
        animations: true,
      };

      return builtInFeatures[feature] ?? false;
    },
    [current, getThemeConfig]
  );

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const value = useMemo<ThemeContextValue>(
    () => ({
      current,
      available: ['light', 'dark'],
      source,
      isApplying,
      lastChanged,
      setTheme,
      toggleTheme,
      getThemeConfig,
      getToken,
      supports,
    }),
    [current, source, isApplying, lastChanged, setTheme, toggleTheme, getThemeConfig, getToken, supports]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme Hook
 *
 * Access theme context in any component.
 * Throws error if used outside ThemeProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { current, setTheme, toggleTheme } = useTheme();
 *   return <button onClick={toggleTheme}>Current: {current}</button>;
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Export context for advanced use cases
 */
export { ThemeContext };
