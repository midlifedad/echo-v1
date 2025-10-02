/**
 * Chart recommendation type definitions
 */

import { Dataset } from './dataset';

export type ChartType = 
  | 'line' | 'spline' | 'area' | 'areaspline'
  | 'column' | 'bar' | 'pie' | 'donut'
  | 'scatter' | 'bubble' | 'heatmap'
  | 'treemap' | 'sunburst' | 'sankey'
  | 'gauge' | 'solidgauge' | 'boxplot'
  | 'waterfall' | 'funnel' | 'pyramid'
  | 'polar' | 'radar' | 'timeline'
  | 'gantt' | 'networkgraph' | 'packedbubble';

export interface ChartRecommendation {
  id: string;
  chartType: ChartType;
  confidence: number;
  rationale: string;
  config: any; // Highcharts configuration
  insights?: string[];
  pros?: string[];
  cons?: string[];
  bestFor?: string[];
  dataRequirements?: DataRequirement[];
  interactivity?: InteractivityFeature[];
}

export interface DataRequirement {
  type: 'min_rows' | 'max_rows' | 'column_type' | 'data_distribution';
  description: string;
  satisfied: boolean;
}

export interface InteractivityFeature {
  name: string;
  enabled: boolean;
  description?: string;
}

export interface ChartRecommendationRequest {
  dataset?: Dataset;
  datasetId?: string;
  data?: any[][];
  intent?: string;
  preferences?: ChartPreferences;
  context?: VisualizationContext;
}

export interface ChartPreferences {
  chartTypes?: ChartType[];
  excludeTypes?: ChartType[];
  audience?: 'technical' | 'executive' | 'general';
  style?: 'minimal' | 'detailed' | 'decorative';
  colorScheme?: 'default' | 'colorblind' | 'monochrome' | 'vibrant' | 'pastel';
  impressiveness?: 'simple' | 'moderate' | 'stunning';
  animation?: boolean;
  accessibility?: boolean;
  responsive?: boolean;
  maxDataPoints?: number;
}

export interface VisualizationContext {
  purpose?: 'analysis' | 'presentation' | 'report' | 'dashboard' | 'exploration';
  industry?: string;
  department?: string;
  timeframe?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  comparisonType?: 'time-series' | 'categorical' | 'geographical' | 'hierarchical';
  dataRelationship?: 'correlation' | 'distribution' | 'composition' | 'comparison' | 'trend';
}

export interface ChartRecommendationResponse {
  recommended: ChartRecommendation;
  alternatives: ChartRecommendation[];
  dataProfile?: DataProfile;
  processingTime?: number;
  confidence?: number;
  warnings?: string[];
}

export interface DataProfile {
  rowCount: number;
  columnCount: number;
  dataTypes: { [column: string]: string };
  temporalColumns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  nullPercentage: number;
  hasTimeSeries: boolean;
  hasGeographicData: boolean;
  suggestedRelationships: DataRelationship[];
}

export interface DataRelationship {
  type: 'correlation' | 'causation' | 'hierarchy' | 'sequence';
  columns: string[];
  strength: number;
  description: string;
}

export interface ChartCustomization {
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  borderRadius?: number;
  showLegend?: boolean;
  showTooltips?: boolean;
  showDataLabels?: boolean;
  animation?: {
    enabled: boolean;
    duration?: number;
    easing?: string;
  };
}

export interface ChartInsight {
  type: 'trend' | 'outlier' | 'pattern' | 'anomaly' | 'correlation' | 'prediction';
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  affectedData: {
    columns?: string[];
    rows?: number[];
    value?: any;
  };
  recommendation?: string;
  confidence: number;
}

export interface ChartGenerationOptions {
  mode: 'auto' | 'guided' | 'manual';
  quality: 'draft' | 'standard' | 'high';
  optimization: 'speed' | 'quality' | 'balanced';
  includeInsights: boolean;
  includeInteractivity: boolean;
  includeAccessibility: boolean;
}

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  chartType: ChartType;
  thumbnail?: string;
  config: any;
  dataRequirements: DataRequirement[];
  tags: string[];
  popularity: number;
  lastUsed?: Date;
}

export interface ChartExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  width?: number;
  height?: number;
  scale?: number;
  quality?: number;
  filename?: string;
}

export interface ChartMCPError {
  code: string;
  message: string;
  details?: any;
  fallbackOptions?: ChartRecommendation[];
}

export interface ChartValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ChartPerformanceMetrics {
  renderTime: number;
  dataPoints: number;
  memoryUsage: number;
  fps?: number;
  interactive: boolean;
  optimizations: string[];
}