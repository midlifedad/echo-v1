/**
 * Token Utilities
 *
 * Helper functions for working with design tokens.
 * Includes memoized token lookup for performance.
 */

import { themes } from '../themes';
import type { ThemeId, ThemeConfiguration } from '../types';

/**
 * Token cache for memoization
 */
const tokenCache = new Map<string, any>();

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Get token value by path with memoization
 *
 * @param path - Dot-notation path to token (e.g., 'colors.primary.500')
 * @param theme - Theme to get token from (defaults to 'light')
 * @returns Token value or undefined if not found
 *
 * @example
 * ```ts
 * const primaryColor = getToken('colors.primary.500');
 * const headingSize = getToken('typography.fontSize.h1', 'dark');
 * ```
 *
 * Performance: O(1) with memoization
 */
export function getToken(path: string, theme: ThemeId = 'light'): any {
  const cacheKey = `${theme}:${path}`;

  // Check cache first
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey);
  }

  // Get theme configuration
  const config = themes[theme];
  if (!config) {
    console.warn(`[getToken] Theme "${theme}" not found`);
    return undefined;
  }

  // Get nested value
  const value = getNestedValue(config, path);

  // Cache the result
  if (value !== undefined) {
    tokenCache.set(cacheKey, value);
  }

  return value;
}

/**
 * Clear token cache
 * Useful when themes are updated dynamically
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

/**
 * Get all tokens for a specific category
 *
 * @param category - Category name (e.g., 'colors', 'spacing')
 * @param theme - Theme to get tokens from
 * @returns Object containing all tokens in the category
 */
export function getTokensByCategory(category: string, theme: ThemeId = 'light'): any {
  const config = themes[theme];
  if (!config) {
    console.warn(`[getTokensByCategory] Theme "${theme}" not found`);
    return {};
  }

  return config[category as keyof ThemeConfiguration] || {};
}

/**
 * Check if a token exists
 *
 * @param path - Dot-notation path to token
 * @param theme - Theme to check
 * @returns true if token exists
 */
export function hasToken(path: string, theme: ThemeId = 'light'): boolean {
  return getToken(path, theme) !== undefined;
}

/**
 * Get CSS variable name for a token path
 *
 * @param path - Dot-notation path to token
 * @returns CSS variable name (e.g., 'var(--color-primary-500)')
 *
 * @example
 * ```ts
 * const cssVar = getCSSVariable('colors.primary.500');
 * // Returns: 'var(--color-primary-500)'
 * ```
 */
export function getCSSVariable(path: string): string {
  // Convert dot notation to CSS variable name
  const varName = path.replace(/\./g, '-');
  return `var(--${varName})`;
}

/**
 * Get raw CSS variable name (without var())
 *
 * @param path - Dot-notation path to token
 * @returns Raw CSS variable name (e.g., '--color-primary-500')
 */
export function getRawCSSVariable(path: string): string {
  const varName = path.replace(/\./g, '-');
  return `--${varName}`;
}

/**
 * Batch get multiple tokens
 *
 * @param paths - Array of token paths
 * @param theme - Theme to get tokens from
 * @returns Object mapping paths to values
 *
 * @example
 * ```ts
 * const tokens = getTokens([
 *   'colors.primary.500',
 *   'spacing.md',
 *   'typography.fontSize.body'
 * ]);
 * ```
 */
export function getTokens(paths: string[], theme: ThemeId = 'light'): Record<string, any> {
  const result: Record<string, any> = {};

  for (const path of paths) {
    result[path] = getToken(path, theme);
  }

  return result;
}

/**
 * Token utilities export
 */
export const tokenUtils = {
  getToken,
  getTokensByCategory,
  hasToken,
  getCSSVariable,
  getRawCSSVariable,
  getTokens,
  clearTokenCache,
};

export default tokenUtils;
