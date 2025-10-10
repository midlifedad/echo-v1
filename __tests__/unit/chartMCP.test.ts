/**
 * Unit Tests: Chart-MCP Request Formatting
 * Tests request building and response transformation
 */

import { describe, it, expect, jest } from '@jest/globals';

describe('Chart-MCP Request Formatting', () => {
  
  describe('Request Building', () => {
    it('should build intent-only request', () => {
      const request = buildChartRequest({
        intent: 'Show monthly sales trends',
        mode: 'intent-only'
      });

      expect(request).toEqual({
        intent: {
          description: 'Show monthly sales trends',
          mode: 'intent-only'
        }
      });
    });

    it('should build intent+data request', () => {
      const dataset = {
        columns: [
          { name: 'Month', dataType: 'string' },
          { name: 'Sales', dataType: 'number' }
        ],
        statistics: { rowCount: 12, columnCount: 2 },
        data: [['Jan', 1000], ['Feb', 1200]]
      };

      const request = buildChartRequest({
        intent: 'Visualize sales data',
        mode: 'intent+data',
        dataset
      });

      expect(request).toEqual({
        intent: {
          description: 'Visualize sales data',
          mode: 'intent+data'
        },
        dataProfile: {
          schema: [
            { name: 'Month', type: 'string' },
            { name: 'Sales', type: 'number' }
          ],
          rowCount: 12,
          samples: [['Jan', 1000], ['Feb', 1200]]
        },
        data: [['Jan', 1000], ['Feb', 1200]]
      });
    });

    it('should include preferences', () => {
      const request = buildChartRequest({
        intent: 'Create chart',
        mode: 'intent-only',
        preferences: {
          audience: 'exec',
          impressiveness: 'stunning',
          colorBlindSafe: true
        }
      });

      expect(request.preferences).toEqual({
        audience: 'exec',
        impressiveness: 'stunning',
        colorBlindSafe: true
      });
    });

    it('should include constraints', () => {
      const request = buildChartRequest({
        intent: 'Create chart',
        mode: 'intent-only',
        constraints: {
          maxSeries: 5,
          maxCategories: 20,
          smallScreen: true
        }
      });

      expect(request.constraints).toEqual({
        maxSeries: 5,
        maxCategories: 20,
        smallScreen: true
      });
    });
  });

  describe('Data Type Mapping', () => {
    it('should map dataset column types to Chart-MCP types', () => {
      const columns = [
        { dataType: 'string' },
        { dataType: 'number' },
        { dataType: 'date' },
        { dataType: 'datetime' },
        { dataType: 'boolean' },
        { dataType: 'unknown' }
      ];

      const mapped = columns.map(col => mapToChartMCPType(col.dataType));

      expect(mapped).toEqual([
        'string',
        'number',
        'datetime',
        'datetime',
        'boolean',
        'string'
      ]);
    });
  });

  describe('Response Transformation', () => {
    it('should transform Chart-MCP response to internal format', () => {
      const mcpResponse = {
        recommended: {
          index: 0,
          chartType: 'line',
          config: { chart: { type: 'line' } },
          imageUrl: '/images/chart1.png',
          reason: 'Best for time series'
        },
        alternatives: [
          {
            index: 1,
            chartType: 'column',
            config: { chart: { type: 'column' } },
            imageUrl: '/images/chart2.png',
            reason: 'Good for comparisons'
          }
        ],
        ranking: [
          { index: 0, score: 0.95, reason: 'Highest score' },
          { index: 1, score: 0.85, reason: 'Second choice' }
        ],
        diagnostics: {
          timings: { totalMs: 150 }
        }
      };

      const transformed = transformResponse(mcpResponse);

      expect(transformed).toEqual({
        recommended: {
          id: 'chart-0',
          chartType: 'line',
          confidence: 0.95,
          rationale: 'Best for time series',
          config: { chart: { type: 'line' } }
        },
        alternatives: [
          {
            id: 'chart-1',
            chartType: 'column',
            confidence: 0.85,
            rationale: 'Good for comparisons',
            config: { chart: { type: 'column' } }
          }
        ],
        processingTime: 150
      });
    });

    it('should handle optimized chart data', () => {
      const mcpResponse = {
        recommended: {
          index: 0,
          chartType: 'line',
          config: { chart: { type: 'line' } },
          imageUrl: '/images/chart1.png',
          reason: 'Best choice',
          optimized: {
            config: { chart: { type: 'spline' } },
            imageUrl: '/images/optimized.png',
            improvements: [
              'Smoother curves',
              'Better color palette',
              'Improved labels'
            ]
          }
        },
        alternatives: [],
        diagnostics: { timings: { totalMs: 200 } }
      };

      const transformed = transformResponse(mcpResponse);

      expect(transformed.recommended.insights).toEqual([
        'Smoother curves',
        'Better color palette',
        'Improved labels'
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should provide fallback for service unavailable', () => {
      const fallback = getFallbackRecommendations('column');

      expect(fallback).toEqual({
        recommended: {
          id: expect.any(String),
          chartType: 'column',
          confidence: 0.6,
          rationale: expect.stringContaining('fallback'),
          config: expect.objectContaining({
            chart: { type: 'column' }
          })
        },
        alternatives: expect.arrayContaining([
          expect.objectContaining({ chartType: 'line' }),
          expect.objectContaining({ chartType: 'bar' })
        ])
      });
    });

    it('should validate request parameters', () => {
      const invalid = [
        { intent: '' }, // Empty intent
        { mode: 'invalid' }, // Invalid mode
        { dataset: null, mode: 'intent+data' } // Missing data
      ];

      invalid.forEach(params => {
        expect(() => validateRequest(params)).toThrow();
      });
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      const request1 = {
        intent: { description: 'Test', mode: 'intent-only' },
        preferences: { audience: 'exec' }
      };

      const request2 = {
        intent: { description: 'Test', mode: 'intent-only' },
        preferences: { audience: 'exec' }
      };

      const key1 = generateCacheKey(request1);
      const key2 = generateCacheKey(request2);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different requests', () => {
      const request1 = {
        intent: { description: 'Test 1', mode: 'intent-only' }
      };

      const request2 = {
        intent: { description: 'Test 2', mode: 'intent-only' }
      };

      const key1 = generateCacheKey(request1);
      const key2 = generateCacheKey(request2);

      expect(key1).not.toBe(key2);
    });
  });
});

// Helper functions for tests
function buildChartRequest(params: any) {
  const request: any = {
    intent: {
      description: params.intent,
      mode: params.mode
    }
  };

  if (params.dataset && params.mode === 'intent+data') {
    request.dataProfile = {
      schema: params.dataset.columns.map((col: any) => ({
        name: col.name,
        type: mapToChartMCPType(col.dataType)
      })),
      rowCount: params.dataset.statistics.rowCount,
      samples: params.dataset.data
    };
    request.data = params.dataset.data;
  }

  if (params.preferences) {
    request.preferences = params.preferences;
  }

  if (params.constraints) {
    request.constraints = params.constraints;
  }

  return request;
}

function mapToChartMCPType(dataType: string): string {
  switch (dataType) {
    case 'date':
    case 'datetime':
      return 'datetime';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'string';
  }
}

function transformResponse(mcpResponse: any) {
  const ranking = mcpResponse.ranking || [];
  const scores = Object.fromEntries(ranking.map((r: any) => [r.index, r.score]));

  const transform = (option: any) => ({
    id: `chart-${option.index}`,
    chartType: option.chartType,
    confidence: scores[option.index] || 0.8,
    rationale: option.reason,
    config: option.config,
    insights: option.optimized?.improvements
  });

  return {
    recommended: transform(mcpResponse.recommended),
    alternatives: mcpResponse.alternatives.map(transform),
    processingTime: mcpResponse.diagnostics?.timings?.totalMs
  };
}

function getFallbackRecommendations(preferredType: string) {
  return {
    recommended: {
      id: 'fallback-1',
      chartType: preferredType,
      confidence: 0.6,
      rationale: 'Basic fallback recommendation',
      config: { chart: { type: preferredType } }
    },
    alternatives: [
      {
        id: 'fallback-2',
        chartType: 'line',
        confidence: 0.5,
        config: { chart: { type: 'line' } }
      },
      {
        id: 'fallback-3',
        chartType: 'bar',
        confidence: 0.4,
        config: { chart: { type: 'bar' } }
      }
    ]
  };
}

function validateRequest(params: any) {
  if (!params.intent || params.intent === '') {
    throw new Error('Intent is required');
  }

  if (params.mode && !['intent-only', 'intent+data'].includes(params.mode)) {
    throw new Error('Invalid mode');
  }

  if (params.mode === 'intent+data' && !params.dataset) {
    throw new Error('Dataset required for intent+data mode');
  }
}

function generateCacheKey(request: any): string {
  return JSON.stringify({
    intent: request.intent,
    preferences: request.preferences
  });
}