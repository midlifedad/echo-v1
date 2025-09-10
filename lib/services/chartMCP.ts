/**
 * Chart MCP v8 API Service
 * Handles communication with the Chart MCP server for AI-powered chart generation
 */

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

export interface ChartOption {
  index: number;
  chartType: string;
  config: any; // Highcharts configuration
  imageUrl: string;
  reason: string;
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
  stage: 'planner' | 'compiler' | 'renderer' | 'ranker' | 'pipeline';
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
    onProgress: StageEventHandler
  ): Promise<ChartMCPResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Check cache first
        const cacheKey = this.getCacheKey(request);
        const cached = this.requestCache.get(cacheKey);
        if (cached) {
          console.log('Returning cached chart response');
          resolve(cached);
          return;
        }

        // Establish WebSocket connection
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to Chart MCP server');
          
          // Send the visualization request
          this.ws?.send(JSON.stringify({
            type: 'visualize',
            request,
          }));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Call the progress handler
            onProgress(data);
            
            // Handle pipeline completion
            if (data.type === 'pipeline:complete') {
              const response = data.data as ChartMCPResponse;
              
              // Cache the response
              this.requestCache.set(cacheKey, response);
              setTimeout(() => this.requestCache.delete(cacheKey), this.cacheTimeout);
              
              // Close WebSocket
              this.closeWebSocket();
              
              resolve(response);
            } else if (data.type === 'stage:error') {
              const error = new Error(`Stage ${data.stage} failed: ${data.data?.error}`);
              this.closeWebSocket();
              reject(error);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
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
    return `${this.baseUrl}${relativePath}`;
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
}

// Export singleton instance
export const chartMCPService = new ChartMCPService();