/**
 * Common Type Definitions
 * Single source of truth for shared types across the application
 */

/**
 * Data type classification for column values
 * Used consistently across dataset, import, and analysis features
 */
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'categorical'
  | 'mixed'
  | 'unknown';

/**
 * Column definition with metadata
 * Used for dataset schema and column analysis
 */
export interface DataColumn {
  name: string;
  dataType: DataType;
  nullable?: boolean;
  unique?: boolean;
  index?: number;
}

/**
 * Basic column statistics
 * Shared between dataset and import features
 */
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

/**
 * Column role in visualization context
 */
export type ColumnRole =
  | 'dimension'  // Categorical data for grouping
  | 'measure'    // Numeric data for calculation
  | 'time'       // Time-based data for x-axis
  | 'label'      // Text labels
  | 'id'         // Unique identifier
  | 'ignore';    // Should be excluded

/**
 * Data quality metrics
 */
export interface DataQuality {
  completeness: number;   // 0-1 percentage of non-null values
  consistency: number;    // 0-1 how consistent the data format is
  validity: number;       // 0-1 percentage of valid values
  uniqueness: number;     // 0-1 ratio of unique values
  outliers: Array<{
    index: number;
    value: unknown;
    reason: string;
  }>;
  issues: string[];
}
