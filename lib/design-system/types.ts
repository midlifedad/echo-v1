/**
 * Design System Type Definitions
 *
 * Complete TypeScript interfaces for the tokenized design system.
 * Implements all contracts from data-model.md and contracts/.
 */

import type { ColorValue, ColorScale } from './tokens/colors.light';
import type { TypographyToken, TypographyLevel, WeightLevel } from './tokens/typography';
import type { SpacingToken, SpacingLevel } from './tokens/spacing';
import type {
  BorderRadiusToken,
  ShadowToken,
  TransitionToken,
  BorderRadiusLevel,
  ShadowLevel,
  TransitionLevel,
} from './tokens/effects';

/**
 * Base design token interface
 * All tokens inherit from this base type
 */
export interface DesignToken<T = any> {
  /** Unique identifier within category */
  id: string;

  /** Human-readable name */
  name: string;

  /** Token category */
  category: TokenCategory;

  /** The actual value */
  value: T;

  /** Optional CSS custom property name */
  cssVar?: string;

  /** Description of usage */
  description?: string;

  /** Deprecated flag */
  deprecated?: boolean;

  /** If deprecated, the replacement token ID */
  replacedBy?: string;
}

export type TokenCategory =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'border'
  | 'shadow'
  | 'transition'
  | 'breakpoint'
  | 'zIndex';

/**
 * Color-specific token with accessibility metadata
 */
export interface ColorToken extends DesignToken<string> {
  category: 'color';

  /** Semantic role */
  role: ColorRole;

  /** Hex value (#RRGGBB or #RRGGBBAA) */
  value: string;

  /** RGB components */
  rgb: { r: number; g: number; b: number };

  /** HSL components */
  hsl: { h: number; s: number; l: number };

  /** Optional opacity (0-1) */
  opacity?: number;

  /** WCAG compliance info */
  wcag?: WCAGInfo;

  /** Dark mode variant */
  darkVariant?: string; // Reference to dark mode token ID
}

export type ColorRole =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'text'
  | 'border'
  | 'error'
  | 'warning'
  | 'success'
  | 'info';

export interface WCAGInfo {
  /** Compliance level achieved */
  level: 'AA' | 'AAA' | 'FAIL';

  /** Contrast ratio */
  ratio: number;

  /** Color this was tested against */
  testedAgainst: string;

  /** Passes for normal text (4.5:1) */
  passesNormalText: boolean;

  /** Passes for large text (3:1) */
  passesLargeText: boolean;

  /** Passes for UI components (3:1) */
  passesUIComponents: boolean;
}

/**
 * Theme identifier
 */
export type ThemeId = 'light' | 'dark';

/**
 * Source of theme preference
 */
export type ThemeSource = 'user' | 'system' | 'default';

/**
 * Theme state exposed to consumers
 */
export interface ThemeState {
  /** Currently active theme */
  current: ThemeId;

  /** Available themes */
  available: ThemeId[];

  /** Source of current theme */
  source: ThemeSource;

  /** Whether theme is currently being applied */
  isApplying: boolean;

  /** Timestamp of last theme change (ms since epoch) */
  lastChanged: number;
}

/**
 * Color token structure for theme configuration
 */
export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  background: {
    default: ColorValue;
    surface: ColorValue;
    elevated: ColorValue;
  };
  text: {
    primary: ColorValue;
    secondary: ColorValue;
    disabled: ColorValue;
    inverse: ColorValue;
  };
  border: {
    default: ColorValue;
    subtle: ColorValue;
    strong: ColorValue;
  };
  semantic: {
    error: ColorScale;
    warning: ColorScale;
    success: ColorScale;
    info: ColorScale;
  };
}

/**
 * Typography token structure
 */
export interface TypographyTokens {
  fontFamily: {
    display: string[];
    headline: string[];
    body: string[];
    mono: string[];
  };
  fontSize: Record<TypographyLevel, string>;
  fontWeight: Record<WeightLevel, number>;
  lineHeight: Record<TypographyLevel, number>;
  letterSpacing: Record<TypographyLevel, string>;
}

/**
 * Spacing token structure
 */
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

/**
 * Border radius token structure
 */
export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

/**
 * Shadow token structure
 */
export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

/**
 * Transition token structure
 */
export interface TransitionTokens {
  fast: string;
  base: string;
  slow: string;
  slower: string;
}

/**
 * Theme metadata
 */
export interface ThemeMeta {
  version: string;
  createdAt: string;
  updatedAt: string;
  wcagCompliant: boolean;
}

/**
 * Complete theme configuration
 *
 * This is the full theme object containing all design tokens.
 */
export interface ThemeConfiguration {
  id: ThemeId;
  name: string;
  isDefault: boolean;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  transitions: TransitionTokens;
  cssVariables: Record<string, string>;
  meta: ThemeMeta;
}

