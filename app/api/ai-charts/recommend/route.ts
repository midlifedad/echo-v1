/**
 * API Route: POST /api/ai-charts/recommend
 * Generate AI chart recommendations for a dataset
 */

import { NextRequest, NextResponse } from 'next/server';
import { chartMCPService } from '@/lib/services/chartMCP';
import { datasetStorage } from '@/lib/services/datasetStorage';
import { Dataset } from '@/lib/types/dataset';
import { ChartRecommendationRequest } from '@/lib/types/chart-recommendations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, data, intent, preferences } = body;

    // Validate request
    if (!datasetId && !data) {
      return NextResponse.json(
        { error: 'Either datasetId or data is required' },
        { status: 400 }
      );
    }

    let dataset: Dataset | null = null;

    // Load dataset if ID provided
    if (datasetId) {
      dataset = await datasetStorage.get(datasetId);
      if (!dataset) {
        return NextResponse.json(
          { error: 'Dataset not found', message: `No dataset found with ID: ${datasetId}` },
          { status: 404 }
        );
      }
    } else if (data) {
      // Create temporary dataset from provided data
      dataset = {
        id: `temp-${Date.now()}`,
        name: 'Temporary Dataset',
        data: data,
        columns: [],
        metadata: {
          source: 'api' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        statistics: {
          rowCount: Array.isArray(data) ? data.length - 1 : 0,
          columnCount: Array.isArray(data) && data[0] ? data[0].length : 0
        }
      };
    }

    if (!dataset) {
      return NextResponse.json(
        { error: 'Failed to load or create dataset' },
        { status: 400 }
      );
    }

    // Check Chart-MCP service health
    const isHealthy = await chartMCPService.testConnection();
    if (!isHealthy) {
      // Return fallback recommendations
      return NextResponse.json({
        recommended: {
          id: 'fallback-1',
          chartType: 'column',
          confidence: 0.6,
          rationale: 'Basic chart recommendation (Chart-MCP service unavailable)',
          config: {
            chart: { type: 'column' },
            title: { text: dataset.name },
            series: []
          }
        },
        alternatives: [
          {
            id: 'fallback-2',
            chartType: 'line',
            confidence: 0.5,
            rationale: 'Alternative visualization',
            config: { chart: { type: 'line' } }
          },
          {
            id: 'fallback-3',
            chartType: 'bar',
            confidence: 0.4,
            rationale: 'Horizontal bar chart',
            config: { chart: { type: 'bar' } }
          }
        ],
        diagnostics: {
          timings: { totalMs: 0 },
          serviceAvailable: false
        }
      }, { status: 503 });
    }

    // Generate recommendations
    const recommendationRequest: Partial<ChartRecommendationRequest> = {
      dataset,
      intent,
      preferences
    };

    const recommendations = await chartMCPService.recommendFromDataset(
      dataset,
      recommendationRequest
    );

    // Store recommendations for future reference
    if (datasetId) {
      await datasetStorage.saveRecommendations(
        datasetId,
        [recommendations.recommended, ...recommendations.alternatives]
      );
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Chart recommendation error:', error);
    
    // Check if it's a Chart-MCP service error
    if (error instanceof Error && error.message.includes('Chart-MCP')) {
      return NextResponse.json(
        {
          error: 'Chart-MCP service unavailable',
          message: 'The AI chart service is temporarily unavailable. Please try again later.',
          fallbackAvailable: true
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}