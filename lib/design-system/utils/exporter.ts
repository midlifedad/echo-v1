/**
 * Token Exporter
 *
 * Exports design tokens to various formats (JSON, CSS, Tailwind, TypeScript).
 */

import type {
  TokenCollection,
  TokenExportFormat,
  ExportOptions,
  DesignToken,
} from '../types';

/**
 * Export to JSON format
 */
function exportToJSON(collection: TokenCollection, options: ExportOptions): string {
  const data: any = {
    tokens: {},
  };

  if (options.includeMetadata) {
    data.meta = collection.meta;
  }

  if (options.categories) {
    // Filter by categories
    for (const category of options.categories) {
      if (category === 'color') data.tokens.colors = collection.tokens.colors;
      if (category === 'typography') data.tokens.typography = collection.tokens.typography;
      if (category === 'spacing') data.tokens.spacing = collection.tokens.spacing;
      if (category === 'border') data.tokens.borders = collection.tokens.borders;
      if (category === 'shadow') data.tokens.shadows = collection.tokens.shadows;
      if (category === 'transition') data.tokens.transitions = collection.tokens.transitions;
    }
  } else {
    data.tokens = collection.tokens;
  }

  if (options.includeValidation) {
    data.validation = collection.validation;
  }

  const indent = options.minify ? 0 : (options.indent ?? 2);
  return JSON.stringify(data, null, indent);
}

/**
 * Export to CSS custom properties
 */
function exportToCSS(collection: TokenCollection, options: ExportOptions): string {
  const lines: string[] = [];

  lines.push(':root {');

  // Export colors
  if (!options.categories || options.categories.includes('color')) {
    const colors = collection.tokens.colors || [];
    for (const token of colors) {
      const cssVar = token.cssVar || `--color-${token.id}`;
      lines.push(`  ${cssVar}: ${token.value};`);
    }
  }

  // Export typography
  if (!options.categories || options.categories.includes('typography')) {
    const typography = collection.tokens.typography || [];
    for (const token of typography) {
      const cssVar = token.cssVar || `--typography-${token.id}`;
      lines.push(`  ${cssVar}: ${token.value};`);
    }
  }

  // Export spacing
  if (!options.categories || options.categories.includes('spacing')) {
    const spacing = collection.tokens.spacing || [];
    for (const token of spacing) {
      const cssVar = token.cssVar || `--spacing-${token.id}`;
      lines.push(`  ${cssVar}: ${token.value};`);
    }
  }

  // Export shadows
  if (!options.categories || options.categories.includes('shadow')) {
    const shadows = collection.tokens.shadows || [];
    for (const token of shadows) {
      const cssVar = token.cssVar || `--shadow-${token.id}`;
      lines.push(`  ${cssVar}: ${token.value};`);
    }
  }

  // Export transitions
  if (!options.categories || options.categories.includes('transition')) {
    const transitions = collection.tokens.transitions || [];
    for (const token of transitions) {
      const cssVar = token.cssVar || `--transition-${token.id}`;
      lines.push(`  ${cssVar}: ${token.value};`);
    }
  }

  lines.push('}');

  if (options.includeMetadata) {
    lines.unshift(`/* Generated: ${collection.meta.generatedAt} */`);
    lines.unshift(`/* Version: ${collection.meta.version} */`);
  }

  return lines.join(options.minify ? '' : '\n');
}

/**
 * Export to Tailwind config format
 */
function exportToTailwind(collection: TokenCollection, options: ExportOptions): string {
  const config: any = {
    theme: {
      extend: {},
    },
  };

  // Export colors
  if (!options.categories || options.categories.includes('color')) {
    const colors = collection.tokens.colors || [];
    const colorObj: any = {};
    for (const token of colors) {
      colorObj[token.id] = token.value;
    }
    config.theme.extend.colors = colorObj;
  }

  // Export spacing
  if (!options.categories || options.categories.includes('spacing')) {
    const spacing = collection.tokens.spacing || [];
    const spacingObj: any = {};
    for (const token of spacing) {
      spacingObj[token.id] = token.value;
    }
    config.theme.extend.spacing = spacingObj;
  }

  // Export border radius
  if (!options.categories || options.categories.includes('border')) {
    const borders = collection.tokens.borders || [];
    const borderObj: any = {};
    for (const token of borders) {
      borderObj[token.id] = token.value;
    }
    config.theme.extend.borderRadius = borderObj;
  }

  // Export shadows
  if (!options.categories || options.categories.includes('shadow')) {
    const shadows = collection.tokens.shadows || [];
    const shadowObj: any = {};
    for (const token of shadows) {
      shadowObj[token.id] = token.value;
    }
    config.theme.extend.boxShadow = shadowObj;
  }

  const indent = options.minify ? 0 : (options.indent ?? 2);
  let output = JSON.stringify(config, null, indent);

  // Add export statement
  output = `module.exports = ${output};`;

  if (options.includeMetadata) {
    output = `/* Generated: ${collection.meta.generatedAt} */\n/* Version: ${collection.meta.version} */\n\n${output}`;
  }

  return output;
}

