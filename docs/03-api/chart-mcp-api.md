# Chart-MCP API

Integration endpoints for AI-powered chart generation via Chart-MCP.

## Overview

The Chart-MCP API provides access to AI-powered chart generation through both WebSocket (for real-time progress) and REST (for simple requests).

**Base URL**: `/api/ai-charts`

**Chart-MCP Server**: Must be running separately at `http://localhost:4000` (configurable)

## Endpoints

### Health Check

Check Chart-MCP server availability.

**Endpoint**: `GET /api/ai-charts`

**Response**:
```json
{
  "status": "ok",
  "server": "http://localhost:4000",
  "available": true,
  "version": "8.0.0"
}
```

**Error Response** (503):
```json
{
  "status": "unavailable",
  "server": "http://localhost:4000",
  "available": false,
  "error": "Chart-MCP server not available"
}
```

---

### Generate Charts

Generate charts from intent and optional data.

**Endpoint**: `POST /api/ai-charts`

**Request Body**:
```json
{
  "intent": "Show quarterly revenue trends for 2024",
  "data": {
    "columns": ["quarter", "revenue", "profit"],
    "rows": [
      ["Q1", 120000, 35000],
      ["Q2", 145000, 42000],
      ["Q3", 138000, 39000],
      ["Q4", 167000, 48000]
    ],
    "types": {
      "quarter": "dimension",
      "revenue": "measure",
      "profit": "measure"
    }
  },
  "preferences": {
    "audience": "executive",
    "impressiveness": 8,
    "colorblindSafe": true,
    "interactive": true
  },
  "constraints": {
    "maxSeries": 5,
    "maxCategories": 12,
    "smallScreen": false
  }
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intent` | string | Yes | Natural language description of desired chart |
| `data` | object | No | Dataset to visualize |
| `data.columns` | string[] | No | Column names |
| `data.rows` | any[][] | No | Data rows |
| `data.types` | object | No | Column type hints |
| `preferences` | object | No | Generation preferences |
| `preferences.audience` | string | No | Target audience: `executive`, `analyst`, `general` |
| `preferences.impressiveness` | number | No | Visual impact (1-10) |
| `preferences.colorblindSafe` | boolean | No | Use colorblind-friendly palettes |
| `preferences.interactive` | boolean | No | Enable interactivity |
| `constraints` | object | No | Technical constraints |
| `constraints.maxSeries` | number | No | Maximum data series |
| `constraints.maxCategories` | number | No | Maximum categories |
| `constraints.smallScreen` | boolean | No | Optimize for mobile |

**Response**:
```json
{
  "charts": [
    {
      "id": "chart-001",
      "type": "line",
      "title": "Quarterly Revenue and Profit Trends 2024",
      "description": "Line chart showing revenue and profit trends across quarters with clear upward trajectory",
      "config": {
        "chart": {
          "type": "line"
        },
        "title": {
          "text": "Quarterly Revenue and Profit Trends 2024"
        },
        "xAxis": {
          "categories": ["Q1", "Q2", "Q3", "Q4"]
        },
        "yAxis": {
          "title": {
            "text": "Amount ($)"
          }
        },
        "series": [
          {
            "name": "Revenue",
            "data": [120000, 145000, 138000, 167000]
          },
          {
            "name": "Profit",
            "data": [35000, 42000, 39000, 48000]
          }
        ]
      },
      "score": 95,
      "optimized": true,
      "tags": ["revenue", "profit", "trends", "quarterly"]
    },
    {
      "id": "chart-002",
      "type": "column",
      "title": "Quarterly Performance Comparison",
      "description": "Column chart for comparing revenue and profit side-by-side per quarter",
      "config": { /* Highcharts config */ },
      "score": 88,
      "optimized": false,
      "tags": ["revenue", "profit", "comparison"]
    }
  ],
  "metadata": {
    "generatedAt": "2024-10-03T12:34:56Z",
    "processingTime": 5234,
    "cached": false
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `charts` | array | Generated chart options |
| `charts[].id` | string | Unique chart identifier |
| `charts[].type` | string | Chart type (line, bar, pie, etc.) |
| `charts[].title` | string | Suggested chart title |
| `charts[].description` | string | Why this chart was recommended |
| `charts[].config` | object | Complete Highcharts configuration |
| `charts[].score` | number | Quality score (0-100) |
| `charts[].optimized` | boolean | Whether this is an optimized variant |
| `charts[].tags` | string[] | Descriptive tags |
| `metadata` | object | Generation metadata |
| `metadata.generatedAt` | string | ISO timestamp |
| `metadata.processingTime` | number | Time in milliseconds |
| `metadata.cached` | boolean | Whether result was cached |

**Error Responses**:

400 Bad Request:
```json
{
  "error": "ValidationError",
  "message": "Intent is required",
  "details": {
    "field": "intent",
    "issue": "Must be a non-empty string"
  }
}
```

503 Service Unavailable:
```json
{
  "error": "ServiceUnavailable",
  "message": "Chart-MCP server not available",
  "server": "http://localhost:4000"
}
```

---

### Get Chart Recommendations

Get chart type recommendations based on dataset.

**Endpoint**: `POST /api/ai-charts/recommend`

**Request Body**:
```json
{
  "datasetId": "dataset-123",
  "intent": "Show sales performance" // Optional
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "type": "line",
      "score": 95,
      "reason": "Time series data detected with continuous values",
      "suitable": true
    },
    {
      "type": "bar",
      "score": 88,
      "reason": "Good for comparing values across categories",
      "suitable": true
    },
    {
      "type": "scatter",
      "score": 72,
      "reason": "Can show correlation between measures",
      "suitable": true
    },
    {
      "type": "pie",
      "score": 45,
      "reason": "Multiple measures make pie charts less effective",
      "suitable": false
    }
  ],
  "dataProfile": {
    "rowCount": 4,
    "columnCount": 3,
    "measures": ["revenue", "profit"],
    "dimensions": ["quarter"],
    "timeSeries": false
  },
  "suggestions": [
    "Consider using 'quarter' column as x-axis",
    "Revenue and Profit can be shown as dual series",
    "Line or column charts work well for this data"
  ]
}
```

---

## WebSocket API

For real-time progress updates during chart generation.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:4000');

ws.onopen = () => {
  console.log('Connected to Chart-MCP');
};
```

