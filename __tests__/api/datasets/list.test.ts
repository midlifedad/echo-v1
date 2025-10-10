/**
 * Contract Test: GET /api/datasets
 * Tests dataset listing endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('GET /api/datasets', () => {
  const endpoint = 'http://localhost:3000/api/datasets';

  it('should return list of datasets', async () => {
    const response = await fetch(endpoint);

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('datasets');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('hasMore');

    expect(Array.isArray(result.datasets)).toBe(true);
    expect(typeof result.total).toBe('number');
    expect(typeof result.hasMore).toBe('boolean');

    // If there are datasets, verify structure
    if (result.datasets.length > 0) {
      const dataset = result.datasets[0];
      expect(dataset).toHaveProperty('id');
      expect(dataset).toHaveProperty('name');
      expect(dataset).toHaveProperty('createdAt');
      expect(dataset).toHaveProperty('rowCount');
      expect(dataset).toHaveProperty('columnCount');
      expect(dataset).toHaveProperty('size');
      expect(dataset).toHaveProperty('source');
    }
  });

  it('should support pagination parameters', async () => {
    const response = await fetch(`${endpoint}?limit=5&offset=0`);

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.datasets.length).toBeLessThanOrEqual(5);
  });

  it('should support sorting parameters', async () => {
    const response = await fetch(`${endpoint}?sortBy=createdAt&order=desc`);

    expect(response.status).toBe(200);

    const result = await response.json();

    // Verify datasets are sorted by createdAt in descending order
    if (result.datasets.length > 1) {
      for (let i = 0; i < result.datasets.length - 1; i++) {
        const date1 = new Date(result.datasets[i].createdAt);
        const date2 = new Date(result.datasets[i + 1].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    }
  });

  it('should handle invalid query parameters gracefully', async () => {
    const response = await fetch(`${endpoint}?sortBy=invalid&limit=abc`);

    // Should still return 200 with default behavior
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('datasets');
    expect(Array.isArray(result.datasets)).toBe(true);
  });

  it('should respect maximum limit constraint', async () => {
    const response = await fetch(`${endpoint}?limit=200`);

    expect(response.status).toBe(200);

    const result = await response.json();
    // Should cap at 100 as per spec
    expect(result.datasets.length).toBeLessThanOrEqual(100);
  });

  it('should filter by source type when supported', async () => {
    const response = await fetch(`${endpoint}?source=csv`);

    expect(response.status).toBe(200);

    const result = await response.json();

    // All returned datasets should have source='csv'
    result.datasets.forEach((dataset: any) => {
      if (dataset.source) {
        expect(dataset.source).toBe('csv');
      }
    });
  });

  it('should return empty array when no datasets exist', async () => {
    // This test assumes we might have no datasets
    const response = await fetch(`${endpoint}?offset=99999`);

    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result).toHaveProperty('datasets');
    expect(Array.isArray(result.datasets)).toBe(true);
    expect(result.hasMore).toBe(false);
  });
});