# Tile Schemas

## Overview
Tiles are the fundamental content units of the dashboard system. Each tile represents a discrete piece of content that can be positioned, styled, and configured independently.

## Base Tile Schema

All tiles share this base structure:

```typescript
interface BaseTile {
  id: string;                    // Unique identifier
  type: TileType;                 // Tile type identifier
  title: string;                  // Display title
  name?: string;                  // User-friendly name for library/reuse
  description?: string;           // Purpose/content description
  category?: string;              // Organizational category
  tags?: string[];               // Searchable tags
  isTemplate: boolean;           // Pre-built template flag
  isPublic: boolean;             // Sharing permission
  thumbnail?: string;            // Preview image (base64 or URL)
  ownerId?: string;              // Creator identifier
  usageCount: number;            // Popularity metric
  config: TileConfig;            // Type-specific configuration
  data?: Record<string, any>;   // Static data (charts)
  content?: TileContent;         // Type-specific content
  dataSource?: DataSource;       // Dynamic data configuration
  createdAt: Date;
  updatedAt: Date;
}
```

## Tile Types

### Text Tile
**Type:** `'text'`

**Purpose:** Display formatted text content with rich formatting capabilities.

**Schema:**
```typescript
interface TextTileContent {
  richText: string;              // HTML or Markdown content
  format: 'html' | 'markdown';   // Content format
}
```

**Example:**
```json
{
  "type": "text",
  "title": "Instructions",
  "content": {
    "richText": "<h2>Overview</h2><p>Dashboard instructions...</p>",
    "format": "html"
  }
}
```

### Image Tile
**Type:** `'image'`

**Purpose:** Display images with optional captions and accessibility text.

**Schema:**
```typescript
interface ImageTileContent {
  imageUrl: string;              // Image source URL
  caption?: string;              // Optional image caption
  alt?: string;                  // Accessibility text
}
```

**Example:**
```json
{
  "type": "image",
  "title": "Company Logo",
  "content": {
    "imageUrl": "https://example.com/logo.png",
    "caption": "Annual Report 2024",
    "alt": "Company performance chart"
  }
}
```

### Smart Tile
**Type:** `'smart'`

**Purpose:** Reserved for future AI-enhanced content tiles.

**Schema:**
```typescript
interface SmartTileContent {
  smartData?: Record<string, any>;  // Structure TBD
}
```

**Status:** Placeholder - specification pending

### Chart Tiles
**Types:** `'line' | 'area' | 'column' | 'bar' | 'pie' | 'donut' | 'scatter' | 'bubble' | 'heatmap' | 'treemap' | 'funnel' | 'gauge' | 'waterfall' | 'spline' | 'areaspline'`

**Purpose:** Data visualization through various chart types.

**Schema:**
```typescript
interface ChartTileConfig {
  type: ChartType;
  title: string;
  subtitle?: string;
  options: {
    series?: Array<{
      name: string;
      data: any[];
      type?: string;
    }>;
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
    legend?: LegendConfig;
    tooltip?: TooltipConfig;
    colors?: string[];
    [key: string]: any;
  };
}
```

**Example:**
```json
{
  "type": "line",
  "title": "Revenue Trend",
  "config": {
    "type": "line",
    "title": "Revenue Trend",
    "subtitle": "Monthly revenue 2024",
    "options": {
      "series": [{
        "name": "Revenue",
        "data": [100, 120, 140, 110, 160, 180]
      }],
      "xAxis": {
        "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      }
    }
  }
}
```

## Supporting Schemas

### Data Source
```typescript
interface DataSource {
  type: 'api' | 'database' | 'static';
  endpoint?: string;              // API endpoint
  query?: string;                 // Database query
  refreshInterval?: number;        // Refresh rate in seconds
  headers?: Record<string, string>;
  method?: 'GET' | 'POST';
  body?: any;
}
```

### Tile Configuration
```typescript
interface TileConfig {
  type: string;                   // Must match tile type
  title: string;                  // Configuration title
  subtitle?: string;              // Optional subtitle
  options: Record<string, any>;   // Type-specific options
}
```

## Type Union
```typescript
type TileType = 
  | 'text' 
  | 'image' 
  | 'smart'
  | 'line' 
  | 'area' 
  | 'column' 
  | 'bar' 
  | 'pie' 
  | 'donut' 
  | 'scatter' 
  | 'bubble' 
  | 'heatmap' 
  | 'treemap' 
  | 'funnel' 
  | 'gauge' 
  | 'waterfall' 
  | 'spline' 
  | 'areaspline';

type TileContent = 
  | TextTileContent 
  | ImageTileContent 
  | SmartTileContent 
  | undefined;  // Chart tiles don't use content field
```

## Validation Rules

1. **Required Fields:**
   - `id` must be unique
   - `type` must be valid TileType
   - `title` must be non-empty string
   - `config` must match type requirements

2. **Content Requirements:**
   - Text tiles: `content.richText` required
   - Image tiles: `content.imageUrl` required
   - Smart tiles: Structure TBD
   - Chart tiles: `config.options` required

3. **Data Constraints:**
   - `tags` array max 10 items
   - `thumbnail` max 500KB if base64
   - `richText` max 100KB
   - `imageUrl` must be valid URL

## Storage Considerations

- Tiles are stored in a relational database
- `content` and `config` fields are JSON columns
- Large content should reference external storage
- Thumbnails should be optimized/compressed
- Templates should be versioned separately