### Generate with Progress

**Message Format** (Send):
```json
{
  "action": "generate",
  "payload": {
    "intent": "Show revenue trends",
    "data": { /* dataset */ },
    "preferences": { /* preferences */ },
    "constraints": { /* constraints */ }
  }
}
```

**Progress Events** (Receive):
```json
{
  "type": "progress",
  "stage": "planner",
  "progress": 15,
  "message": "Analyzing data structure and intent",
  "timestamp": 1696345678000
}
```

**Stages**:
1. `planner` (0-16%): Analyze intent and data
2. `compiler` (17-33%): Generate specifications
3. `renderer` (34-50%): Create chart configs
4. `ranker` (51-66%): Score and rank options
5. `beautifier` (67-83%): Enhance visuals
6. `optimizer` (84-100%): Create optimized variants

**Completion Event** (Receive):
```json
{
  "type": "complete",
  "charts": [ /* chart options */ ],
  "metadata": {
    "processingTime": 5234,
    "stages": {
      "planner": 850,
      "compiler": 1240,
      "renderer": 980,
      "ranker": 720,
      "beautifier": 890,
      "optimizer": 554
    }
  }
}
```

**Error Event** (Receive):
```json
{
  "type": "error",
  "error": "GenerationFailed",
  "message": "Unable to generate charts from provided intent",
  "details": { /* error details */ }
}
```

---

## Caching

Responses are cached for 15 minutes based on:
- Intent
- Data profile (column count, row count, types)
- Preferences
- Constraints

**Cache Key Generation**:
```typescript
const cacheKey = hash({
  intent,
  dataProfile: {
    columns: data.columns.length,
    rows: data.rows.length,
    types: data.types
  },
  preferences,
  constraints
});
```

**Cache Headers**:
```
X-Cache-Status: HIT | MISS
X-Cache-Age: 234 (seconds)
Cache-Control: private, max-age=900
```

---

## Rate Limiting

- **Rate Limit**: 20 requests per minute per client
- **Burst**: 5 requests
- **WebSocket**: Separate limit (10 concurrent connections)

**Headers**:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1696345678
```

**429 Too Many Requests**:
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests",
  "retryAfter": 45
}
```

---

## Usage Examples

### Example 1: Simple Chart Generation

```typescript
const response = await fetch('/api/ai-charts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    intent: "Show monthly sales trends"
  })
});

const { charts } = await response.json();
console.log(`Generated ${charts.length} chart options`);
```

### Example 2: Data-Driven Generation

```typescript
const response = await fetch('/api/ai-charts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    intent: "Visualize sales by region",
    data: {
      columns: ["region", "sales"],
      rows: [
        ["North", 120000],
        ["South", 98000],
        ["East", 156000],
        ["West", 134000]
      ]
    },
    preferences: {
      audience: "executive",
      impressiveness: 8
    }
  })
});

const { charts } = await response.json();
const bestChart = charts.sort((a, b) => b.score - a.score)[0];
```

### Example 3: Get Recommendations

```typescript
const response = await fetch('/api/ai-charts/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    datasetId: "dataset-123"
  })
});

const { recommendations } = await response.json();
const suitable = recommendations.filter(r => r.suitable);
```

### Example 4: WebSocket with Progress

```typescript
const ws = new WebSocket('ws://localhost:4000');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'generate',
    payload: {
      intent: "Show revenue trends",
      data: salesData
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'progress') {
    console.log(`${message.stage}: ${message.progress}%`);
    updateProgressBar(message.progress);
  } else if (message.type === 'complete') {
    console.log('Charts generated:', message.charts);
    ws.close();
  } else if (message.type === 'error') {
    console.error('Error:', message.message);
    ws.close();
  }
};
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ValidationError` | 400 | Invalid request parameters |
| `InvalidIntent` | 400 | Intent is empty or malformed |
| `InvalidData` | 400 | Data structure is invalid |
| `ServiceUnavailable` | 503 | Chart-MCP server not available |
| `GenerationFailed` | 500 | Chart generation failed |
| `TimeoutError` | 504 | Request timed out |
| `RateLimitExceeded` | 429 | Too many requests |

---

## Best Practices

1. **Use WebSocket for UX**: Real-time progress improves user experience
2. **Handle Timeouts**: Generation can take 5-10 seconds
3. **Cache Awareness**: Identical requests return immediately
4. **Error Handling**: Always handle 503 (server unavailable)
5. **Rate Limits**: Implement client-side throttling
6. **Intent Quality**: Specific intents generate better results
7. **Data Size**: Keep datasets under 10,000 rows for best performance

---

## Related Documentation

- **[../04-features/ai-chart-generation.md](../04-features/ai-chart-generation.md)**: Feature guide
- **[templates-api.md](templates-api.md)**: Templates API
- **[instances-api.md](instances-api.md)**: Instances API

---

**Last Updated**: 2025-10-03
