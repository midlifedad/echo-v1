/**
 * Typography Tokens
 *
 * Defines all typography tokens including font families, sizes, weights,
 * line heights, and letter spacing. Includes responsive variants for mobile/tablet.
 */

export type TypographyLevel =
  | 'display'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body-lg' | 'body' | 'body-sm'
  | 'label' | 'caption' | 'overline';

export type WeightLevel =
  | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

export interface ResponsiveTypography {
  fontSize: number; // rem
  lineHeight: number; // unitless
  letterSpacing: number; // em
}

export interface TypographyToken extends ResponsiveTypography {
  level: TypographyLevel;
  fontWeight: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  fontStretch?: 'condensed' | 'normal' | 'expanded';
  mobile?: Partial<ResponsiveTypography>;
  tablet?: Partial<ResponsiveTypography>;
}

/**
 * Font Family Definitions
 * - display: Ultra-bold condensed headlines (Inter Tight)
 * - headline: Bold headers (Inter Tight)
 * - body: Regular body text (Inter)
 * - mono: Monospace code (system fonts)
 */
export const fontFamily = {
  display: ['Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
  headline: ['Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
  body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
};

/**
 * Font Weight Definitions
 */
export const fontWeight: Record<WeightLevel, number> = {
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

/**
 * Typography Scale
 * All sizes in rem, line heights unitless, letter spacing in em
 */

export const display: TypographyToken = {
  level: 'display',
  fontSize: 4.5, // 72px
  fontWeight: fontWeight.black,
  lineHeight: 1,
  letterSpacing: -0.02,
  fontStretch: 'condensed',
  textTransform: 'uppercase',
  mobile: {
    fontSize: 2.5, // 40px on mobile
    lineHeight: 1.1,
  },
  tablet: {
    fontSize: 3.5, // 56px on tablet
    lineHeight: 1.05,
  },
};

export const h1: TypographyToken = {
  level: 'h1',
  fontSize: 3, // 48px
  fontWeight: fontWeight.black,
  lineHeight: 1.1,
  letterSpacing: -0.015,
  fontStretch: 'condensed',
  mobile: {
    fontSize: 2, // 32px on mobile
    lineHeight: 1.2,
  },
  tablet: {
    fontSize: 2.5, // 40px on tablet
    lineHeight: 1.15,
  },
};

export const h2: TypographyToken = {
  level: 'h2',
  fontSize: 2.25, // 36px
  fontWeight: fontWeight.extrabold,
  lineHeight: 1.2,
  letterSpacing: -0.01,
  fontStretch: 'condensed',
  mobile: {
    fontSize: 1.5, // 24px on mobile
    lineHeight: 1.25,
  },
  tablet: {
    fontSize: 1.875, // 30px on tablet
  },
};

export const h3: TypographyToken = {
  level: 'h3',
  fontSize: 1.875, // 30px
  fontWeight: fontWeight.extrabold,
  lineHeight: 1.25,
  letterSpacing: -0.008,
  mobile: {
    fontSize: 1.25, // 20px on mobile
    lineHeight: 1.3,
  },
  tablet: {
    fontSize: 1.5, // 24px on tablet
  },
};

export const h4: TypographyToken = {
  level: 'h4',
  fontSize: 1.5, // 24px
  fontWeight: fontWeight.bold,
  lineHeight: 1.3,
  letterSpacing: -0.005,
  mobile: {
    fontSize: 1.125, // 18px on mobile
    lineHeight: 1.35,
  },
};

export const h5: TypographyToken = {
  level: 'h5',
  fontSize: 1.25, // 20px
  fontWeight: fontWeight.bold,
  lineHeight: 1.4,
  letterSpacing: 0,
  mobile: {
    fontSize: 1, // 16px on mobile
    lineHeight: 1.45,
  },
};

export const h6: TypographyToken = {
  level: 'h6',
  fontSize: 1.125, // 18px
  fontWeight: fontWeight.semibold,
  lineHeight: 1.45,
  letterSpacing: 0,
  mobile: {
    fontSize: 0.875, // 14px on mobile
    lineHeight: 1.5,
  },
};

export const bodyLg: TypographyToken = {
  level: 'body-lg',
  fontSize: 1.125, // 18px
  fontWeight: fontWeight.regular,
  lineHeight: 1.75,
  letterSpacing: 0,
  mobile: {
    fontSize: 1, // 16px on mobile
    lineHeight: 1.7,
  },
};

export const body: TypographyToken = {
  level: 'body',
  fontSize: 1, // 16px
  fontWeight: fontWeight.regular,
  lineHeight: 1.7,
  letterSpacing: 0,
  mobile: {
    fontSize: 0.875, // 14px on mobile
    lineHeight: 1.65,
  },
};

export const bodySm: TypographyToken = {
  level: 'body-sm',
  fontSize: 0.875, // 14px
  fontWeight: fontWeight.regular,
  lineHeight: 1.65,
  letterSpacing: 0,
  mobile: {
    fontSize: 0.8125, // 13px on mobile
  },
};

export const label: TypographyToken = {
  level: 'label',
  fontSize: 0.875, // 14px
  fontWeight: fontWeight.medium,
  lineHeight: 1.5,
  letterSpacing: 0.01,
  mobile: {
    fontSize: 0.8125, // 13px on mobile
  },
};

export const caption: TypographyToken = {
  level: 'caption',
  fontSize: 0.75, // 12px
  fontWeight: fontWeight.regular,
  lineHeight: 1.5,
  letterSpacing: 0.015,
  mobile: {
    fontSize: 0.6875, // 11px on mobile
  },
};

export const overline: TypographyToken = {
  level: 'overline',
  fontSize: 0.75, // 12px
  fontWeight: fontWeight.semibold,
  lineHeight: 1.5,
  letterSpacing: 0.1,
  textTransform: 'uppercase',
  mobile: {
    fontSize: 0.6875, // 11px on mobile
  },
};

/**
 * Typography token collection
 */
export const typographyTokens: Record<TypographyLevel, TypographyToken> = {
  display,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  'body-lg': bodyLg,
  body,
  'body-sm': bodySm,
  label,
  caption,
  overline,
};

/**
 * Font size scale (quick reference)
 */
export const fontSize: Record<TypographyLevel, string> = {
  display: '4.5rem',
  h1: '3rem',
  h2: '2.25rem',
  h3: '1.875rem',
  h4: '1.5rem',
  h5: '1.25rem',
  h6: '1.125rem',
  'body-lg': '1.125rem',
  body: '1rem',
  'body-sm': '0.875rem',
  label: '0.875rem',
  caption: '0.75rem',
  overline: '0.75rem',
};

/**
 * Line height scale (quick reference)
 */
export const lineHeight: Record<TypographyLevel, number> = {
  display: 1,
  h1: 1.1,
  h2: 1.2,
  h3: 1.25,
  h4: 1.3,
  h5: 1.4,
  h6: 1.45,
  'body-lg': 1.75,
  body: 1.7,
  'body-sm': 1.65,
  label: 1.5,
  caption: 1.5,
  overline: 1.5,
};

/**
 * Letter spacing scale (quick reference)
 */
export const letterSpacing: Record<TypographyLevel, string> = {
  display: '-0.02em',
  h1: '-0.015em',
  h2: '-0.01em',
  h3: '-0.008em',
  h4: '-0.005em',
  h5: '0em',
  h6: '0em',
  'body-lg': '0em',
  body: '0em',
  'body-sm': '0em',
  label: '0.01em',
  caption: '0.015em',
  overline: '0.1em',
};
