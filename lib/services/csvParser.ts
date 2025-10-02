/**
 * CSV Parser Service
 * Handles parsing of CSV, TSV, and other delimited data formats
 */

import Papa from 'papaparse';
import {
  Dataset,
  DataColumn,
  DataType,
  DataImportOptions,
  DataImportResult,
  DataValidationResult
} from '@/lib/types/dataset';
import { ParsedData, ParseError } from '@/lib/types/dataImport';
import { sanitizeCellValue } from '@/lib/utils/securityValidation';
import { logger } from '@/lib/utils/logger';

interface ParseOptions {
  delimiter?: string;
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  encoding?: string;
  transformHeader?: (header: string) => string;
  transform?: (value: any, field: string) => any;
}

class CSVParser {
  /**
   * Parse CSV/TSV data string
   */
  async parse(
    data: string, 
    options: ParseOptions = {}
  ): Promise<ParsedData> {
    const {
      delimiter = ',',
      header = true,
      dynamicTyping = true,
      skipEmptyLines = true,
      transformHeader,
      transform
    } = options;

    try {
      logger.info('Starting CSV parse', { 
        dataLength: data.length,
        delimiter,
        header 
      });

      // Split into lines
      const lines = data.split(/\r?\n/);
      const errors: ParseError[] = [];
      const parsedRows: any[] = [];
      let headers: string[] = [];

      // Process headers if present
      let startLine = 0;
      if (header && lines.length > 0) {
        headers = this.parseLine(lines[0], delimiter).map(h => {
          const sanitized = sanitizeCellValue(h);
          return transformHeader ? transformHeader(sanitized) : sanitized;
        });
        startLine = 1;
      }

      // Process data rows
      for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip empty lines if requested
        if (skipEmptyLines && !line.trim()) {
          continue;
        }

        try {
          const values = this.parseLine(line, delimiter);
          
          if (header) {
            // Create object with headers as keys
            const row: Record<string, any> = {};
            headers.forEach((header, index) => {
              let value = values[index];
              
              // Sanitize value
              value = sanitizeCellValue(value);
              
              // Apply dynamic typing
              if (dynamicTyping) {
                value = this.inferType(value);
              }
              
              // Apply custom transform
              if (transform) {
                value = transform(value, header);
              }
              
              row[header] = value;
            });
            parsedRows.push(row);
          } else {
            // Return array of values
            const row = values.map(v => {
              let value = sanitizeCellValue(v);
              if (dynamicTyping) {
                value = this.inferType(value);
              }
              return value;
            });
            parsedRows.push(row);
          }
        } catch (error) {
          errors.push({
            type: 'FieldMismatch',
            code: 'PARSE_ERROR',
            message: `Error parsing line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            row: i + 1
          });
        }
      }

      logger.info('CSV parse complete', {
        rowsParsed: parsedRows.length,
        errors: errors.length
      });

      return {
        data: parsedRows,
        errors,
        meta: {
          delimiter,
          linebreak: '\n',
          aborted: false,
          truncated: false,
          fields: headers
        }
      };
    } catch (error) {
      logger.error('CSV parse failed', error);
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse a single line of CSV data
   */
  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current);
    
    return result;
  }

  /**
   * Detect the delimiter used in the data
   */
  detectDelimiter(data: string): string {
    const sample = data.split('\n').slice(0, 10).join('\n');
    const delimiters = [',', '\t', '|', ';'];
    const counts: Record<string, number> = {};
    
    for (const delimiter of delimiters) {
      const matches = sample.match(new RegExp(`\\${delimiter}`, 'g'));
      counts[delimiter] = matches ? matches.length : 0;
    }
    
    // Return delimiter with highest count
    let maxCount = 0;
    let bestDelimiter = ',';
    
    for (const [delimiter, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }
    
    logger.debug('Detected delimiter', { delimiter: bestDelimiter, counts });
    return bestDelimiter;
  }

  /**
   * Infer the type of a value
   */
  private inferType(value: string): any {
    if (!value || value === '') return null;
    
    // Check for boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Check for number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
      return num;
    }
    
    // Check for date
    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.includes('-') || value.includes('/')) {
      // Basic date format check
      return date;
    }
    
    // Return as string
    return value;
  }

  /**
   * Convert parsed data to different formats
   */
  toJSON(data: ParsedData): string {
    return JSON.stringify(data.data, null, 2);
  }

  /**
   * Convert parsed data to CSV string
   */
  toCSV(data: ParsedData, delimiter: string = ','): string {
    if (data.data.length === 0) return '';
    
    const headers = data.meta.fields || Object.keys(data.data[0]);
    const lines: string[] = [];
    
    // Add headers
    lines.push(headers.map(h => this.escapeCSVField(h, delimiter)).join(delimiter));
    
    // Add data rows
    for (const row of data.data) {
      const values = headers.map(header => {
        const value = row[header];
        return this.escapeCSVField(value, delimiter);
      });
      lines.push(values.join(delimiter));
    }
    
    return lines.join('\n');
  }

  /**
   * Escape a field for CSV output
   */
  private escapeCSVField(value: any, delimiter: string): string {
    if (value === null || value === undefined) return '';
    
    const str = String(value);
    
    // Check if escaping is needed
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      // Escape quotes by doubling them
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Parse CSV/Excel paste data with new dataset types
   */
  async parseToDataset(
    input: File | string,
    options?: DataImportOptions
  ): Promise<DataImportResult> {
    try {
      // Use Papa Parse for better compatibility
      const config: Papa.ParseConfig = {
        delimiter: options?.delimiter || (input instanceof File ? ',' : '\t'),
        header: false,
        skipEmptyLines: true,
        dynamicTyping: true
      };

      const result = await new Promise<Papa.ParseResult<any>>((resolve) => {
        if (input instanceof File) {
          Papa.parse(input, {
            ...config,
            complete: resolve
          });
        } else {
          resolve(Papa.parse(input, config));
        }
      });

      if (result.errors.length > 0) {
        return {
          success: false,
          errors: result.errors.map(e => e.message)
        };
      }

      const data = result.data;
      const hasHeaders = options?.hasHeaders ?? true;

      let headers: string[];
      let rows: any[][];

      if (hasHeaders) {
        headers = data[0].map((h: any) => String(h || '').trim() || 'Unnamed');
        rows = data.slice(1);
      } else {
        headers = Array.from({ length: data[0]?.length || 0 }, (_, i) => `Column ${i + 1}`);
        rows = data;
      }

      // Apply limits
      if (options?.maxRows) {
        rows = rows.slice(0, options.maxRows);
      }

      // Detect column types
      const columns: DataColumn[] = headers.map((header, index) => {
        const columnValues = rows.map(row => row[index]).filter(v => v != null);
        const dataType = this.detectDataType(columnValues);

        return {
          name: header,
          dataType,
          nullable: columnValues.length < rows.length,
          index
        };
      });

      // Create dataset
      const datasetId = `dataset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const dataset: Dataset = {
        id: datasetId,
        name: input instanceof File ? input.name.replace(/\.csv$/i, '') : 'Pasted Data',
        data: [headers, ...rows],
        columns,
        metadata: {
          source: input instanceof File ? 'csv' : 'paste',
          originalFileName: input instanceof File ? input.name : undefined,
          mimeType: input instanceof File ? input.type : 'text/plain',
          delimiter: config.delimiter,
          hasHeaders,
          createdAt: new Date(),
          updatedAt: new Date(),
          sizeBytes: input instanceof File ? input.size : new Blob([input]).size
        },
        statistics: {
          rowCount: rows.length,
          columnCount: headers.length,
          numericColumns: columns.filter(c => c.dataType === 'number').map(c => c.name),
          categoricalColumns: columns.filter(c => c.dataType === 'string').map(c => c.name),
          dateColumns: columns.filter(c => c.dataType === 'date').map(c => c.name)
        }
      };

      return {
        success: true,
        datasetId: dataset.id,
        dataset,
        preview: {
          id: dataset.id,
          name: dataset.name,
          rows: dataset.data.slice(0, 11),
          totalRows: dataset.statistics.rowCount,
          columns: dataset.columns
        }
      };
    } catch (error) {
      return {
        success: false,
        errors: [(error as Error).message]
      };
    }
  }

  private detectDataType(values: any[]): DataType {
    if (values.length === 0) return 'unknown';

    const sample = values.slice(0, 100);

    if (sample.every(v => typeof v === 'boolean')) {
      return 'boolean';
    }

    if (sample.every(v => typeof v === 'number' || !isNaN(Number(v)))) {
      return 'number';
    }

    if (sample.every(v => this.isValidDate(String(v)))) {
      return 'date';
    }

    return 'string';
  }

  private isValidDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime()) && (value.includes('-') || value.includes('/'));
  }
}

// Export singleton instance
export const csvParser = new CSVParser();