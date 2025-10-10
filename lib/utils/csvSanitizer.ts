/**
 * CSV Injection Protection Utility
 * Prevents formula injection attacks in CSV exports
 *
 * CSV injection (also known as Formula Injection) occurs when applications
 * export user-supplied data to CSV files without proper sanitization.
 * Spreadsheet applications like Excel interpret cells starting with =, +, -, @
 * as formulas, which can be exploited for code execution.
 *
 * @see https://owasp.org/www-community/attacks/CSV_Injection
 */

/**
 * Characters that can trigger formula injection in spreadsheet applications
 */
const FORMULA_CHARS = ['=', '+', '-', '@', '\t', '\r'] as const;

/**
 * Sanitize a single cell value to prevent CSV injection
 *
 * Strategy:
 * 1. Prepend single quote (') to values starting with formula characters
 * 2. Spreadsheets treat cells starting with ' as text literals
 * 3. Preserve original content while preventing formula execution
 *
 * @param value - Cell value to sanitize
 * @returns Sanitized value safe for CSV export
 */
export function sanitizeCSVCell(value: unknown): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let cellValue = String(value).trim();

  // Empty cells are safe
  if (cellValue.length === 0) {
    return '';
  }

  // Check if cell starts with a formula character
  const startsWithFormulaChar = FORMULA_CHARS.some(char =>
    cellValue.startsWith(char)
  );

  if (startsWithFormulaChar) {
    // Prepend single quote to treat as text literal
    // Excel/Google Sheets will display the content as-is without formula execution
    cellValue = `'${cellValue}`;
  }

  // Escape double quotes (required for CSV format)
  cellValue = cellValue.replace(/"/g, '""');

  // Always wrap in quotes if contains comma, newline, or double quote
  if (cellValue.includes(',') || cellValue.includes('\n') || cellValue.includes('"')) {
    cellValue = `"${cellValue}"`;
  }

  return cellValue;
}

/**
 * Sanitize an entire row of CSV data
 *
 * @param row - Array of cell values
 * @returns Array of sanitized cell values
 */
export function sanitizeCSVRow(row: unknown[]): string[] {
  return row.map(cell => sanitizeCSVCell(cell));
}

/**
 * Sanitize a complete CSV dataset
 *
 * @param data - 2D array of cell values
 * @returns 2D array of sanitized cell values
 */
export function sanitizeCSVData(data: unknown[][]): string[][] {
  return data.map(row => sanitizeCSVRow(row));
}

/**
 * Convert sanitized data to CSV string
 *
 * @param data - 2D array of cell values
 * @param options - CSV formatting options
 * @returns CSV string with injection protection
 */
export function toSafeCSV(
  data: unknown[][],
  options: {
    delimiter?: string;
    lineBreak?: string;
    includeHeaders?: boolean;
  } = {}
): string {
  const {
    delimiter = ',',
    lineBreak = '\n',
    includeHeaders = true
  } = options;

  const sanitizedData = sanitizeCSVData(data);

  return sanitizedData
    .map(row => row.join(delimiter))
    .join(lineBreak);
}

/**
 * Check if a value contains potential formula injection
 * Useful for validation/warning before export
 *
 * @param value - Value to check
 * @returns True if value could be a formula injection attempt
 */
export function isPotentialCSVInjection(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const str = String(value).trim();

  if (str.length === 0) {
    return false;
  }

  // Check if starts with formula character
  return FORMULA_CHARS.some(char => str.startsWith(char));
}

/**
 * Scan dataset for potential CSV injection attempts
 * Returns locations of suspicious cells for review
 *
 * @param data - 2D array of cell values
 * @returns Array of suspicious cell locations
 */
export function scanForCSVInjection(
  data: unknown[][]
): Array<{ row: number; col: number; value: unknown; reason: string }> {
  const suspicious: Array<{ row: number; col: number; value: unknown; reason: string }> = [];

  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (isPotentialCSVInjection(cell)) {
        const str = String(cell).trim();
        const firstChar = str[0];
        suspicious.push({
          row: rowIndex,
          col: colIndex,
          value: cell,
          reason: `Starts with formula character '${firstChar}'`
        });
      }
    });
  });

  return suspicious;
}

/**
 * Create safe CSV download with injection protection
 *
 * @param data - 2D array of cell values
 * @param filename - Filename for download
 * @param options - CSV formatting options
 */
export function downloadSafeCSV(
  data: unknown[][],
  filename: string,
  options?: {
    delimiter?: string;
    lineBreak?: string;
    includeHeaders?: boolean;
  }
): void {
  const csv = toSafeCSV(data, options);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Warning message generator for CSV injection risks
 *
 * @param count - Number of suspicious cells found
 * @returns Warning message
 */
export function getCSVInjectionWarning(count: number): string {
  if (count === 0) {
    return '';
  }

  if (count === 1) {
    return 'Warning: 1 cell contains content that starts with a formula character (=, +, -, @). This will be sanitized during export to prevent formula injection.';
  }

  return `Warning: ${count} cells contain content that starts with formula characters (=, +, -, @). These will be sanitized during export to prevent formula injection.`;
}
