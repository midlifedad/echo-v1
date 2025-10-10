/**
 * Chart MCP v8 API Service
 * Handles communication with the Chart MCP server for AI-powered chart generation
 */

import { Dataset, DataColumn } from '@/lib/types/dataset';
import { ChartRecommendationRequest, ChartRecommendationResponse } from '@/lib/types/chart-recommendations';

export interface ChartMCPRequest {
  intent: {
    description: string;
    mode: 'intent-only' | 'intent+data';
  };
  dataProfile?: {
    schema: Array<{
      name: string;
      type: 'string' | 'number' | 'datetime' | 'boolean';
    }>;
    rowCount: number;
    samples?: any[];
  };
  data?: any[];
  preferences?: {
    audience?: 'exec' | 'general' | 'technical';
    impressiveness?: 'clean' | 'bold' | 'stunning';
    colorBlindSafe?: boolean;
    performance?: 'quality' | 'speed';
  };
  constraints?: {
    allowPies?: boolean;
    maxSeries?: number;
    maxCategories?: number;
    smallScreen?: boolean;
  };
}

export interface OptimizedChart {
  config: any; // Optimized Highcharts configuration
  imageUrl: string;
  improvements: string[];
}

export interface ChartOption {
  index: number;
  chartType: string;
  config: any; // Highcharts configuration
  imageUrl: string;
  reason: string;
  optimized?: OptimizedChart; // Optional beautified version (Stage 5)
}

export interface ChartMCPResponse {
  recommended: ChartOption;
  alternatives: ChartOption[];
  plannerOptions: Array<{
    index: number;
    text: string;
  }>;
  ranking: Array<{
    index: number;
    score: number;
    reason: string;
  }>;
  diagnostics: {
    timings: {
      plannerMs: number;
      compileMs: number;
      renderMs: number;
      rankMs: number;
      totalMs: number;
    };
    failures: Array<{
      option: number;
      stage: string;
      error: string;
    }>;
  };
}

export interface StageEvent {
  type: 'stage:start' | 'stage:progress' | 'stage:complete' | 'stage:error' | 'pipeline:complete';
  stage: 'planner' | 'compiler' | 'renderer' | 'ranker' | 'beautifier' | 'optimizer' | 'pipeline';
  timestamp: number;
  data?: any;
  metadata?: {
    duration?: number;
  };
}

export type StageEventHandler = (event: StageEvent) => void;

