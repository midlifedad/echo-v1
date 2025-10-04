/**
 * Theme Configurations
 *
 * Assembles complete theme configurations from token definitions.
 * Exports light and dark themes with full validation.
 */

import { lightColorTokens } from '../tokens/colors.light';
import { darkColorTokens } from '../tokens/colors.dark';
import {
  typographyTokens,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} from '../tokens/typography';
import { spacingRem } from '../tokens/spacing';
import { borderRadiusValues, shadowValues, transitionValues } from '../tokens/effects';
import type { ThemeConfiguration, ThemeId } from '../types';

/**
 * Light Theme Configuration
 */
export const lightTheme: ThemeConfiguration = {
  id: 'light',
  name: 'Light Theme',
  isDefault: true,
  colors: {
    primary: lightColorTokens.primary,
    secondary: lightColorTokens.secondary,
    background: lightColorTokens.background,
    text: lightColorTokens.text,
    border: lightColorTokens.border,
    semantic: lightColorTokens.semantic,
  },
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  },
  spacing: spacingRem,
  borderRadius: borderRadiusValues,
  shadows: shadowValues,
  transitions: transitionValues,
  cssVariables: {
    // CSS variable references for programmatic access
    'colors.primary.500': 'var(--color-primary-500)',
    'colors.background.default': 'var(--color-background-default)',
    'colors.text.primary': 'var(--color-text-primary)',
    'typography.fontSize.body': 'var(--font-size-body)',
    'spacing.md': 'var(--spacing-md)',
  },
  meta: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wcagCompliant: true,
  },
};

/**
 * Dark Theme Configuration
 */
export const darkTheme: ThemeConfiguration = {
  id: 'dark',
  name: 'Dark Theme',
  isDefault: false,
  colors: {
    primary: darkColorTokens.primary,
    secondary: darkColorTokens.secondary,
    background: darkColorTokens.background,
    text: darkColorTokens.text,
    border: darkColorTokens.border,
    semantic: darkColorTokens.semantic,
  },
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  },
  spacing: spacingRem,
  borderRadius: borderRadiusValues,
  shadows: shadowValues, // Dark mode uses different shadow opacity in CSS
  transitions: transitionValues,
  cssVariables: {
    // CSS variable references for programmatic access
    'colors.primary.500': 'var(--color-primary-500)',
    'colors.background.default': 'var(--color-background-default)',
    'colors.text.primary': 'var(--color-text-primary)',
    'typography.fontSize.body': 'var(--font-size-body)',
    'spacing.md': 'var(--spacing-md)',
  },
  meta: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wcagCompliant: true,
  },
};

/**
 * All available themes
 */
export const themes: Record<ThemeId, ThemeConfiguration> = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Get theme by ID
 */
export function getTheme(id: ThemeId): ThemeConfiguration {
  return themes[id];
}

/**
 * Get default theme
 */
export function getDefaultTheme(): ThemeConfiguration {
  return lightTheme;
}

/**
 * Validate theme configuration
 */
export function validateTheme(theme: ThemeConfiguration): boolean {
  // Check required fields
  if (!theme.id || !theme.name) return false;

  // Check required color tokens
  if (!theme.colors.primary || !theme.colors.background || !theme.colors.text) {
    return false;
  }

  // Check required typography tokens
  if (!theme.typography.fontSize || !theme.typography.fontWeight) {
    return false;
  }

  // Check required spacing
  if (!theme.spacing.md) {
    return false;
  }

  return true;
}

/**
 * Check if both themes are valid
 */
export const themesValidated = {
  light: validateTheme(lightTheme),
  dark: validateTheme(darkTheme),
  all: validateTheme(lightTheme) && validateTheme(darkTheme),
};

// Log validation status in development
if (process.env.NODE_ENV === 'development') {
  console.log('[Design System] Theme Validation:', themesValidated);
}
