/**
 * Contract Test: POST /api/datasets/import
 * Tests dataset import endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('POST /api/datasets/import', () => {
  const endpoint = 'http://localhost:3000/api/datasets/import';

  it('should accept valid CSV file upload', async () => {
    const csvContent = 'Date,Product,Sales\n2024-01-01,Widget A,1500.50\n2024-01-02,Widget B,2100.00';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', 'Test Dataset');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('datasetId');
    expect(result).toHaveProperty('name', 'Test Dataset');
    expect(result).toHaveProperty('rowCount', 2);
    expect(result).toHaveProperty('columnCount', 3);
    expect(result).toHaveProperty('columns');
    expect(result).toHaveProperty('preview');
    expect(result).toHaveProperty('validationStatus');

    // Verify columns structure
    expect(result.columns).toHaveLength(3);
    expect(result.columns[0]).toHaveProperty('name');
    expect(result.columns[0]).toHaveProperty('dataType');

    // Verify preview structure
    expect(result.preview).toHaveProperty('headers');
    expect(result.preview).toHaveProperty('rows');
    expect(result.preview.rows).toHaveLength(2);
  });

  it('should reject files exceeding 5MB', async () => {
    // Create a 6MB buffer
    const largeBuffer = new ArrayBuffer(6 * 1024 * 1024);
    const file = new File([largeBuffer], 'large.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    expect(response.status).toBe(413);
    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('message');
    expect(error.message).toContain('size');
  });

  it('should handle malformed CSV gracefully', async () => {
    const malformedCSV = 'Date,Product,Sales\n2024-01-01,Widget A\n2024-01-02,Widget B,2100.00,ExtraColumn';
    const file = new File([malformedCSV], 'malformed.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('message');
  });

  it('should reject request without file', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Dataset');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.message).toContain('file');
  });

  it('should detect and report column types', async () => {
    const csvContent = `ID,Name,Active,Created,Score,Category
1,John Doe,true,2024-01-15,95.5,Premium
2,Jane Smith,false,2024-02-20,87.3,Standard`;

    const file = new File([csvContent], 'typed.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    const columns = result.columns;
    expect(columns).toHaveLength(6);

    const typeMap = columns.reduce((acc: any, col: any) => {
      acc[col.name] = col.dataType;
      return acc;
    }, {});

    expect(typeMap['ID']).toBe('number');
    expect(typeMap['Name']).toBe('string');
    expect(typeMap['Active']).toBe('boolean');
    expect(typeMap['Created']).toBe('date');
    expect(typeMap['Score']).toBe('number');
    expect(typeMap['Category']).toMatch(/category|string/);
  });

  it('should limit preview to 10 rows', async () => {
    // Generate CSV with 20 rows
    let csvContent = 'Index,Value\n';
    for (let i = 1; i <= 20; i++) {
      csvContent += `${i},${i * 100}\n`;
    }

    const file = new File([csvContent], 'twenty.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.preview.rows).toHaveLength(10);
    expect(result.rowCount).toBe(20);
  });
});