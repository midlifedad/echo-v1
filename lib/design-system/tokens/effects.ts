/**
 * Effect Tokens
 *
 * Defines visual effect tokens including border-radius, shadows, and transitions.
 * All values optimized for performance and visual consistency.
 */

export type BorderRadiusLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
export type TransitionLevel = 'fast' | 'base' | 'slow' | 'slower';

export interface BorderRadiusToken {
  level: BorderRadiusLevel;
  value: string;
}

export interface ShadowToken {
  level: ShadowLevel;
  value: string;
}

export interface TransitionToken {
  level: TransitionLevel;
  duration: number; // milliseconds
  timingFunction: string;
  value: string; // complete CSS value
}

/**
 * Border Radius Scale
 */
export const borderRadius: Record<BorderRadiusLevel, BorderRadiusToken> = {
  none: { level: 'none', value: '0' },
  sm: { level: 'sm', value: '0.25rem' }, // 4px
  md: { level: 'md', value: '0.5rem' }, // 8px
  lg: { level: 'lg', value: '0.75rem' }, // 12px
  xl: { level: 'xl', value: '1rem' }, // 16px
  '2xl': { level: '2xl', value: '1.5rem' }, // 24px
  full: { level: 'full', value: '9999px' },
};

/**
 * Shadow Scale
 * Designed for layering and depth perception
 */
export const shadows: Record<ShadowLevel, ShadowToken> = {
  none: {
    level: 'none',
    value: 'none',
  },
  sm: {
    level: 'sm',
    value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  md: {
    level: 'md',
    value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  lg: {
    level: 'lg',
    value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  xl: {
    level: 'xl',
    value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  '2xl': {
    level: '2xl',
    value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  inner: {
    level: 'inner',
    value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
};

/**
 * Transition Scale
 * All transitions use ease-in-out for smooth motion
 */
export const transitions: Record<TransitionLevel, TransitionToken> = {
  fast: {
    level: 'fast',
    duration: 150,
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    value: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  base: {
    level: 'base',
    duration: 200,
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    value: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slow: {
    level: 'slow',
    duration: 300,
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    value: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  slower: {
    level: 'slower',
    duration: 500,
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    value: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Complete effect tokens export
 */
export const effectTokens = {
  borderRadius,
  shadows,
  transitions,
};

/**
 * Quick reference exports
 */
export const borderRadiusValues: Record<BorderRadiusLevel, string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const shadowValues: Record<ShadowLevel, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const transitionValues: Record<TransitionLevel, string> = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};
