/**
 * DOM Sanitization Utility
 * Protects against XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param dirty - Unsanitized HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe to render
 */
export function sanitizeHtml(
  dirty: string,
  options?: DOMPurify.Config
): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div'],
    ALLOWED_ATTR: ['class', 'style'],
    ALLOW_DATA_ATTR: false,
    ...options
  });
}

/**
 * Sanitize plain text - strips all HTML tags
 * @param text - Unsanitized text that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize user input for display in data tables/grids
 * Allows minimal formatting but prevents script injection
 * @param value - User input value
 * @returns Sanitized string
 */
export function sanitizeUserInput(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // For strings that look like they might contain HTML
  if (stringValue.includes('<') || stringValue.includes('>')) {
    return sanitizeText(stringValue);
  }

  return stringValue;
}

/**
 * Sanitize chart data insights and descriptions
 * Allows basic formatting tags for readability
 * @param content - Chart insight or description
 * @returns Sanitized content
 */
export function sanitizeChartContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize dataset names and descriptions
 * Strips all HTML but preserves text content
 * @param name - Dataset name or description
 * @returns Sanitized text
 */
export function sanitizeDatasetMetadata(name: string): string {
  return sanitizeText(name);
}

/**
 * Sanitize array of strings (e.g., column names, tags)
 * @param items - Array of strings to sanitize
 * @returns Array of sanitized strings
 */
export function sanitizeStringArray(items: string[]): string[] {
  return items.map(item => sanitizeText(item));
}

/**
 * Create a safe innerHTML prop object for React
 * Use only when absolutely necessary - prefer textContent when possible
 * @param html - HTML to sanitize
 * @returns Object suitable for dangerouslySetInnerHTML prop
 */
export function createSafeInnerHTML(html: string): { __html: string } {
  return {
    __html: sanitizeHtml(html)
  };
}
