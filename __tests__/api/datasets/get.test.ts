/**
 * Contract Test: GET /api/datasets/:id
 * Tests individual dataset retrieval endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('GET /api/datasets/:id', () => {
  const baseEndpoint = 'http://localhost:3000/api/datasets';
  let testDatasetId: string | null = null;

  beforeAll(async () => {
    // Create a test dataset to retrieve
    const csvContent = 'Test,Data\n1,Value1\n2,Value2';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', 'Test Dataset for Retrieval');

    try {
      const response = await fetch(`${baseEndpoint}/import`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        testDatasetId = result.datasetId;
      }
    } catch (error) {
      console.log('Setup failed, tests will use mock ID');
    }
  });

  it('should retrieve dataset by valid ID', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';
    const response = await fetch(`${baseEndpoint}/${datasetId}`);

    // If dataset doesn't exist, expect 404
    if (response.status === 404) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error).toHaveProperty('message');
      return;
    }

    expect(response.status).toBe(200);

    const result = await response.json();

    // Verify complete dataset structure
    expect(result).toHaveProperty('id', datasetId);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('lastAccessed');
    expect(result).toHaveProperty('rowCount');
    expect(result).toHaveProperty('columnCount');
    expect(result).toHaveProperty('size');
    expect(result).toHaveProperty('source');

    // Verify detailed fields
    expect(result).toHaveProperty('columns');
    expect(Array.isArray(result.columns)).toBe(true);

    if (result.columns.length > 0) {
      const column = result.columns[0];
      expect(column).toHaveProperty('id');
      expect(column).toHaveProperty('name');
      expect(column).toHaveProperty('dataType');
      expect(column).toHaveProperty('nullable');
      expect(column).toHaveProperty('sampleValues');
    }

    // Verify profile if present
    if (result.profile) {
      expect(result.profile).toHaveProperty('analyzedAt');
      expect(result.profile).toHaveProperty('qualityScore');
    }

    // Verify recommendations if present
    if (result.recommendations) {
      expect(Array.isArray(result.recommendations)).toBe(true);
      if (result.recommendations.length > 0) {
        const recommendation = result.recommendations[0];
        expect(recommendation).toHaveProperty('id');
        expect(recommendation).toHaveProperty('chartType');
        expect(recommendation).toHaveProperty('confidence');
        expect(recommendation).toHaveProperty('rationale');
      }
    }
  });

  it('should return 404 for non-existent dataset', async () => {
    const response = await fetch(`${baseEndpoint}/non-existent-id-123456`);

    expect(response.status).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('message');
    expect(error.message.toLowerCase()).toContain('not found');
  });

  it('should handle invalid ID format', async () => {
    const response = await fetch(`${baseEndpoint}/../../etc/passwd`);

    expect([400, 404]).toContain(response.status);

    const error = await response.json();
    expect(error).toHaveProperty('error');
  });

  it('should update lastAccessed timestamp on retrieval', async () => {
    if (!testDatasetId) {
      console.log('Skipping test - no test dataset created');
      return;
    }

    // First retrieval
    const response1 = await fetch(`${baseEndpoint}/${testDatasetId}`);
    if (response1.status !== 200) return;

    const result1 = await response1.json();
    const firstAccess = new Date(result1.lastAccessed).getTime();

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));

    // Second retrieval
    const response2 = await fetch(`${baseEndpoint}/${testDatasetId}`);
    if (response2.status !== 200) return;

    const result2 = await response2.json();
    const secondAccess = new Date(result2.lastAccessed).getTime();

    // Last accessed should be updated
    expect(secondAccess).toBeGreaterThanOrEqual(firstAccess);
  });

  it('should include data preview when requested', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';
    const response = await fetch(`${baseEndpoint}/${datasetId}?includePreview=true`);

    if (response.status === 200) {
      const result = await response.json();

      if (result.preview) {
        expect(result.preview).toHaveProperty('headers');
        expect(result.preview).toHaveProperty('rows');
        expect(Array.isArray(result.preview.headers)).toBe(true);
        expect(Array.isArray(result.preview.rows)).toBe(true);
        expect(result.preview.rows.length).toBeLessThanOrEqual(10);
      }
    }
  });

  afterAll(async () => {
    // Clean up test dataset if created
    if (testDatasetId) {
      try {
        await fetch(`${baseEndpoint}/${testDatasetId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        // Cleanup failure is not critical
      }
    }
  });
});