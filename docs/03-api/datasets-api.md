# Datasets API

RESTful API endpoints for importing, storing, and managing datasets.

## Overview

The Datasets API enables users to import data from various sources, store it persistently, and use it for chart generation.

**Base URL**: `/api/datasets`

## Endpoints

### List Datasets

Retrieve all datasets for the current user.

**Endpoint**: `GET /api/datasets`

**Query Parameters**:
- `limit` (number): Maximum results (default: 20, max: 100)
- `offset` (number): Pagination offset
- `sortBy` (string): Sort field (`createdAt`, `name`, `size`)
- `order` (string): Sort order (`asc`, `desc`)

**Response**:
```json
{
  "datasets": [
    {
      "id": "dataset-001",
      "name": "Sales Data Q4 2024",
      "source": "file",
      "rowCount": 1250,
      "columnCount": 8,
      "size": 145600,
      "createdAt": "2024-10-01T10:30:00Z",
      "updatedAt": "2024-10-01T10:30:00Z"
    },
    {
      "id": "dataset-002",
      "name": "Customer Demographics",
      "source": "paste",
      "rowCount": 450,
      "columnCount": 5,
      "size": 32100,
      "createdAt": "2024-10-02T14:20:00Z",
      "updatedAt": "2024-10-02T14:20:00Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

---

### Get Dataset

Retrieve a specific dataset by ID.

**Endpoint**: `GET /api/datasets/:id`

**Query Parameters**:
- `includeSample` (boolean): Include data sample (default: false)
- `sampleSize` (number): Sample row count (default: 100)

**Response**:
```json
{
  "id": "dataset-001",
  "name": "Sales Data Q4 2024",
  "source": "file",
  "metadata": {
    "columns": ["date", "region", "product", "sales", "profit", "quantity", "customer_type", "channel"],
    "columnTypes": {
      "date": "time",
      "region": "dimension",
      "product": "dimension",
      "sales": "measure",
      "profit": "measure",
      "quantity": "measure",
      "customer_type": "dimension",
      "channel": "dimension"
    },
    "rowCount": 1250,
    "columnCount": 8,
    "profile": {
      "rowCount": 1250,
      "columnCount": 8,
      "columns": {
        "sales": {
          "type": "measure",
          "uniqueCount": 1200,
          "nullCount": 5,
          "min": 1200,
          "max": 45000,
          "mean": 12450,
          "median": 11800,
          "stdDev": 5200
        },
        "region": {
          "type": "dimension",
          "uniqueCount": 4,
          "nullCount": 0,
          "topValues": [
            { "value": "North", "count": 350 },
            { "value": "South", "count": 310 },
            { "value": "East", "count": 320 },
            { "value": "West": "count": 270 }
          ],
          "cardinality": 4
        }
        // ... other columns
      },
      "quality": {
        "completeness": 99.6,
        "consistency": 100,
        "validity": 98.4,
        "overall": 99.3,
        "issues": [
          {
            "type": "missing",
            "column": "sales",
            "count": 5,
            "severity": "low"
          }
        ]
      }
    }
  },
  "size": 145600,
  "createdAt": "2024-10-01T10:30:00Z",
  "updatedAt": "2024-10-01T10:30:00Z"
}
```

**With Sample**:
```json
{
  "id": "dataset-001",
  "name": "Sales Data Q4 2024",
  // ... metadata ...
  "sample": {
    "columns": ["date", "region", "product", "sales", "profit"],
    "rows": [
      ["2024-10-01", "North", "Widget A", 12500, 3500],
      ["2024-10-01", "South", "Widget B", 9800, 2800],
      // ... up to sampleSize rows
    ],
    "rowCount": 100,
    "isSample": true
  }
}
```

---

### Import Dataset

Import data from CSV file or pasted text.

**Endpoint**: `POST /api/datasets/import`

**Content-Type**: `multipart/form-data` (for file) or `application/json` (for text)

**Request Body (File Upload)**:
```
file: <CSV file>
name: "Dataset Name" (optional, defaults to filename)
```

**Request Body (Paste Data)**:
```json
{
  "name": "Pasted Sales Data",
  "source": "paste",
  "data": "date,region,sales\n2024-10-01,North,12500\n2024-10-02,South,9800",
  "options": {
    "delimiter": ",",
    "hasHeaders": true,
    "skipEmptyLines": true
  }
}
```

**Response**:
```json
{
  "id": "dataset-003",
  "name": "Sales Data Q4 2024",
  "source": "file",
  "metadata": {
    "columns": ["date", "region", "sales"],
    "columnTypes": {
      "date": "time",
      "region": "dimension",
      "sales": "measure"
    },
    "rowCount": 1250,
    "columnCount": 3,
    "profile": { /* data profile */ }
  },
  "size": 42800,
  "createdAt": "2024-10-03T12:34:56Z"
}
```

**Import Options**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delimiter` | string | auto | CSV delimiter (`,`, `\t`, `;`, `\|`) |
| `hasHeaders` | boolean | true | First row contains headers |
| `skipEmptyLines` | boolean | true | Skip empty rows |
| `trimHeaders` | boolean | true | Trim whitespace from headers |
| `encoding` | string | `utf-8` | File encoding |

