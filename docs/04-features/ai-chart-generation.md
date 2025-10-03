# AI Chart Generation

Guide to using AI-powered chart generation with Chart-MCP integration.

## Overview

Echo Dashboard integrates with Chart-MCP to provide AI-powered chart generation. Users can create sophisticated visualizations using natural language descriptions, with real-time progress updates showing the generation pipeline.

## Prerequisites

### Install Chart-MCP

```bash
# Global installation
npm install -g chart-mcp

# Or use npx (no installation required)
npx chart-mcp serve
```

### Start Chart-MCP Server

```bash
chart-mcp serve --port 4000

# Server starts at:
# - REST API: http://localhost:4000
# - WebSocket: ws://localhost:4000
```

## Configuration

### Dashboard Configuration

Chart-MCP settings in `lib/services/chartMCP.ts`:

```typescript
const CHART_MCP_CONFIG = {
  baseUrl: process.env.CHART_MCP_URL || 'http://localhost:4000',
  wsUrl: process.env.CHART_MCP_WS_URL || 'ws://localhost:4000',
  timeout: 30000,  // 30 seconds
  cacheMinutes: 15 // 15-minute cache
};
```

### Environment Variables (Optional)

Create `.env.local`:

```bash
CHART_MCP_URL=http://localhost:4000
CHART_MCP_WS_URL=ws://localhost:4000
```

## Architecture

### Communication Methods

The service supports two communication methods:

1. **WebSocket** (Primary):
   - Real-time progress updates
   - Streaming pipeline events
   - Preferred for UI responsiveness

2. **REST API** (Fallback):
   - Simple request/response
   - Used if WebSocket unavailable
   - Less granular progress

### Generation Pipeline

6-stage pipeline with real-time progress:

```
1. PLANNER    → Analyzes intent and data profile
2. COMPILER   → Generates chart specifications
3. RENDERER   → Creates Highcharts configurations
4. RANKER     → Scores and ranks chart options
5. BEAUTIFIER → Enhances visual aesthetics
6. OPTIMIZER  → Creates optimized variants
```

Each stage emits progress events with:
- Stage name
- Progress percentage
- Current operation
- Diagnostics (if available)

## Usage

### Method 1: Intent-Only Generation

Generate charts from natural language only:

```typescript
import { ChartMCPService } from '@/lib/services/chartMCP';

// Basic generation
const charts = await ChartMCPService.generateCharts({
  intent: "Show quarterly revenue trends for 2024",
  preferences: {
    audience: "executive",
    impressiveness: 8,
    colorblindSafe: true
  }
});

console.log(`Generated ${charts.length} chart options`);
```

**Use Case**: Quick chart creation without data.

### Method 2: Intent + Data Generation

Generate charts from description and dataset:

```typescript
const charts = await ChartMCPService.generateCharts({
  intent: "Visualize sales performance by region",
  data: {
    columns: ["region", "sales", "profit"],
    rows: [
      ["North", 120000, 35000],
      ["South", 98000, 28000],
      ["East", 156000, 42000],
      ["West", 134000, 38000]
    ]
  },
  preferences: {
    audience: "analyst",
    impressiveness: 6
  }
});
```

**Use Case**: Data-driven chart creation with context.

### Method 3: Real-time Progress (WebSocket)

Show pipeline progress to users:

```typescript
const { charts, events } = await ChartMCPService.generateChartsWithProgress({
  intent: "Compare monthly expenses across categories",
  data: expenseData,
  onProgress: (stage, progress, message) => {
    console.log(`[${stage}] ${progress}% - ${message}`);

    // Update UI
    setProgressStage(stage);
    setProgressPercent(progress);
    setProgressMessage(message);
  }
});

// Charts available when complete
console.log(`Generated ${charts.length} options`);
```

**Use Case**: Enhanced UX with real-time feedback.

### Method 4: Chart Recommendations

Get recommendations from dataset:

```typescript
import { DatasetStorage } from '@/lib/services/datasetStorage';

// Store dataset
const datasetId = await DatasetStorage.saveDataset({
  name: "Sales Data Q4",
  data: salesData
});

// Get recommendations
const recommendations = await ChartMCPService.recommendFromDataset(datasetId);

console.log(`Recommended chart types:`, recommendations.chartTypes);
```