/**
 * Theme context value - the main API for theme consumption
 *
 * USAGE:
 * ```tsx
 * import { useTheme } from '@/contexts/ThemeContext';
 *
 * function MyComponent() {
 *   const { current, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {current}
 *     </button>
 *   );
 * }
 * ```
 */
export interface ThemeContextValue extends ThemeState {
  /**
   * Switch to a specific theme
   *
   * @param theme - Theme to switch to ('light' | 'dark')
   * @throws Error if theme is not available
   *
   * Side effects:
   * - Updates document.documentElement.setAttribute('data-theme', theme)
   * - Persists to localStorage
   * - Triggers re-render of all consumers
   *
   * Performance: <100ms including DOM update
   */
  setTheme: (theme: ThemeId) => void;

  /**
   * Toggle between light and dark theme
   *
   * Side effects: Same as setTheme
   */
  toggleTheme: () => void;

  /**
   * Get current theme configuration
   *
   * @returns Complete theme configuration object
   *
   * Performance: O(1) lookup
   */
  getThemeConfig: () => ThemeConfiguration;

  /**
   * Get a specific design token value
   *
   * @param path - Dot-notation path to token (e.g., 'colors.primary.500')
   * @returns Token value or undefined if not found
   *
   * USAGE:
   * ```tsx
   * const primaryColor = getToken('colors.primary.500');
   * const headingFont = getToken('typography.h1.fontFamily');
   * ```
   *
   * Performance: O(1) with memoization
   */
  getToken: (path: string) => any;

  /**
   * Check if current theme supports a feature
   *
   * @param feature - Feature name
   * @returns true if feature is supported in current theme
   *
   * Example features: 'customColors', 'gradients', 'animations'
   */
  supports: (feature: string) => boolean;
}

/**
 * Props for ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components that will have access to theme context */
  children: React.ReactNode;

  /** Default theme to use if no preference found */
  defaultTheme?: ThemeId;

  /** Whether to persist theme preference to localStorage */
  enablePersistence?: boolean;

  /** Storage key for localStorage */
  storageKey?: string;

  /** Custom theme configurations (for advanced use) */
  customThemes?: Record<string, ThemeConfiguration>;
}

/**
 * Token collection - organized set of all tokens
 */
export interface TokenCollection {
  /** Collection metadata */
  meta: {
    version: string;
    generatedAt: string;
    totalTokens: number;
  };

  /** All tokens by category */
  tokens: {
    colors: ColorToken[];
    typography: TypographyToken[];
    spacing: SpacingToken[];
    borders: DesignToken<number>[];
    shadows: DesignToken<string>[];
    transitions: DesignToken<string>[];
  };

  /** Quick lookup index */
  index: Map<string, DesignToken>;

  /** Validation results */
  validation: ValidationResult;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  /** All validation errors (blocking) */
  errors: ValidationError[];

  /** Warnings (non-blocking) */
  warnings: ValidationWarning[];

  /** Overall pass/fail */
  passed: boolean;

  /** WCAG compliance summary */
  wcagCompliance: {
    totalColors: number;
    compliantColors: number;
    failedColors: string[];
  };
}

export interface ValidationError {
  tokenId: string;
  category: TokenCategory;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  tokenId: string;
  category: TokenCategory;
  message: string;
  severity: 'warning';
  suggestion?: string;
}

/**
 * Token validator interface
 */
export interface TokenValidator {
  /**
   * Validate entire token collection
   */
  validate(collection: TokenCollection): ValidationResult;

  /**
   * Validate single token
   */
  validateToken(token: DesignToken): boolean;

  /**
   * Validate WCAG compliance for color pair
   */
  validateContrast(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA'
  ): WCAGInfo;
}

/**
 * Token export formats
 */
export type TokenExportFormat =
  | 'json' // JSON file
  | 'css' // CSS custom properties
  | 'scss' // SCSS variables
  | 'tailwind' // Tailwind config
  | 'typescript' // TypeScript constants
  | 'figma'; // Figma tokens format

/**
 * Token exporter interface
 */
export interface TokenExporter {
  /**
   * Export tokens to specified format
   */
  export(
    collection: TokenCollection,
    format: TokenExportFormat,
    options?: ExportOptions
  ): string;
}

export interface ExportOptions {
  /** Whether to include metadata */
  includeMetadata?: boolean;

  /** Whether to include validation info */
  includeValidation?: boolean;

  /** Indent size for formatted output */
  indent?: number;

  /** Whether to minify output */
  minify?: boolean;

  /** Filter tokens by category */
  categories?: TokenCategory[];

  /** Custom template path (for advanced use) */
  templatePath?: string;
}
