/**
 * Dataset type definitions
 */

import type { DataType, DataColumn, ColumnStatistics } from './common';

// Re-export common types for backward compatibility
export type { DataType, DataColumn, ColumnStatistics };

export interface DatasetMetadata {
  source: 'csv' | 'paste' | 'api' | 'manual';
  originalFileName?: string;
  mimeType?: string;
  encoding?: string;
  delimiter?: string;
  hasHeaders?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  compressed?: boolean;
  sizeBytes?: number;
}

export interface DatasetStatistics {
  rowCount: number;
  columnCount: number;
  nullCount?: number;
  duplicateRows?: number;
  numericColumns?: string[];
  categoricalColumns?: string[];
  dateColumns?: string[];
}

/**
 * Cell value types supported in datasets
 */
export type CellValue = string | number | boolean | Date | null;

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  data: CellValue[][];
  columns: DataColumn[];
  metadata: DatasetMetadata;
  statistics: DatasetStatistics;
  tags?: string[];
  version?: number;
}

export interface DatasetPreview {
  id: string;
  name: string;
  rows: CellValue[][];
  totalRows: number;
  columns: DataColumn[];
}

export interface DatasetListItem {
  id: string;
  name: string;
  description?: string;
  rowCount: number;
  columnCount: number;
  createdAt: Date;
  updatedAt: Date;
  sizeBytes?: number;
  tags?: string[];
}

export interface DataImportOptions {
  hasHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  skipRows?: number;
  maxRows?: number;
  columns?: string[];
  dateFormat?: string;
  numberFormat?: string;
}

export interface DataImportResult {
  success: boolean;
  datasetId?: string;
  dataset?: Dataset;
  preview?: DatasetPreview;
  errors?: string[];
  warnings?: string[];
}

export interface DataValidationResult {
  valid: boolean;
  errors: DataValidationError[];
  warnings: DataValidationWarning[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

export interface DataValidationError {
  row?: number;
  column?: string;
  type: 'missing_value' | 'type_mismatch' | 'format_error' | 'constraint_violation' | 'other';
  message: string;
  value?: CellValue;
}

export interface DataValidationWarning {
  row?: number;
  column?: string;
  type: 'suspicious_value' | 'possible_duplicate' | 'outlier' | 'truncated' | 'other';
  message: string;
  value?: CellValue;
}

export interface DataProfile {
  columns: ColumnProfile[];
  correlations?: CorrelationMatrix;
  patterns?: DataPattern[];
  quality: DataQualityMetrics;
}

export interface ColumnProfile {
  name: string;
  dataType: DataType;
  nullCount: number;
  uniqueCount: number;
  min?: CellValue;
  max?: CellValue;
  mean?: number;
  median?: number;
  mode?: CellValue;
  standardDeviation?: number;
  percentiles?: Record<string, number>;
  topValues?: Array<{ value: CellValue; count: number }>;
  distribution?: Array<{ bucket: string; count: number }>;
}

export interface CorrelationMatrix {
  columns: string[];
  values: number[][];
}

export interface DataPattern {
  type: 'temporal' | 'categorical' | 'numerical' | 'text';
  description: string;
  confidence: number;
  affectedColumns: string[];
}

export interface DataQualityMetrics {
  completeness: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  timeliness: number;
  accuracy: number;
  overall: number;
}

export interface StorageQuota {
  usage: number;
  quota: number;
  datasets: number;
  maxDatasets: number;
}

export interface DatasetQuery {
  search?: string;
  tags?: string[];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'rows';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DatasetExportOptions {
  format: 'csv' | 'json' | 'excel' | 'parquet';
  columns?: string[];
  rows?: { start?: number; end?: number };
  includeHeaders?: boolean;
  encoding?: string;
}