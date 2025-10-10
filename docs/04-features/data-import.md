# Data Import System

Complete guide to importing and visualizing data in Echo Dashboard.

## Overview

The Data Import System enables users to transform external data into dashboard visualizations through a streamlined workflow:

1. **Import** data from CSV files or clipboard
2. **Profile** and analyze data automatically
3. **Map** columns to appropriate types
4. **Generate** chart recommendations via AI
5. **Create** tiles from data

## Import Methods

### Method 1: CSV File Upload

Upload CSV files directly:

```typescript
import { CSVParser } from '@/lib/services/csvParser';
import { DatasetStorage } from '@/lib/services/datasetStorage';

// Parse CSV file
const result = await CSVParser.parse(file);

// Save to storage
const datasetId = await DatasetStorage.saveDataset({
  name: file.name,
  source: 'file',
  data: result.data,
  metadata: {
    columns: result.columns,
    rowCount: result.rowCount,
    fileSize: file.size
  }
});
```

**Supported Formats**:
- Comma-separated (`.csv`)
- Tab-separated (`.tsv`)
- UTF-8 encoding required
- Headers in first row

**File Constraints**:
- Max size: 10MB (configurable)
- Max rows: 100,000 (configurable)
- Max columns: 100

### Method 2: Paste from Clipboard

Paste data directly from spreadsheets:

```typescript
// Auto-detect delimiter
const result = await CSVParser.parseText(clipboardText, {
  autoDetectDelimiter: true,
  skipEmptyLines: true,
  trimHeaders: true
});
```

**Supported Delimiters**:
- Comma (`,`)
- Tab (`\t`)
- Semicolon (`;`)
- Pipe (`|`)

**Auto-detection** analyzes first 10 rows to determine delimiter.

### Method 3: Manual Entry

Enter data directly in the UI:

- Column-by-column entry
- Row-by-row entry
- Spreadsheet-like interface
- Validation on input

## Data Processing Pipeline

### 1. Parsing

Convert raw input to structured data:

```typescript
interface ParseResult {
  data: any[][];           // Raw data rows
  columns: string[];       // Column headers
  rowCount: number;        // Number of rows
  delimiter: string;       // Detected delimiter
  errors: ParseError[];    // Any parsing errors
}
```

**Error Handling**:
- Malformed rows are skipped
- Missing values converted to `null`
- Extra columns discarded
- Errors logged with row numbers

### 2. Column Type Detection

Automatically detect column data types:

```typescript
import { ColumnMapper } from '@/lib/services/columnMapper';

const columnTypes = await ColumnMapper.detectColumnTypes(data);

// Returns:
{
  "revenue": "measure",      // Numeric data
  "region": "dimension",     // Categorical data
  "date": "time",           // Temporal data
  "product": "dimension"
}
```

**Type Detection Rules**:

| Type | Criteria |
|------|----------|
| `measure` | >80% numeric values, continuous scale |
| `dimension` | <20 unique values OR strings |
| `time` | Date/time patterns detected |

**Detection Heuristics**:
- Numeric: Parses as float/int successfully
- Categorical: Low cardinality (<20% unique)
- Time: ISO dates, common formats (YYYY-MM-DD, etc.)
- Text: Default fallback

### 3. Data Profiling

Generate statistical profile:

```typescript
interface DataProfile {
  rowCount: number;
  columnCount: number;

  columns: {
    [name: string]: ColumnProfile;
  };

  correlations?: CorrelationMatrix;
  quality: DataQualityMetrics;
}

interface ColumnProfile {
  type: "measure" | "dimension" | "time";
  uniqueCount: number;
  nullCount: number;

  // For measures
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;

  // For dimensions
  topValues?: Array<{ value: any; count: number }>;
  cardinality?: number;
}
```

**Generated Statistics**:
- Row/column counts
- Null value counts
- Unique value counts
- Numeric statistics (min, max, mean, median, stdDev)
- Categorical top values
- Data quality score

### 4. Quality Assessment

Evaluate data quality:

```typescript
interface DataQualityMetrics {
  completeness: number;     // % non-null values (0-100)
  consistency: number;      // % values matching type (0-100)
  validity: number;         // % valid values (0-100)
  overall: number;          // Overall quality score (0-100)

  issues: Array<{
    type: "missing" | "invalid" | "inconsistent";
    column: string;
    count: number;
    severity: "low" | "medium" | "high";
  }>;
}
```

**Quality Scoring**:
- **Completeness**: Percentage of non-null values
- **Consistency**: Type uniformity within columns
- **Validity**: Value range appropriateness
- **Overall**: Weighted average of all metrics

## Storage

### IndexedDB (Client-Side)

Large datasets stored in browser:

```typescript
import { DatasetStorage } from '@/lib/services/datasetStorage';

// Save dataset
const datasetId = await DatasetStorage.saveDataset({
  name: "Sales Data Q4 2024",
  source: "file",
  data: parsedData,
  metadata: {
    columns: columnNames,
    rowCount: data.length,
    profile: dataProfile
  }
});

// Retrieve dataset
const dataset = await DatasetStorage.getDataset(datasetId);

// List all datasets
const datasets = await DatasetStorage.listDatasets();

// Delete dataset
await DatasetStorage.deleteDataset(datasetId);
```