---

### Update Dataset

Update dataset metadata.

**Endpoint**: `PUT /api/datasets/:id`

**Request Body**:
```json
{
  "name": "Updated Dataset Name",
  "metadata": {
    "description": "Quarterly sales data with profitability analysis",
    "tags": ["sales", "q4", "2024"]
  }
}
```

**Response**:
```json
{
  "id": "dataset-001",
  "name": "Updated Dataset Name",
  "metadata": {
    "description": "Quarterly sales data with profitability analysis",
    "tags": ["sales", "q4", "2024"],
    // ... existing metadata preserved
  },
  "updatedAt": "2024-10-03T13:45:00Z"
}
```

---

### Delete Dataset

Delete a dataset.

**Endpoint**: `DELETE /api/datasets/:id`

**Response**:
```json
{
  "success": true,
  "message": "Dataset deleted successfully",
  "id": "dataset-001"
}
```

---

### Get Storage Quota

Get current storage usage and quota.

**Endpoint**: `GET /api/datasets/quota`

**Response**:
```json
{
  "used": 32145600,
  "available": 52428800,
  "total": 52428800,
  "percentage": 61.3,
  "datasets": 12,
  "averageSize": 2678800
}
```

---

### Get Dataset Sample

Get a sample of dataset rows.

**Endpoint**: `GET /api/datasets/:id/sample`

**Query Parameters**:
- `rows` (number): Number of rows (default: 100, max: 1000)
- `method` (string): Sampling method (`head`, `random`, `stratified`)
- `seed` (number): Random seed for reproducible sampling

**Response**:
```json
{
  "datasetId": "dataset-001",
  "sample": {
    "columns": ["date", "region", "sales"],
    "rows": [
      ["2024-10-01", "North", 12500],
      ["2024-10-02", "South", 9800],
      // ... sample rows
    ],
    "rowCount": 100,
    "method": "head",
    "totalRows": 1250
  }
}
```

---

### Get Column Statistics

Get detailed statistics for specific columns.

**Endpoint**: `GET /api/datasets/:id/columns/:columnName/stats`

**Response**:
```json
{
  "column": "sales",
  "type": "measure",
  "statistics": {
    "count": 1245,
    "nullCount": 5,
    "uniqueCount": 1200,
    "min": 1200,
    "max": 45000,
    "mean": 12450.5,
    "median": 11800,
    "mode": 12000,
    "stdDev": 5200.3,
    "variance": 27043129,
    "q1": 8500,
    "q3": 15800,
    "iqr": 7300,
    "outliers": [45000, 43500, 42800]
  },
  "distribution": {
    "histogram": [
      { "bin": "1000-5000", "count": 120 },
      { "bin": "5000-10000", "count": 280 },
      { "bin": "10000-15000", "count": 450 },
      { "bin": "15000-20000", "count": 320 },
      { "bin": "20000+", "count": 75 }
    ],
    "skewness": 0.45,
    "kurtosis": 2.1
  }
}
```

---

## Error Responses

### 400 Bad Request

**Invalid File Format**:
```json
{
  "error": "InvalidFormat",
  "message": "File must be CSV format",
  "details": {
    "contentType": "application/pdf",
    "expected": "text/csv"
  }
}
```

**Invalid Encoding**:
```json
{
  "error": "InvalidEncoding",
  "message": "File must be UTF-8 encoded",
  "details": {
    "detected": "ISO-8859-1"
  }
}
```

