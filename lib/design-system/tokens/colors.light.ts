/**
 * Light Theme Color Tokens
 *
 * Defines all color tokens for the light theme with vibrant golden/amber aesthetic.
 * All colors include RGB and HSL values for flexibility.
 */

export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export interface ColorScale {
  50: ColorValue;
  100: ColorValue;
  200: ColorValue;
  300: ColorValue;
  400: ColorValue;
  500: ColorValue;
  600: ColorValue;
  700: ColorValue;
  800: ColorValue;
  900: ColorValue;
  950: ColorValue;
}

/**
 * Primary color scale - Golden/Amber tones
 * Base: #FFD700 (Gold), #FFC700, #F5A623 (Amber)
 */
export const primary: ColorScale = {
  50: { hex: '#FFFBEB', rgb: { r: 255, g: 251, b: 235 }, hsl: { h: 48, s: 100, l: 96 } },
  100: { hex: '#FFF3C6', rgb: { r: 255, g: 243, b: 198 }, hsl: { h: 47, s: 100, l: 89 } },
  200: { hex: '#FFE68A', rgb: { r: 255, g: 230, b: 138 }, hsl: { h: 47, s: 100, l: 77 } },
  300: { hex: '#FFD84D', rgb: { r: 255, g: 216, b: 77 }, hsl: { h: 47, s: 100, l: 65 } },
  400: { hex: '#FFC700', rgb: { r: 255, g: 199, b: 0 }, hsl: { h: 47, s: 100, l: 50 } },
  500: { hex: '#FFD700', rgb: { r: 255, g: 215, b: 0 }, hsl: { h: 51, s: 100, l: 50 } },
  600: { hex: '#F5A623', rgb: { r: 245, g: 166, b: 35 }, hsl: { h: 37, s: 91, l: 55 } },
  700: { hex: '#D68910', rgb: { r: 214, g: 137, b: 16 }, hsl: { h: 37, s: 86, l: 45 } },
  800: { hex: '#B76E00', rgb: { r: 183, g: 110, b: 0 }, hsl: { h: 36, s: 100, l: 36 } },
  900: { hex: '#8F5700', rgb: { r: 143, g: 87, b: 0 }, hsl: { h: 36, s: 100, l: 28 } },
  950: { hex: '#5C3700', rgb: { r: 92, g: 55, b: 0 }, hsl: { h: 36, s: 100, l: 18 } },
};

/**
 * Secondary color scale - Orange/Coral tones
 */
export const secondary: ColorScale = {
  50: { hex: '#FFF4ED', rgb: { r: 255, g: 244, b: 237 }, hsl: { h: 23, s: 100, l: 96 } },
  100: { hex: '#FFE6D5', rgb: { r: 255, g: 230, b: 213 }, hsl: { h: 24, s: 100, l: 92 } },
  200: { hex: '#FFCAAA', rgb: { r: 255, g: 202, b: 170 }, hsl: { h: 23, s: 100, l: 83 } },
  300: { hex: '#FFA67A', rgb: { r: 255, g: 166, b: 122 }, hsl: { h: 20, s: 100, l: 74 } },
  400: { hex: '#FF8C42', rgb: { r: 255, g: 140, b: 66 }, hsl: { h: 24, s: 100, l: 63 } },
  500: { hex: '#FF6B35', rgb: { r: 255, g: 107, b: 53 }, hsl: { h: 16, s: 100, l: 60 } },
  600: { hex: '#E54D2E', rgb: { r: 229, g: 77, b: 46 }, hsl: { h: 10, s: 79, l: 54 } },
  700: { hex: '#C1381A', rgb: { r: 193, g: 56, b: 26 }, hsl: { h: 11, s: 76, l: 43 } },
  800: { hex: '#9D2B15', rgb: { r: 157, g: 43, b: 21 }, hsl: { h: 10, s: 76, l: 35 } },
  900: { hex: '#7A2412', rgb: { r: 122, g: 36, b: 18 }, hsl: { h: 10, s: 74, l: 27 } },
  950: { hex: '#4D1809', rgb: { r: 77, g: 24, b: 9 }, hsl: { h: 13, s: 79, l: 17 } },
};

