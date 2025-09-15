/**
 * Data Import Types
 * Type definitions for CSV/spreadsheet data import and intelligent mapping
 */

export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'categorical' | 'mixed' | 'unknown';

export type ChartRecommendation = {
  chartType: string;
  confidence: number;
  reason: string;
  mapping: ColumnMapping;
};

export interface ColumnAnalysis {
  name: string;
  index: number;
  dataType: DataType;
  subType?: string; // e.g., 'currency', 'percentage', 'email', 'url'
  statistics?: ColumnStatistics;
  patterns?: ColumnPatterns;
  quality?: DataQuality;
  suggestions?: ColumnSuggestions;
}

export interface ColumnStatistics {
  // For numeric columns
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  sum?: number;
  
  // For all columns
  count: number;
  uniqueCount: number;
  nullCount: number;
  emptyCount: number;
  
  // For categorical columns
  mode?: string | number;
  topValues?: Array<{
    value: string | number;
    count: number;
    percentage: number;
  }>;
  
  // For date columns
  earliestDate?: Date;
  latestDate?: Date;
  dateRange?: number; // in days
}

export interface ColumnPatterns {
  isTimeSeries: boolean;
  isIdentifier: boolean;
  isCategorical: boolean;
  isNumeric: boolean;
  isCurrency: boolean;
  isPercentage: boolean;
  isEmail: boolean;
  isURL: boolean;
  isPhone: boolean;
  hasSequentialPattern: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

export interface DataQuality {
  completeness: number; // 0-1 percentage of non-null values
  consistency: number; // 0-1 how consistent the data format is
  validity: number; // 0-1 percentage of valid values
  uniqueness: number; // 0-1 ratio of unique values
  outliers: Array<{
    index: number;
    value: any;
    reason: string;
  }>;
  issues: string[];
}

export interface ColumnSuggestions {
  possibleRoles: ColumnRole[];
  recommendedTransformations: DataTransformation[];
  cleaningOperations: CleaningOperation[];
  aggregationOptions: AggregationOption[];
}

export type ColumnRole = 
  | 'dimension' // Categorical data for grouping
  | 'measure' // Numeric data for calculation
  | 'time' // Time-based data for x-axis
  | 'label' // Text labels
  | 'id' // Unique identifier
  | 'ignore'; // Should be excluded

export interface DataTransformation {
  type: 'parse_date' | 'parse_number' | 'extract' | 'split' | 'combine' | 'calculate' | 'normalize';
  description: string;
  parameters?: Record<string, any>;
}

export interface CleaningOperation {
  type: 'remove_nulls' | 'fill_nulls' | 'remove_duplicates' | 'trim' | 'standardize' | 'remove_outliers';
  description: string;
  affectedRows?: number;
}

export interface AggregationOption {
  type: 'sum' | 'average' | 'count' | 'min' | 'max' | 'median' | 'mode' | 'stddev';
  applicable: boolean;
  description: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetRole: ColumnRole;
  transformations?: DataTransformation[];
  aggregation?: AggregationOption;
  chartDataField?: 'x' | 'y' | 'z' | 'value' | 'category' | 'series' | 'size' | 'color';
}

export interface DataProfile {
  columns: ColumnAnalysis[];
  rowCount: number;
  columnCount: number;
  dataShape: DataShape;
  relationships: DataRelationship[];
  chartRecommendations: ChartRecommendation[];
  overallQuality: number; // 0-1 score
}

export type DataShape = 
  | 'time_series' // Data with time dimension
  | 'cross_sectional' // Snapshot data
  | 'hierarchical' // Parent-child relationships
  | 'matrix' // Grid/pivot structure
  | 'list' // Simple list/table
  | 'mixed'; // Multiple patterns

export interface DataRelationship {
  column1: string;
  column2: string;
  type: 'correlation' | 'causation' | 'hierarchy' | 'grouping';
  strength: number; // 0-1
  description: string;
}

export interface ImportSession {
  id: string;
  timestamp: Date;
  fileName?: string;
  source: 'file' | 'paste' | 'url';
  rawData: any[][];
  parsedData?: ParsedData;
  dataProfile?: DataProfile;
  mappings?: ColumnMapping[];
  status: 'parsing' | 'analyzing' | 'mapping' | 'complete' | 'error';
  error?: string;
}

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  delimiter: string;
  encoding: string;
  hasHeaders: boolean;
}

export interface MappingSuggestion {
  confidence: number; // 0-1
  reasoning: string;
  mapping: ColumnMapping;
  alternativeMappings?: ColumnMapping[];
}

export interface ChartMappingResult {
  chartType: string;
  mappings: ColumnMapping[];
  dataTransformations: DataTransformation[];
  preprocessedData?: any[];
  chartConfig?: any; // Highcharts config
  warnings?: string[];
}

// Pattern definitions for common column names
export const COMMON_PATTERNS = {
  TIME: {
    patterns: [/date/i, /time/i, /year/i, /month/i, /day/i, /created/i, /updated/i, /timestamp/i],
    role: 'time' as ColumnRole,
    chartField: 'x' as const
  },
  MEASURE: {
    patterns: [/amount/i, /total/i, /sum/i, /count/i, /revenue/i, /sales/i, /price/i, /cost/i, /value/i, /score/i],
    role: 'measure' as ColumnRole,
    chartField: 'y' as const
  },
  DIMENSION: {
    patterns: [/category/i, /type/i, /group/i, /class/i, /status/i, /region/i, /country/i, /department/i],
    role: 'dimension' as ColumnRole,
    chartField: 'category' as const
  },
  IDENTIFIER: {
    patterns: [/\bid\b/i, /key/i, /code/i, /number/i, /\bno\b/i],
    role: 'id' as ColumnRole,
    chartField: undefined
  },
  LABEL: {
    patterns: [/name/i, /title/i, /description/i, /label/i],
    role: 'label' as ColumnRole,
    chartField: 'category' as const
  }
};

// Data type detection patterns
export const TYPE_PATTERNS = {
  DATE: [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
  ],
  NUMBER: /^-?\d+\.?\d*$/, // Integer or decimal
  CURRENCY: /^[$€£¥]\s*[\d,]+\.?\d*$/, // Currency symbols
  PERCENTAGE: /^\d+\.?\d*\s*%$/, // Percentage
  BOOLEAN: /^(true|false|yes|no|y|n|0|1)$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^[\d\s\-\(\)\+]+$/
};

// Chart type compatibility matrix
export const CHART_COMPATIBILITY = {
  line: {
    requiredRoles: ['time', 'measure'],
    optionalRoles: ['dimension'],
    minColumns: 2,
    maxDimensions: 5
  },
  bar: {
    requiredRoles: ['dimension', 'measure'],
    optionalRoles: ['dimension'],
    minColumns: 2,
    maxDimensions: 2
  },
  pie: {
    requiredRoles: ['dimension', 'measure'],
    optionalRoles: [],
    minColumns: 2,
    maxDimensions: 1
  },
  scatter: {
    requiredRoles: ['measure', 'measure'],
    optionalRoles: ['dimension', 'measure'],
    minColumns: 2,
    maxDimensions: 1
  },
  heatmap: {
    requiredRoles: ['dimension', 'dimension', 'measure'],
    optionalRoles: [],
    minColumns: 3,
    maxDimensions: 2
  }
};