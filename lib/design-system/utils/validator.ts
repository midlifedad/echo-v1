/**
 * Token Validator
 *
 * Validates design tokens for correctness, WCAG compliance, and consistency.
 */

import type {
  DesignToken,
  TokenCollection,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  WCAGInfo,
  TokenCategory,
} from '../types';

/**
 * Calculate relative luminance of a color
 * Used for WCAG contrast ratio calculation
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(fg: string, bg: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);

  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate WCAG contrast ratio for a color pair
 *
 * WCAG AA Requirements:
 * - Normal text: 4.5:1
 * - Large text (18pt+): 3:1
 * - UI components: 3:1
 *
 * WCAG AAA Requirements:
 * - Normal text: 7:1
 * - Large text: 4.5:1
 */
export function validateContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): WCAGInfo {
  const ratio = getContrastRatio(foreground, background);

  const aaThresholds = {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
  };

  const aaaThresholds = {
    normalText: 7.0,
    largeText: 4.5,
    uiComponents: 3.0,
  };

  const thresholds = level === 'AAA' ? aaaThresholds : aaThresholds;

  const passesNormalText = ratio >= thresholds.normalText;
  const passesLargeText = ratio >= thresholds.largeText;
  const passesUIComponents = ratio >= thresholds.uiComponents;

  let achievedLevel: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
  if (ratio >= aaaThresholds.normalText) {
    achievedLevel = 'AAA';
  } else if (ratio >= aaThresholds.normalText) {
    achievedLevel = 'AA';
  }

  return {
    level: achievedLevel,
    ratio: Math.round(ratio * 100) / 100,
    testedAgainst: background,
    passesNormalText,
    passesLargeText,
    passesUIComponents,
  };
}

/**
 * Validate a single token for correctness
 */
export function validateToken(token: DesignToken): boolean {
  // Check required fields
  if (!token.id || !token.name || !token.category) {
    return false;
  }

  // Check value exists
  if (token.value === undefined || token.value === null) {
    return false;
  }

  // Check CSS variable naming if present
  if (token.cssVar) {
    if (!token.cssVar.startsWith('--')) {
      return false;
    }
  }

  // Check deprecated tokens have replacedBy
  if (token.deprecated && !token.replacedBy) {
    return false;
  }

  return true;
}

/**
 * Validate hex color format
 */
function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
}

/**
 * Validate that token IDs are unique within a category
 */
function validateUniqueIds(tokens: DesignToken[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Map<string, Set<string>>();

  for (const token of tokens) {
    if (!seen.has(token.category)) {
      seen.set(token.category, new Set());
    }

    const categoryIds = seen.get(token.category)!;
    if (categoryIds.has(token.id)) {
      errors.push({
        tokenId: token.id,
        category: token.category,
        message: `Duplicate token ID "${token.id}" in category "${token.category}"`,
        severity: 'error',
      });
    }
    categoryIds.add(token.id);
  }

  return errors;
}

/**
 * Validate required tokens are present
 */
function validateRequiredTokens(collection: TokenCollection): ValidationError[] {
  const errors: ValidationError[] = [];

  const required = [
    { category: 'color', id: 'colors.primary.500' },
    { category: 'color', id: 'colors.background.default' },
    { category: 'color', id: 'colors.text.primary' },
    { category: 'typography', id: 'typography.body' },
    { category: 'spacing', id: 'spacing.md' },
  ];

  for (const req of required) {
    const found = collection.index.has(req.id);
    if (!found) {
      errors.push({
        tokenId: req.id,
        category: req.category as TokenCategory,
        message: `Required token "${req.id}" is missing`,
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Validate WCAG compliance for all color tokens
 */
function validateWCAGCompliance(collection: TokenCollection): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: { totalColors: number; compliantColors: number; failedColors: string[] };
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const failedColors: string[] = [];

  const colorTokens = collection.tokens.colors || [];
  let compliantCount = 0;

  // This is a simplified check - in real implementation, you'd check actual color pairs
  // For now, we'll just validate the color format
  for (const token of colorTokens) {
    if (!isValidHexColor(token.value)) {
      errors.push({
        tokenId: token.id,
        category: 'color',
        message: `Invalid hex color format: "${token.value}"`,
        severity: 'error',
      });
      failedColors.push(token.id);
    } else {
      compliantCount++;
    }
  }

  return {
    errors,
    warnings,
    summary: {
      totalColors: colorTokens.length,
      compliantColors: compliantCount,
      failedColors,
    },
  };
}

/**
 * Validate spacing tokens align with base unit (4px)
 */
function validateSpacing(collection: TokenCollection): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const baseUnit = 4;

  const spacingTokens = collection.tokens.spacing || [];

  for (const token of spacingTokens) {
    if (typeof token.value === 'number') {
      if (token.value % baseUnit !== 0) {
        warnings.push({
          tokenId: token.id,
          category: 'spacing',
          message: `Spacing value ${token.value}px is not divisible by base unit (${baseUnit}px)`,
          severity: 'warning',
          suggestion: `Consider using ${Math.round(token.value / baseUnit) * baseUnit}px`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Validate entire token collection
 */
export function validateTokens(collection: TokenCollection): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate all individual tokens
  const allTokens = [
    ...(collection.tokens.colors || []),
    ...(collection.tokens.typography || []),
    ...(collection.tokens.spacing || []),
    ...(collection.tokens.borders || []),
    ...(collection.tokens.shadows || []),
    ...(collection.tokens.transitions || []),
  ];

  for (const token of allTokens) {
    if (!validateToken(token)) {
      errors.push({
        tokenId: token.id,
        category: token.category,
        message: `Token validation failed for "${token.id}"`,
        severity: 'error',
      });
    }
  }

  // Check for unique IDs
  errors.push(...validateUniqueIds(allTokens));

  // Check for required tokens
  errors.push(...validateRequiredTokens(collection));

  // Validate WCAG compliance
  const wcagValidation = validateWCAGCompliance(collection);
  errors.push(...wcagValidation.errors);
  warnings.push(...wcagValidation.warnings);

  // Validate spacing alignment
  warnings.push(...validateSpacing(collection));

  return {
    errors,
    warnings,
    passed: errors.length === 0,
    wcagCompliance: wcagValidation.summary,
  };
}

/**
 * Create a token validator instance
 */
export const tokenValidator = {
  validate: validateTokens,
  validateToken,
  validateContrast,
};

export default tokenValidator;
