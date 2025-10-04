/**
 * Spacing Tokens
 *
 * Defines spacing scale based on 4px base unit.
 * All values align with 4px grid for consistency.
 */

export type SpacingLevel = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export type SpacingUsage = 'padding' | 'margin' | 'gap' | 'width' | 'height';

export interface SpacingToken {
  level: SpacingLevel;
  value: number; // pixels
  rem: number; // rem value (base 16px)
  usage: SpacingUsage[];
}

/**
 * Spacing scale (4px base unit)
 */
export const xs: SpacingToken = {
  level: 'xs',
  value: 8, // 0.5rem
  rem: 0.5,
  usage: ['padding', 'margin', 'gap'],
};

export const sm: SpacingToken = {
  level: 'sm',
  value: 12, // 0.75rem
  rem: 0.75,
  usage: ['padding', 'margin', 'gap'],
};

export const md: SpacingToken = {
  level: 'md',
  value: 16, // 1rem
  rem: 1,
  usage: ['padding', 'margin', 'gap', 'width', 'height'],
};

export const lg: SpacingToken = {
  level: 'lg',
  value: 24, // 1.5rem
  rem: 1.5,
  usage: ['padding', 'margin', 'gap', 'width', 'height'],
};

export const xl: SpacingToken = {
  level: 'xl',
  value: 32, // 2rem
  rem: 2,
  usage: ['padding', 'margin', 'gap', 'width', 'height'],
};

export const xl2: SpacingToken = {
  level: '2xl',
  value: 48, // 3rem
  rem: 3,
  usage: ['padding', 'margin', 'gap', 'width', 'height'],
};

export const xl3: SpacingToken = {
  level: '3xl',
  value: 64, // 4rem
  rem: 4,
  usage: ['padding', 'margin', 'width', 'height'],
};

export const xl4: SpacingToken = {
  level: '4xl',
  value: 96, // 6rem
  rem: 6,
  usage: ['padding', 'margin', 'width', 'height'],
};

/**
 * Complete spacing token collection
 */
export const spacingTokens: Record<SpacingLevel, SpacingToken> = {
  xs,
  sm,
  md,
  lg,
  xl,
  '2xl': xl2,
  '3xl': xl3,
  '4xl': xl4,
};

/**
 * Quick reference - pixel values
 */
export const spacingPx: Record<SpacingLevel, number> = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

/**
 * Quick reference - rem values
 */
export const spacingRem: Record<SpacingLevel, string> = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};