/**
 * Background colors for light theme
 */
export const background = {
  default: { hex: '#FFF8E1', rgb: { r: 255, g: 248, b: 225 }, hsl: { h: 46, s: 100, l: 94 } },
  surface: { hex: '#FFF3E0', rgb: { r: 255, g: 243, b: 224 }, hsl: { h: 37, s: 100, l: 94 } },
  elevated: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
};

/**
 * Text colors for light theme
 */
export const text = {
  primary: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } },
  secondary: { hex: '#424242', rgb: { r: 66, g: 66, b: 66 }, hsl: { h: 0, s: 0, l: 26 } },
  disabled: { hex: '#9E9E9E', rgb: { r: 158, g: 158, b: 158 }, hsl: { h: 0, s: 0, l: 62 } },
  inverse: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
};

/**
 * Border colors for light theme
 */
export const border = {
  default: { hex: '#E0E0E0', rgb: { r: 224, g: 224, b: 224 }, hsl: { h: 0, s: 0, l: 88 } },
  subtle: { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } },
  strong: { hex: '#BDBDBD', rgb: { r: 189, g: 189, b: 189 }, hsl: { h: 0, s: 0, l: 74 } },
};

/**
 * Semantic color scales
 */

// Error colors (red)
export const error: ColorScale = {
  50: { hex: '#FEF2F2', rgb: { r: 254, g: 242, b: 242 }, hsl: { h: 0, s: 86, l: 97 } },
  100: { hex: '#FEE2E2', rgb: { r: 254, g: 226, b: 226 }, hsl: { h: 0, s: 93, l: 94 } },
  200: { hex: '#FECACA', rgb: { r: 254, g: 202, b: 202 }, hsl: { h: 0, s: 96, l: 89 } },
  300: { hex: '#FCA5A5', rgb: { r: 252, g: 165, b: 165 }, hsl: { h: 0, s: 94, l: 82 } },
  400: { hex: '#F87171', rgb: { r: 248, g: 113, b: 113 }, hsl: { h: 0, s: 91, l: 71 } },
  500: { hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 }, hsl: { h: 0, s: 84, l: 60 } },
  600: { hex: '#DC2626', rgb: { r: 220, g: 38, b: 38 }, hsl: { h: 0, s: 74, l: 51 } },
  700: { hex: '#B91C1C', rgb: { r: 185, g: 28, b: 28 }, hsl: { h: 0, s: 74, l: 42 } },
  800: { hex: '#991B1B', rgb: { r: 153, g: 27, b: 27 }, hsl: { h: 0, s: 70, l: 35 } },
  900: { hex: '#7F1D1D', rgb: { r: 127, g: 29, b: 29 }, hsl: { h: 0, s: 63, l: 31 } },
  950: { hex: '#450A0A', rgb: { r: 69, g: 10, b: 10 }, hsl: { h: 0, s: 75, l: 15 } },
};

// Warning colors (amber/yellow)
export const warning: ColorScale = {
  50: { hex: '#FFFBEB', rgb: { r: 255, g: 251, b: 235 }, hsl: { h: 48, s: 100, l: 96 } },
  100: { hex: '#FEF3C7', rgb: { r: 254, g: 243, b: 199 }, hsl: { h: 48, s: 96, l: 89 } },
  200: { hex: '#FDE68A', rgb: { r: 253, g: 230, b: 138 }, hsl: { h: 48, s: 96, l: 77 } },
  300: { hex: '#FCD34D', rgb: { r: 252, g: 211, b: 77 }, hsl: { h: 46, s: 96, l: 65 } },
  400: { hex: '#FBBF24', rgb: { r: 251, g: 191, b: 36 }, hsl: { h: 43, s: 96, l: 56 } },
  500: { hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 }, hsl: { h: 38, s: 92, l: 50 } },
  600: { hex: '#D97706', rgb: { r: 217, g: 119, b: 6 }, hsl: { h: 32, s: 95, l: 44 } },
  700: { hex: '#B45309', rgb: { r: 180, g: 83, b: 9 }, hsl: { h: 26, s: 90, l: 37 } },
  800: { hex: '#92400E', rgb: { r: 146, g: 64, b: 14 }, hsl: { h: 23, s: 83, l: 31 } },
  900: { hex: '#78350F', rgb: { r: 120, g: 53, b: 15 }, hsl: { h: 22, s: 78, l: 26 } },
  950: { hex: '#451A03', rgb: { r: 69, g: 26, b: 3 }, hsl: { h: 21, s: 92, l: 14 } },
};