**Use Case**: Suggest best charts for imported data.

## Request Options

### Intent (Required)

Natural language description of desired visualization:

```typescript
{
  intent: "Show revenue trends over time"
  // Or more specific:
  intent: "Create a stacked area chart showing product sales by category for Q4 2024"
}
```

**Tips**:
- Be specific about chart type if you have preference
- Mention time period if relevant
- Specify comparisons or groupings
- Include business context

### Data (Optional)

Dataset to visualize:

```typescript
{
  data: {
    columns: string[],    // Column names
    rows: any[][],        // Data rows
    types?: {             // Optional type hints
      [column: string]: "measure" | "dimension" | "time"
    }
  }
}
```

### Preferences (Optional)

Customize generation:

```typescript
{
  preferences: {
    audience: "executive" | "analyst" | "general",  // Target audience
    impressiveness: 1-10,                            // Visual impact (1=simple, 10=wow)
    colorblindSafe: boolean,                         // Colorblind-friendly palettes
    interactive: boolean                             // Enable interactivity
  }
}
```

### Constraints (Optional)

Technical limitations:

```typescript
{
  constraints: {
    maxSeries: number,          // Max data series
    maxCategories: number,      // Max category count
    smallScreen: boolean        // Optimize for mobile
  }
}
```

## Response Format

### Chart Options

Each generated chart includes:

```typescript
interface ChartOption {
  id: string;                   // Unique identifier
  type: string;                 // Chart type (line, bar, pie, etc.)
  title: string;                // Chart title
  description: string;          // Why this chart was recommended
  config: HighchartsOptions;    // Ready-to-use Highcharts config
  score: number;                // Quality score (0-100)
  optimized: boolean;           // Whether this is an optimized variant
  tags: string[];               // Descriptive tags
}
```

### Using Chart Options

```typescript
// Select best chart
const bestChart = charts.sort((a, b) => b.score - a.score)[0];

// Create tile from chart
const tileConfig = {
  type: bestChart.type,
  title: bestChart.title,
  config: bestChart.config
};

await TileTemplateService.createTemplate(tileConfig);
```

## Progress Events

### Event Structure

```typescript
interface ProgressEvent {
  stage: "planner" | "compiler" | "renderer" | "ranker" | "beautifier" | "optimizer";
  progress: number;        // 0-100
  message: string;         // Current operation
  diagnostics?: any;       // Stage-specific debug info
  timestamp: number;       // Event timestamp
}
```

### Stage Details

#### 1. PLANNER (0-16%)
- Analyzes intent
- Profiles data structure
- Determines chart requirements
- **Output**: Generation plan

#### 2. COMPILER (17-33%)
- Generates chart specifications
- Creates data transformations
- Defines visual mappings
- **Output**: Chart specs

#### 3. RENDERER (34-50%)
- Creates Highcharts configurations
- Applies data bindings
- Sets up interactions
- **Output**: Chart configs

#### 4. RANKER (51-66%)
- Scores chart options
- Ranks by quality
- Filters poor options
- **Output**: Ranked charts

#### 5. BEAUTIFIER (67-83%)
- Enhances visual design
- Optimizes colors
- Refines layouts
- **Output**: Beautified charts

#### 6. OPTIMIZER (84-100%)
- Creates optimized variants
- Performance tuning
- Final polish
- **Output**: Final chart options

## Error Handling

### Connection Errors

```typescript
try {
  const charts = await ChartMCPService.generateCharts(options);
} catch (error) {
  if (error.message.includes('Chart-MCP server not available')) {
    // Server not running
    console.error('Start Chart-MCP server: chart-mcp serve');
  } else if (error.message.includes('WebSocket connection failed')) {
    // WebSocket issue, fallback to REST
    const charts = await ChartMCPService.generateCharts(options, { useRest: true });
  }
}
```

### Timeout Handling

```typescript
const charts = await ChartMCPService.generateCharts(options, {
  timeout: 60000  // 60 seconds
});
```

### Validation Errors

Chart-MCP validates inputs and returns errors:

