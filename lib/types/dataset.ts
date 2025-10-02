/**
 * Dataset type definitions
 */

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'unknown';

export interface DataColumn {
  name: string;
  dataType: DataType;
  nullable?: boolean;
  unique?: boolean;
  index?: number;
}

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

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  data: any[][];
  columns: DataColumn[];
  metadata: DatasetMetadata;
  statistics: DatasetStatistics;
  tags?: string[];
  version?: number;
}

export interface DatasetPreview {
  id: string;
  name: string;
  rows: any[][];
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
  value?: any;
}

export interface DataValidationWarning {
  row?: number;
  column?: string;
  type: 'suspicious_value' | 'possible_duplicate' | 'outlier' | 'truncated' | 'other';
  message: string;
  value?: any;
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
  min?: any;
  max?: any;
  mean?: number;
  median?: number;
  mode?: any;
  standardDeviation?: number;
  percentiles?: { [key: string]: number };
  topValues?: { value: any; count: number }[];
  distribution?: { bucket: string; count: number }[];
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