// Success colors (green)
export const success: ColorScale = {
  50: { hex: '#F0FDF4', rgb: { r: 240, g: 253, b: 244 }, hsl: { h: 138, s: 76, l: 97 } },
  100: { hex: '#DCFCE7', rgb: { r: 220, g: 252, b: 231 }, hsl: { h: 141, s: 84, l: 93 } },
  200: { hex: '#BBF7D0', rgb: { r: 187, g: 247, b: 208 }, hsl: { h: 141, s: 79, l: 85 } },
  300: { hex: '#86EFAC', rgb: { r: 134, g: 239, b: 172 }, hsl: { h: 142, s: 77, l: 73 } },
  400: { hex: '#4ADE80', rgb: { r: 74, g: 222, b: 128 }, hsl: { h: 142, s: 71, l: 58 } },
  500: { hex: '#22C55E', rgb: { r: 34, g: 197, b: 94 }, hsl: { h: 142, s: 71, l: 45 } },
  600: { hex: '#16A34A', rgb: { r: 22, g: 163, b: 74 }, hsl: { h: 142, s: 76, l: 36 } },
  700: { hex: '#15803D', rgb: { r: 21, g: 128, b: 61 }, hsl: { h: 142, s: 72, l: 29 } },
  800: { hex: '#166534', rgb: { r: 22, g: 101, b: 52 }, hsl: { h: 143, s: 64, l: 24 } },
  900: { hex: '#14532D', rgb: { r: 20, g: 83, b: 45 }, hsl: { h: 144, s: 61, l: 20 } },
  950: { hex: '#052E16', rgb: { r: 5, g: 46, b: 22 }, hsl: { h: 145, s: 80, l: 10 } },
};

// Info colors (blue)
export const info: ColorScale = {
  50: { hex: '#EFF6FF', rgb: { r: 239, g: 246, b: 255 }, hsl: { h: 214, s: 100, l: 97 } },
  100: { hex: '#DBEAFE', rgb: { r: 219, g: 234, b: 254 }, hsl: { h: 214, s: 95, l: 93 } },
  200: { hex: '#BFDBFE', rgb: { r: 191, g: 219, b: 254 }, hsl: { h: 213, s: 97, l: 87 } },
  300: { hex: '#93C5FD', rgb: { r: 147, g: 197, b: 253 }, hsl: { h: 212, s: 96, l: 78 } },
  400: { hex: '#60A5FA', rgb: { r: 96, g: 165, b: 250 }, hsl: { h: 213, s: 94, l: 68 } },
  500: { hex: '#3B82F6', rgb: { r: 59, g: 130, b: 246 }, hsl: { h: 217, s: 91, l: 60 } },
  600: { hex: '#2563EB', rgb: { r: 37, g: 99, b: 235 }, hsl: { h: 221, s: 83, l: 53 } },
  700: { hex: '#1D4ED8', rgb: { r: 29, g: 78, b: 216 }, hsl: { h: 224, s: 76, l: 48 } },
  800: { hex: '#1E40AF', rgb: { r: 30, g: 64, b: 175 }, hsl: { h: 226, s: 71, l: 40 } },
  900: { hex: '#1E3A8A', rgb: { r: 30, g: 58, b: 138 }, hsl: { h: 224, s: 64, l: 33 } },
  950: { hex: '#172554', rgb: { r: 23, g: 37, b: 84 }, hsl: { h: 226, s: 57, l: 21 } },
};

/**
 * Complete light theme color tokens export
 */
export const lightColorTokens = {
  primary,
  secondary,
  background,
  text,
  border,
  semantic: {
    error,
    warning,
    success,
    info,
  },
};