```typescript
{
  error: "InvalidIntent",
  message: "Intent must be a non-empty string",
  details: { field: "intent", value: "" }
}
```

## UI Integration

### React Component Example

```tsx
import { useState } from 'react';
import { ChartMCPService } from '@/lib/services/chartMCP';

function AIChartGenerator() {
  const [intent, setIntent] = useState('');
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [charts, setCharts] = useState([]);

  const generate = async () => {
    const result = await ChartMCPService.generateChartsWithProgress({
      intent,
      onProgress: (stage, percent, message) => {
        setProgress({ stage, percent, message });
      }
    });

    setCharts(result.charts);
  };

  return (
    <div>
      <input value={intent} onChange={e => setIntent(e.target.value)} />
      <button onClick={generate}>Generate</button>

      {progress.percent > 0 && (
        <div>
          <div>{progress.stage}: {progress.percent}%</div>
          <div>{progress.message}</div>
        </div>
      )}

      {charts.map(chart => (
        <ChartPreview key={chart.id} config={chart.config} />
      ))}
    </div>
  );
}
```

## Performance

### Caching

Responses are cached for 15 minutes:

```typescript
// First request: ~5-10 seconds
const charts1 = await ChartMCPService.generateCharts({ intent: "..." });

// Subsequent identical requests: ~50ms (from cache)
const charts2 = await ChartMCPService.generateCharts({ intent: "..." });
```

Cache key includes:
- Intent
- Data profile (column count, row count, types)
- Preferences
- Constraints

### Optimization Tips

1. **Be Specific**: Detailed intents generate better results faster
2. **Profile Data**: Pre-compute data statistics for large datasets
3. **Use Constraints**: Limit series/categories for complex data
4. **Cache Aggressively**: Identical requests hit cache
5. **Prefer WebSocket**: Faster and more responsive than REST

## Troubleshooting

### Server Not Running

```bash
# Check if Chart-MCP is running
curl http://localhost:4000/health

# Should return: {"status":"ok"}
```

### WebSocket Connection Failed

Check browser console:

```javascript
// Test WebSocket manually
const ws = new WebSocket('ws://localhost:4000');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.error('Error:', error);
```

### Slow Generation

- Reduce data size (sample large datasets)
- Limit max series/categories
- Use simpler chart types
- Check Chart-MCP server resources

### Poor Chart Quality

- Provide more specific intent
- Include data context in description
- Adjust impressiveness level
- Try different audience types

## Examples

### Example 1: Executive Dashboard

```typescript
const charts = await ChartMCPService.generateCharts({
  intent: "Show key performance metrics for executive review",
  data: kpiData,
  preferences: {
    audience: "executive",
    impressiveness: 9,
    colorblindSafe: true
  }
});
```

### Example 2: Analyst Report

```typescript
const charts = await ChartMCPService.generateCharts({
  intent: "Analyze sales trends and identify patterns",
  data: salesData,
  preferences: {
    audience: "analyst",
    impressiveness: 5
  },
  constraints: {
    maxSeries: 8
  }
});
```

### Example 3: Mobile Dashboard

```typescript
const charts = await ChartMCPService.generateCharts({
  intent: "Mobile-friendly revenue chart",
  data: revenueData,
  preferences: {
    audience: "general"
  },
  constraints: {
    smallScreen: true,
    maxCategories: 6
  }
});
```

## Best Practices

1. **Use Natural Language**: Write intent as you would describe to a colleague
2. **Provide Context**: Include business context and goals
3. **Show Progress**: Use WebSocket for better UX
4. **Handle Errors**: Always wrap in try/catch
5. **Cache Results**: Identical requests return immediately
6. **Test Intents**: Iterate on intent descriptions for best results
7. **Select Wisely**: Review all options before choosing

## API Reference

See [chart-mcp-api.md](../03-api/chart-mcp-api.md) for complete API documentation.

## Related Documentation

- **[data-import.md](data-import.md)**: Data import guide
- **[../03-api/chart-mcp-api.md](../03-api/chart-mcp-api.md)**: API documentation
- **[../02-architecture/tile-system.md](../02-architecture/tile-system.md)**: Tile architecture

---

**Last Updated**: 2025-10-03