class ChartMCPService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private eventHandlers: Set<StageEventHandler> = new Set();
  private requestCache: Map<string, ChartMCPResponse> = new Map();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // TODO: Make these configurable via environment variables
    this.baseUrl = process.env.NEXT_PUBLIC_CHART_MCP_URL || 'http://localhost:4000';
    this.wsUrl = process.env.NEXT_PUBLIC_CHART_MCP_WS_URL || 'ws://localhost:4000';
  }

  /**
   * Generate charts using REST API (no real-time updates)
   */
  async generateCharts(request: ChartMCPRequest): Promise<ChartMCPResponse> {
    const cacheKey = this.getCacheKey(request);
    
    // Check cache first
    const cached = this.requestCache.get(cacheKey);
    if (cached) {
      console.log('Returning cached chart response');
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v8/visualize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Chart generation failed: ${error}`);
      }

      const data: ChartMCPResponse = await response.json();
      
      // Cache the response
      this.requestCache.set(cacheKey, data);
      setTimeout(() => this.requestCache.delete(cacheKey), this.cacheTimeout);
      
      return data;
    } catch (error) {
      console.error('Chart generation error:', error);
      throw error;
    }
  }

  /**
   * Generate charts with WebSocket for real-time progress updates
   */
  async generateChartsWithProgress(
    request: ChartMCPRequest,
    onProgress: StageEventHandler,
    skipCache: boolean = true  // Skip cache by default for AI tile creation
  ): Promise<ChartMCPResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Check cache first (unless explicitly skipped)
        const cacheKey = this.getCacheKey(request);
        const cached = this.requestCache.get(cacheKey);
        if (cached && !skipCache) {
          console.log('[ChartMCP] 📦 Returning cached chart response');
          resolve(cached);
          return;
        }

        if (skipCache && cached) {
          console.log('[ChartMCP] ⏭️  Skipping cache, forcing fresh generation');
        }

        // Establish WebSocket connection
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('[ChartMCP] ✅ WebSocket connected to Chart MCP server');
          console.log('[ChartMCP] 📤 Sending visualization request:', {
            type: 'visualize',
            intent: request.intent,
            mode: request.intent.mode,
            skipCache,
            preferences: request.preferences,
            constraints: request.constraints
          });

          // Send the visualization request
          const startTime = Date.now();
          this.ws?.send(JSON.stringify({
            type: 'visualize',
            request,
          }));

          console.log('[ChartMCP] ⏱️  Request sent, waiting for MCP pipeline (~40s expected)...');
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Debug log all incoming messages
            console.log('[ChartMCP] WebSocket message received:', {
              type: data.type,
              stage: data.stage,
              hasData: !!data.data,
              timestamp: data.timestamp
            });

            // Call the progress handler
            onProgress(data);

            // Handle pipeline completion
            if (data.type === 'pipeline:complete') {
              const totalTime = data.data?.diagnostics?.timings?.totalMs || 0;
              console.log('[ChartMCP] 🎉 Pipeline complete!', {
                totalTimeMs: totalTime,
                totalTimeSec: (totalTime / 1000).toFixed(1) + 's',
                hasRecommended: !!data.data?.recommended,
                alternativesCount: data.data?.alternatives?.length || 0,
                timings: data.data?.diagnostics?.timings
              });

              const response = data.data as ChartMCPResponse;

              // Cache the response (only if not skipCache)
              if (!skipCache) {
                this.requestCache.set(cacheKey, response);
                setTimeout(() => this.requestCache.delete(cacheKey), this.cacheTimeout);
                console.log('[ChartMCP] 💾 Cached response for future use');
              } else {
                console.log('[ChartMCP] 🚫 Skipping cache storage (skipCache=true)');
              }

              // Close WebSocket
              this.closeWebSocket();

              resolve(response);
            } else if (data.type === 'stage:error') {
              console.error('[ChartMCP] Stage error:', {
                stage: data.stage,
                error: data.data?.error
              });
              const error = new Error(`Stage ${data.stage} failed: ${data.data?.error}`);
              this.closeWebSocket();
              reject(error);
            }
          } catch (error) {
            console.error('[ChartMCP] Error parsing WebSocket message:', error);
            reject(error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.closeWebSocket();
          
          // Fallback to REST API
          console.log('Falling back to REST API');
          this.generateCharts(request)
            .then(resolve)
            .catch(reject);
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.ws = null;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Close WebSocket connection
   */
  private closeWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(request: ChartMCPRequest): string {
    const key = {
      intent: request.intent,
      preferences: request.preferences,
      constraints: request.constraints,
      dataProfile: request.dataProfile?.schema,
    };
    return JSON.stringify(key);
  }

  /**
   * Get full image URL from relative path
   */
  getImageUrl(relativePath: string): string {
    // Handle paths that already start with a slash
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    const fullUrl = `${this.baseUrl}${cleanPath}`;

    console.log('[ChartMCP] getImageUrl:', {
      relativePath,
      cleanPath,
      baseUrl: this.baseUrl,
      fullUrl
    });

    return fullUrl;
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Generate chart recommendations from a dataset
   */
  async recommendFromDataset(
    dataset: Dataset,
    request?: Partial<ChartRecommendationRequest>
  ): Promise<ChartRecommendationResponse> {
    // Build data profile from dataset
    const dataProfile = {
      schema: dataset.columns.map(col => ({
        name: col.name,
        type: this.mapDataType(col.dataType)
      })),
      rowCount: dataset.statistics.rowCount,
      samples: dataset.data.slice(1, Math.min(6, dataset.data.length)) // First 5 data rows
    };

    // Prepare the request
    const mcpRequest: ChartMCPRequest = {
      intent: {
        description: request?.intent || `Create an effective visualization for ${dataset.name}`,
        mode: 'intent+data' as const
      },
      dataProfile,
      data: dataset.data,
      preferences: request?.preferences ? {
        audience: request.preferences.audience as any,
        impressiveness: request.preferences.impressiveness as any,
        colorBlindSafe: request.preferences.accessibility
      } : undefined,
      constraints: {
        maxSeries: 10,
        maxCategories: 50
      }
    };

    // Get recommendations
    const response = await this.generateCharts(mcpRequest);

    // Transform to our format
    return this.transformResponse(response, dataset);
  }

  /**
   * Map our data types to Chart-MCP types
   */
  private mapDataType(dataType: string): 'string' | 'number' | 'datetime' | 'boolean' {
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

  /**
   * Transform Chart-MCP response to our format
   */
  private transformResponse(
    mcpResponse: ChartMCPResponse,
    dataset: Dataset
  ): ChartRecommendationResponse {
    const transform = (option: ChartOption) => ({
      id: `chart-${option.index}`,
      chartType: option.chartType as any,
      confidence: (option as any).score || 0.8,
      rationale: option.reason,
      config: option.config,
      insights: option.optimized?.improvements
    });

    return {
      recommended: transform(mcpResponse.recommended),
      alternatives: mcpResponse.alternatives.map(transform),
      dataProfile: {
        rowCount: dataset.statistics.rowCount,
        columnCount: dataset.statistics.columnCount,
        dataTypes: Object.fromEntries(
          dataset.columns.map(col => [col.name, col.dataType])
        ),
        temporalColumns: dataset.statistics.dateColumns || [],
        numericColumns: dataset.statistics.numericColumns || [],
        categoricalColumns: dataset.statistics.categoricalColumns || [],
        nullPercentage: 0,
        hasTimeSeries: (dataset.statistics.dateColumns?.length || 0) > 0,
        hasGeographicData: false,
        suggestedRelationships: []
      },
      processingTime: mcpResponse.diagnostics.timings.totalMs
    };
  }

  /**
   * Test connection to Chart-MCP server
   */
  async testConnection(): Promise<boolean> {
    return this.checkHealth();
  }
}

// Export singleton instance
export const chartMCPService = new ChartMCPService();