/**
 * Unit Tests: Data Type Inference
 * Tests automatic detection of column data types
 */

import { describe, it, expect } from '@jest/globals';

describe('Data Type Inference', () => {
  const inferDataType = (values: any[]): string => {
    if (values.length === 0) return 'unknown';
    
    const sample = values.slice(0, 100).filter(v => v != null);
    
    if (sample.every(v => typeof v === 'boolean')) {
      return 'boolean';
    }
    
    if (sample.every(v => typeof v === 'number' || !isNaN(Number(v)))) {
      return 'number';
    }
    
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/
    ];
    
    if (sample.every(v => {
      const str = String(v);
      return datePatterns.some(p => p.test(str)) && !isNaN(Date.parse(str));
    })) {
      return 'date';
    }
    
    return 'string';
  };

  describe('Number Detection', () => {
    it('should detect integers as numbers', () => {
      const values = [1, 2, 3, 4, 5];
      expect(inferDataType(values)).toBe('number');
    });

    it('should detect floats as numbers', () => {
      const values = [1.5, 2.7, 3.14, 4.0, 5.999];
      expect(inferDataType(values)).toBe('number');
    });

    it('should detect numeric strings as numbers', () => {
      const values = ['1', '2.5', '3.14', '100', '-5'];
      expect(inferDataType(values)).toBe('number');
    });

    it('should handle null values in numeric columns', () => {
      const values = [1, 2, null, 4, undefined, 6];
      expect(inferDataType(values)).toBe('number');
    });
  });

  describe('Date Detection', () => {
    it('should detect ISO date format', () => {
      const values = ['2024-01-01', '2024-02-15', '2024-03-30'];
      expect(inferDataType(values)).toBe('date');
    });

    it('should detect US date format', () => {
      const values = ['01/15/2024', '02/28/2024', '03/31/2024'];
      expect(inferDataType(values)).toBe('date');
    });

    it('should not detect invalid dates', () => {
      const values = ['2024-13-01', '2024-00-15', '2024-02-30'];
      expect(inferDataType(values)).toBe('string');
    });
  });

  describe('Boolean Detection', () => {
    it('should detect boolean values', () => {
      const values = [true, false, true, true, false];
      expect(inferDataType(values)).toBe('boolean');
    });

    it('should not detect string booleans as boolean type', () => {
      const values = ['true', 'false', 'yes', 'no'];
      expect(inferDataType(values)).toBe('string');
    });
  });

  describe('String Detection', () => {
    it('should detect mixed types as strings', () => {
      const values = ['abc', '123', 'true', '2024-01-01'];
      expect(inferDataType(values)).toBe('string');
    });

    it('should detect text as strings', () => {
      const values = ['Product A', 'Product B', 'Category 1'];
      expect(inferDataType(values)).toBe('string');
    });

    it('should handle empty strings', () => {
      const values = ['', 'text', '', 'more text'];
      expect(inferDataType(values)).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should return unknown for empty array', () => {
      expect(inferDataType([])).toBe('unknown');
    });

    it('should handle all null values', () => {
      const values = [null, null, undefined, null];
      expect(inferDataType(values)).toBe('unknown');
    });

    it('should use first 100 values for sampling', () => {
      const values = Array(200).fill(null).map((_, i) => i < 100 ? i : 'text');
      expect(inferDataType(values)).toBe('number');
    });
  });

  describe('Column Type Analysis', () => {
    it('should analyze multiple columns', () => {
      const data = [
        ['Product', 'Price', 'InStock', 'Date'],
        ['Widget A', 99.99, true, '2024-01-01'],
        ['Widget B', 149.99, false, '2024-01-02'],
        ['Widget C', 79.99, true, '2024-01-03']
      ];

      const columns = data[0];
      const rows = data.slice(1);
      
      const columnTypes = columns.map((col, index) => {
        const values = rows.map(row => row[index]);
        return {
          name: col,
          type: inferDataType(values)
        };
      });

      expect(columnTypes).toEqual([
        { name: 'Product', type: 'string' },
        { name: 'Price', type: 'number' },
        { name: 'InStock', type: 'boolean' },
        { name: 'Date', type: 'date' }
      ]);
    });
  });
});

export { inferDataType };