**Storage Features**:
- Automatic compression (lz-string)
- Quota management (10MB default per dataset)
- Automatic cleanup of old datasets
- Error recovery

**Quota Limits**:
```typescript
const quota = await DatasetStorage.getQuotaUsage();

// Returns:
{
  used: 25600000,        // 25.6 MB used
  available: 50000000,   // 50 MB total
  percentage: 51.2       // 51.2% used
}
```

### Server Storage

Persistent storage on server:

```typescript
// POST /api/datasets/import
{
  name: "Dataset Name",
  data: compressedData,
  metadata: {
    columns: ["col1", "col2"],
    rowCount: 1000,
    profile: {...}
  }
}

// Stored in database with:
// - datasetId (unique identifier)
// - userId (owner)
// - createdAt, updatedAt timestamps
// - Compressed data blob
```

## Chart Recommendations

### AI-Powered Recommendations

Get chart suggestions from Chart-MCP:

```typescript
import { ChartMCPService } from '@/lib/services/chartMCP';

const recommendations = await ChartMCPService.recommendFromDataset(datasetId);

// Returns:
{
  chartTypes: [
    {
      type: "line",
      score: 95,
      reason: "Time series data detected with continuous values"
    },
    {
      type: "bar",
      score: 88,
      reason: "Good for comparing values across categories"
    },
    {
      type: "scatter",
      score: 72,
      reason: "Can show correlation between measures"
    }
  ],
  dataProfile: {...},
  suggestions: [
    "Consider using 'date' column as x-axis",
    "Revenue and Profit can be compared as dual-axis"
  ]
}
```

**Recommendation Factors**:
- Column types (measures, dimensions, time)
- Data distribution and cardinality
- Correlation between columns
- Business context from column names
- Dataset size

### Manual Chart Selection

User can override recommendations:

```typescript
const chartTypes = [
  "line", "area", "column", "bar",
  "pie", "donut", "scatter", "bubble",
  "heatmap", "treemap", "funnel"
];

// User selects chart type
const selectedType = "line";

// Generate chart with selected type
const chartConfig = await DataImportService.generateTileFromData(
  datasetId,
  selectedType
);
```

## Data Transformation

### Column Mapping

Map data columns to chart axes:

```typescript
interface ColumnMapping {
  xAxis: string;          // Column for x-axis (usually dimension or time)
  yAxis: string[];        // Columns for y-axis (measures)
  series?: string;        // Column to split into multiple series
  labels?: string;        // Column for data labels
}

// Example mapping
{
  xAxis: "month",
  yAxis: ["revenue", "profit"],
  series: "region",
  labels: "product"
}
```

### Data Aggregation

Automatic aggregation for grouped data:

```typescript
// Line chart transformer
const transformedData = await DataImportService.transformToLineData(
  dataset,
  {
    xColumn: "date",
    yColumns: ["sales", "target"],
    aggregation: "sum"  // sum, avg, min, max, count
  }
);

// Result:
{
  categories: ["Jan", "Feb", "Mar"],
  series: [
    {
      name: "Sales",
      data: [100, 120, 140]
    },
    {
      name: "Target",
      data: [110, 115, 130]
    }
  ]
}
```

**Supported Aggregations**:
- `sum` - Total values
- `avg` - Average values
- `min` - Minimum value
- `max` - Maximum value
- `count` - Count of records
- `first` - First value
- `last` - Last value

### Chart-Specific Transformations

Each chart type has custom transformer:

```typescript
// Pie chart
transformToPieData(dataset, options)
// Returns: [{ name: "A", y: 30 }, { name: "B", y: 70 }]

// Scatter chart
transformToScatterData(dataset, options)
// Returns: [{ x: 1, y: 2 }, { x: 3, y: 4 }]

// Bar chart
transformToBarData(dataset, options)
// Returns: { categories: [...], series: [...] }

// Area chart
transformToAreaData(dataset, options)
// Returns: { categories: [...], series: [...] }
```

## Tile Creation

### From Dataset to Tile

Complete workflow:

```typescript
import { DataImportService } from '@/lib/services/dataImportService';
import { TileTemplateService } from '@/lib/services/tileTemplateService';

// 1. Generate tile config from dataset
const tileConfig = await DataImportService.generateTileFromData(
  datasetId,
  chartType,
  {
    title: "Q4 Sales Performance",
    columnMapping: {
      xAxis: "month",
      yAxis: ["revenue", "profit"]
    }
  }
);

// 2. Create template in library
const template = await TileTemplateService.createTemplate({
  type: chartType,
  title: tileConfig.title,
  config: tileConfig.config,
  data: tileConfig.data,
  category: "imported",
  tags: ["data-import", "sales"]
});

// 3. Create instance in layout
const instance = await TileInstanceService.createInstanceFromTemplate(
  template.id,
  layoutId
);
```

### Auto-Generated Titles

Smart title generation from data:

```typescript
// Based on columns and chart type
generateTitle(["revenue", "profit"], "line")
// → "Revenue and Profit Over Time"

generateTitle(["sales"], "bar", { groupBy: "region" })
// → "Sales by Region"

generateTitle(["market_share"], "pie")
// → "Market Share Distribution"
```

## UI Components

### DataImportContext

React context for import workflow:

```typescript
import { useDataImport } from '@/contexts/DataImportContext';

function DataImportFlow() {
  const {
    // State
    currentStep,
    dataset,
    recommendations,

    // Actions
    uploadFile,
    pasteData,
    selectChartType,
    createTile,

    // Status
    isLoading,
    error
  } = useDataImport();

  // Multi-step workflow
  return (
    <div>
      {currentStep === 'upload' && <UploadStep />}
      {currentStep === 'preview' && <PreviewStep />}
      {currentStep === 'recommend' && <RecommendationsStep />}
      {currentStep === 'customize' && <CustomizeStep />}
      {currentStep === 'create' && <CreateStep />}
    </div>
  );
}
```

### Multi-Step Wizard

Guided import workflow:

1. **Step 1: Method Selection**
   - Choose upload CSV or paste data
   - File picker or text area

2. **Step 2: Data Preview**
   - Show parsed data in table
   - Column type detection results
   - Data quality metrics

3. **Step 3: Column Mapping**
   - Map columns to chart roles
   - Set aggregation methods
   - Preview transformations

4. **Step 4: Chart Recommendations**
   - AI-generated suggestions
   - Recommendation scores and reasons
   - Manual type selection option

5. **Step 5: Customization**
   - Chart title and description
   - Color schemes
   - Display settings

6. **Step 6: Tile Creation**
   - Save to library or add to layout
   - Template metadata (category, tags)
   - Success confirmation

## Error Handling

### Parsing Errors

```typescript
try {
  const result = await CSVParser.parse(file);
} catch (error) {
  if (error.code === 'INVALID_ENCODING') {
    // File not UTF-8
    showError('Please upload a UTF-8 encoded file');
  } else if (error.code === 'FILE_TOO_LARGE') {
    // File exceeds size limit
    showError('File must be under 10MB');
  } else if (error.code === 'NO_HEADERS') {
    // Missing header row
    showError('CSV must have headers in first row');
  }
}
```

### Storage Errors

```typescript
try {
  await DatasetStorage.saveDataset(dataset);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    // Storage quota exceeded
    const quota = await DatasetStorage.getQuotaUsage();
    showError(`Storage full: ${quota.percentage}% used`);

    // Offer cleanup
    const oldDatasets = await DatasetStorage.listDatasets({
      sortBy: 'createdAt',
      limit: 5
    });
    suggestDelete(oldDatasets);
  }
}
```

### Transformation Errors

```typescript
try {
  const data = await DataImportService.transformToLineData(dataset, options);
} catch (error) {
  if (error.code === 'INVALID_COLUMN') {
    showError(`Column "${error.column}" not found in dataset`);
  } else if (error.code === 'TYPE_MISMATCH') {
    showError(`Column "${error.column}" is not numeric`);
  }
}
```

## Performance Optimization

### Large File Handling

```typescript
// Stream processing for large files
const stream = await CSVParser.parseStream(file, {
  chunkSize: 1000,  // Process 1000 rows at a time
  onProgress: (processed, total) => {
    updateProgress((processed / total) * 100);
  }
});
```

### Data Sampling

```typescript
// Sample large datasets for preview
const sample = await DatasetStorage.getSample(datasetId, {
  rows: 100,        // First 100 rows
  method: 'head'    // head, random, or stratified
});
```

### Lazy Loading

```typescript
// Load data on demand
const pagedData = await DatasetStorage.getPage(datasetId, {
  page: 1,
  pageSize: 50
});
```

## Best Practices

### Data Preparation

1. **Clean Data First**: Remove duplicates, handle nulls
2. **Consistent Formatting**: Use consistent date/number formats
3. **Meaningful Headers**: Use descriptive column names
4. **UTF-8 Encoding**: Ensure proper file encoding
5. **Reasonable Size**: Keep files under 10MB

### Chart Selection

1. **Follow Recommendations**: AI suggestions are data-driven
2. **Consider Audience**: Different charts for different users
3. **Keep It Simple**: Simpler charts often more effective
4. **Test Responsiveness**: Preview on different screen sizes
5. **Verify Data**: Check transformed data before creating tile

### Storage Management

1. **Delete Unused**: Remove old datasets regularly
2. **Monitor Quota**: Check storage usage periodically
3. **Compress Large**: Use compression for big datasets
4. **Name Meaningfully**: Use descriptive dataset names
5. **Tag Appropriately**: Add tags for organization

## API Reference

See [datasets-api.md](../03-api/datasets-api.md) for complete API documentation.

## Related Documentation

- **[ai-chart-generation.md](ai-chart-generation.md)**: AI chart generation guide
- **[../03-api/datasets-api.md](../03-api/datasets-api.md)**: Datasets API
- **[../02-architecture/data-flow.md](../02-architecture/data-flow.md)**: Data flow architecture

---

**Last Updated**: 2025-10-03