**File Too Large**:
```json
{
  "error": "FileTooLarge",
  "message": "File exceeds maximum size of 10MB",
  "details": {
    "size": 12582912,
    "maxSize": 10485760
  }
}
```

**No Headers**:
```json
{
  "error": "NoHeaders",
  "message": "CSV must have headers in first row",
  "details": {
    "firstRow": ["data", "without", "headers"]
  }
}
```

### 404 Not Found

```json
{
  "error": "NotFound",
  "message": "Dataset not found",
  "id": "dataset-nonexistent"
}
```

### 413 Payload Too Large

```json
{
  "error": "QuotaExceeded",
  "message": "Storage quota exceeded",
  "details": {
    "used": 52000000,
    "available": 52428800,
    "required": 5000000
  }
}
```

### 422 Unprocessable Entity

**Parsing Errors**:
```json
{
  "error": "ParseError",
  "message": "Failed to parse CSV file",
  "details": {
    "line": 45,
    "column": 3,
    "issue": "Unexpected number of columns"
  }
}
```

---

## Data Validation

### CSV Format Requirements

1. **Headers**: First row must contain column names
2. **Encoding**: UTF-8 required
3. **Delimiters**: Comma, tab, semicolon, or pipe
4. **Line Endings**: LF (`\n`) or CRLF (`\r\n`)
5. **Quotes**: Optional for text fields
6. **Empty Lines**: Automatically skipped

### Column Naming Rules

- Alphanumeric and underscores only
- No spaces (converted to underscores)
- No special characters
- Max length: 64 characters
- Must be unique

### Data Type Detection

Automatic type detection with confidence scores:

```json
{
  "column": "sales",
  "detectedType": "measure",
  "confidence": 0.98,
  "alternatives": [
    { "type": "dimension", "confidence": 0.02 }
  ]
}
```

---

## Rate Limiting

- **Upload**: 10 requests per minute
- **Read**: 100 requests per minute
- **Delete**: 20 requests per minute

**Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1696345678
```

---

## Storage Limits

### Per Dataset

- Max size: 10MB (compressed)
- Max rows: 100,000
- Max columns: 100

### Per User

- Total quota: 50MB (configurable)
- Max datasets: 50
- Automatic cleanup of old datasets

---

## Usage Examples

### Example 1: Upload CSV File

```typescript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('name', 'Sales Data Q4');

const response = await fetch('/api/datasets/import', {
  method: 'POST',
  body: formData
});

const dataset = await response.json();
console.log('Dataset ID:', dataset.id);
```

### Example 2: Paste Data

```typescript
const response = await fetch('/api/datasets/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Pasted Data',
    source: 'paste',
    data: pastedText,
    options: {
      delimiter: '\t',
      hasHeaders: true
    }
  })
});

const dataset = await response.json();
```

### Example 3: Get Dataset with Sample

```typescript
const response = await fetch('/api/datasets/dataset-001?includeSample=true&sampleSize=50');
const dataset = await response.json();

console.log('Columns:', dataset.metadata.columns);
console.log('Sample rows:', dataset.sample.rows);
```

### Example 4: Check Quota

```typescript
const response = await fetch('/api/datasets/quota');
const quota = await response.json();

if (quota.percentage > 80) {
  console.warn(`Storage ${quota.percentage}% full`);
}
```

### Example 5: Delete Old Datasets

```typescript
// Get all datasets sorted by creation date
const response = await fetch('/api/datasets?sortBy=createdAt&order=asc&limit=10');
const { datasets } = await response.json();

// Delete oldest
for (const dataset of datasets.slice(0, 5)) {
  await fetch(`/api/datasets/${dataset.id}`, {
    method: 'DELETE'
  });
}
```

---

## Best Practices

1. **Validate Before Upload**: Check file size and format client-side
2. **Use Samples**: Request samples instead of full datasets when possible
3. **Monitor Quota**: Check storage usage regularly
4. **Clean Up**: Delete unused datasets
5. **Meaningful Names**: Use descriptive dataset names
6. **Tag Datasets**: Add tags for organization
7. **Handle Errors**: Always check for parsing errors

---

## Related Documentation

- **[../04-features/data-import.md](../04-features/data-import.md)**: Data import guide
- **[chart-mcp-api.md](chart-mcp-api.md)**: Chart-MCP API
- **[templates-api.md](templates-api.md)**: Templates API

---

**Last Updated**: 2025-10-03
