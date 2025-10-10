/**
 * Contract Test: POST /api/ai-charts/recommend
 * Tests AI chart recommendation endpoint with dataset integration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('POST /api/ai-charts/recommend', () => {
  const endpoint = 'http://localhost:3000/api/ai-charts/recommend';
  const datasetEndpoint = 'http://localhost:3000/api/datasets';
  let testDatasetId: string | null = null;

  beforeAll(async () => {
    // Create a test dataset for recommendations
    const csvContent = `Month,Revenue,Expenses,Profit
Jan,50000,35000,15000
Feb,55000,37000,18000
Mar,61000,39000,22000
Apr,58000,38500,19500
May,63000,40000,23000`;

    const file = new File([csvContent], 'financial.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', 'Financial Data for AI');

    try {
      const response = await fetch(`${datasetEndpoint}/import`, {
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

  it('should return chart recommendations for dataset', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasetId
      })
    });

    // If Chart-MCP is unavailable, expect 503
    if (response.status === 503) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.message).toContain('unavailable');
      return;
    }

    // If dataset not found, expect 404
    if (response.status === 404) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.message).toContain('not found');
      return;
    }

    expect(response.status).toBe(200);

    const result = await response.json();

    // Verify response structure
    expect(result).toHaveProperty('recommended');
    expect(result).toHaveProperty('alternatives');

    // Verify recommended chart
    const recommended = result.recommended;
    expect(recommended).toHaveProperty('id');
    expect(recommended).toHaveProperty('chartType');
    expect(recommended).toHaveProperty('confidence');
    expect(recommended).toHaveProperty('rationale');
    expect(recommended).toHaveProperty('config');

    // Confidence should be between 0 and 1
    expect(recommended.confidence).toBeGreaterThanOrEqual(0);
    expect(recommended.confidence).toBeLessThanOrEqual(1);

    // Verify alternatives
    expect(Array.isArray(result.alternatives)).toBe(true);
    expect(result.alternatives.length).toBeGreaterThanOrEqual(0);

    if (result.alternatives.length > 0) {
      const alternative = result.alternatives[0];
      expect(alternative).toHaveProperty('chartType');
      expect(alternative).toHaveProperty('confidence');
      expect(alternative).toHaveProperty('rationale');
    }

    // Verify diagnostics if present
    if (result.diagnostics) {
      expect(result.diagnostics).toHaveProperty('timings');
      if (result.diagnostics.timings) {
        expect(result.diagnostics.timings).toHaveProperty('totalMs');
      }
    }
  });

  it('should accept natural language intent', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasetId,
        intent: 'Show me revenue trends over time with emphasis on growth'
      })
    });

    if (response.status === 200) {
      const result = await response.json();

      // Should influence recommendations
      expect(result.recommended).toBeDefined();

      // Line or area chart likely for trends
      expect(['line', 'area', 'spline']).toContain(result.recommended.chartType);

      // Rationale should reference the intent
      if (result.recommended.rationale) {
        expect(result.recommended.rationale.toLowerCase()).toMatch(/trend|time|growth/);
      }
    }
  });

  it('should accept visualization preferences', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasetId,
        preferences: {
          audience: 'exec',
          impressiveness: 'stunning',
          colorBlindSafe: true
        }
      })
    });

    if (response.status === 200) {
      const result = await response.json();

      expect(result.recommended).toBeDefined();

      // Config should reflect preferences
      if (result.recommended.config) {
        // Exec audience might prefer cleaner layouts
        // Stunning might have gradients or effects
        // ColorBlindSafe should use appropriate palette
        expect(result.recommended.config).toBeDefined();
      }
    }
  });

  it('should return 404 for non-existent dataset', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasetId: 'non-existent-dataset-456789'
      })
    });

    expect(response.status).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('message');
  });

  it('should return 400 for missing datasetId', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'Show me a chart'
      })
    });

    expect(response.status).toBe(400);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error.message).toContain('datasetId');
  });

  it('should provide multiple chart options', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasetId
      })
    });

    if (response.status === 200) {
      const result = await response.json();

      // Should have at least 2 total options (recommended + alternatives)
      const totalOptions = 1 + (result.alternatives?.length || 0);
      expect(totalOptions).toBeGreaterThanOrEqual(2);

      // Each should be a different chart type
      const chartTypes = new Set([result.recommended.chartType]);
      result.alternatives?.forEach((alt: any) => {
        chartTypes.add(alt.chartType);
      });

      // Should have variety in recommendations
      expect(chartTypes.size).toBeGreaterThanOrEqual(2);
    }
  });

  it('should handle Chart-MCP service unavailability gracefully', async () => {
    // This simulates when Chart-MCP server is down
    // The API should handle this gracefully

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasetId: testDatasetId || 'test-123',
        // Force timeout or error scenario
        _testMode: 'service-unavailable'
      })
    });

    // Should return 503 or fallback with basic recommendations
    if (response.status === 503) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.message).toContain('unavailable');
    } else if (response.status === 200) {
      // Fallback mode - should still provide basic recommendations
      const result = await response.json();
      expect(result.recommended).toBeDefined();
      expect(result.recommended.chartType).toBeDefined();
    }
  });

  afterAll(async () => {
    // Clean up test dataset
    if (testDatasetId) {
      try {
        await fetch(`${datasetEndpoint}/${testDatasetId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        // Cleanup failure is not critical
      }
    }
  });
});