/**
 * Export to TypeScript constants
 */
function exportToTypeScript(collection: TokenCollection, options: ExportOptions): string {
  const lines: string[] = [];

  if (options.includeMetadata) {
    lines.push('/**');
    lines.push(` * Design Tokens`);
    lines.push(` * Generated: ${collection.meta.generatedAt}`);
    lines.push(` * Version: ${collection.meta.version}`);
    lines.push(' */');
    lines.push('');
  }

  // Export colors
  if (!options.categories || options.categories.includes('color')) {
    lines.push('export const colors = {');
    const colors = collection.tokens.colors || [];
    for (const token of colors) {
      lines.push(`  '${token.id}': '${token.value}',`);
    }
    lines.push('} as const;');
    lines.push('');
  }

  // Export typography
  if (!options.categories || options.categories.includes('typography')) {
    lines.push('export const typography = {');
    const typography = collection.tokens.typography || [];
    for (const token of typography) {
      lines.push(`  '${token.id}': '${token.value}',`);
    }
    lines.push('} as const;');
    lines.push('');
  }

  // Export spacing
  if (!options.categories || options.categories.includes('spacing')) {
    lines.push('export const spacing = {');
    const spacing = collection.tokens.spacing || [];
    for (const token of spacing) {
      lines.push(`  '${token.id}': '${token.value}',`);
    }
    lines.push('} as const;');
    lines.push('');
  }

  return lines.join(options.minify ? '' : '\n');
}

/**
 * Export to SCSS variables
 */
function exportToSCSS(collection: TokenCollection, options: ExportOptions): string {
  const lines: string[] = [];

  if (options.includeMetadata) {
    lines.push(`// Generated: ${collection.meta.generatedAt}`);
    lines.push(`// Version: ${collection.meta.version}`);
    lines.push('');
  }

  // Export colors
  if (!options.categories || options.categories.includes('color')) {
    const colors = collection.tokens.colors || [];
    for (const token of colors) {
      lines.push(`$color-${token.id}: ${token.value};`);
    }
    lines.push('');
  }

  // Export spacing
  if (!options.categories || options.categories.includes('spacing')) {
    const spacing = collection.tokens.spacing || [];
    for (const token of spacing) {
      lines.push(`$spacing-${token.id}: ${token.value};`);
    }
    lines.push('');
  }

  return lines.join(options.minify ? '' : '\n');
}

/**
 * Export to Figma tokens format
 */
function exportToFigma(collection: TokenCollection, options: ExportOptions): string {
  const figmaTokens: any = {};

  // Figma uses a specific JSON structure
  // This is a simplified version
  if (!options.categories || options.categories.includes('color')) {
    figmaTokens.colors = {};
    const colors = collection.tokens.colors || [];
    for (const token of colors) {
      figmaTokens.colors[token.id] = {
        value: token.value,
        type: 'color',
      };
    }
  }

  if (!options.categories || options.categories.includes('spacing')) {
    figmaTokens.spacing = {};
    const spacing = collection.tokens.spacing || [];
    for (const token of spacing) {
      figmaTokens.spacing[token.id] = {
        value: token.value,
        type: 'dimension',
      };
    }
  }

  const indent = options.minify ? 0 : (options.indent ?? 2);
  return JSON.stringify(figmaTokens, null, indent);
}

/**
 * Main export function
 */
export function exportTokens(
  collection: TokenCollection,
  format: TokenExportFormat,
  options: ExportOptions = {}
): string {
  // Set default options
  const opts: ExportOptions = {
    includeMetadata: options.includeMetadata ?? true,
    includeValidation: options.includeValidation ?? false,
    indent: options.indent ?? 2,
    minify: options.minify ?? false,
    categories: options.categories,
    templatePath: options.templatePath,
  };

  switch (format) {
    case 'json':
      return exportToJSON(collection, opts);
    case 'css':
      return exportToCSS(collection, opts);
    case 'tailwind':
      return exportToTailwind(collection, opts);
    case 'typescript':
      return exportToTypeScript(collection, opts);
    case 'scss':
      return exportToSCSS(collection, opts);
    case 'figma':
      return exportToFigma(collection, opts);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Token exporter instance
 */
export const tokenExporter = {
  export: exportTokens,
};

export default tokenExporter;
