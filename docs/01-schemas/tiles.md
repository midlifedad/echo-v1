# Template & Instance Schemas

## Overview
The dashboard system uses a template/instance architecture where templates are reusable definitions and instances are their implementations in layouts. This document defines the schemas for both.

## Template Schema

Templates are reusable tile definitions stored in the library:

```typescript
interface TileTemplate {
  id: string;                           // Unique identifier
  type: TileType;                       // Tile type identifier
  title: string;                        // Template title
  name?: string;                        // User-friendly library name
  description?: string;                 // Template description
  category?: string;                    // Organizational category
  tags?: string[];                     // Searchable tags
  isSystem: boolean;                   // System-provided template
  isPublic: boolean;                   // Sharing permission
  thumbnail?: string;                  // Preview image (base64 or URL)
  ownerId?: string;                    // Creator identifier
  usageCount: number;                  // Popularity/usage counter
  config: TileConfig;                  // Type-specific configuration
  data?: Record<string, any>;         // Static data (for charts)
  content?: TileContent;               // Type-specific content
  dataSource?: DataSource;             // Dynamic data configuration
  defaultDisplaySettings: DisplaySettings; // Default display options
  createdAt: Date;
  updatedAt: Date;
}
```

## Instance Schema

Instances are actual tiles used within specific layouts:

```typescript
interface TileInstance {
  id: string;                          // Unique identifier
  templateId?: string;                 // Link to template (optional)
  layoutId: string;                    // Parent layout ID
  parentInstanceId?: string;           // For copied instances
  type: TileType;                      // Tile type (denormalized)
  title: string;                       // Instance title (can override template)
  config: TileConfig;                  // Instance configuration
  data?: Record<string, any>;         // Instance-specific data
  content?: TileContent;               // Instance-specific content
  dataSource?: DataSource;             // Instance data source config
  displaySettings: DisplaySettings;    // Layout-specific display settings
  isModified: boolean;                 // Whether instance differs from template
  lastSyncedAt?: Date;                 // Last sync with template
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
  },
  "data": {
    "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "series": [{
      "name": "Revenue",
      "data": [45000, 52000, 48000, 61000, 58000, 67000]
    }]
  }
}
```

**⚠️ Important:** Chart templates SHOULD include static `data` for consistent library previews. If `data` is `null`, the system will generate random mock data using `Math.random()`, causing inconsistent chart previews on every page refresh.

## Supporting Schemas

### Display Settings
```typescript
interface DisplaySettings {
  showBorder?: boolean;           // Show tile border
  borderColor?: string;           // Border color (hex)
  borderWidth?: number;           // Border width in pixels
  expandable?: boolean;           // Allow tile expansion
  showTitle?: boolean;            // Show tile title
  titlePosition?: 'top' | 'bottom' | 'hidden'; // Title position
  padding?: number;               // Internal padding in pixels
  backgroundColor?: string;        // Background color (hex)
  opacity?: number;               // Opacity (0-1)
  interactive?: boolean;          // Allow user interaction
  locked?: boolean;               // Prevent editing/moving
}
```

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

## Template/Instance Relationships

### Resolution Rules
When rendering an instance:

1. **Base Properties**: Start with template defaults (if templateId exists)
2. **Override Properties**: Apply instance-specific overrides
3. **Display Settings**: Merge template defaultDisplaySettings with instance displaySettings
4. **Configuration**: Instance config takes precedence over template config
5. **Content**: Instance content takes precedence over template content

### Modification Tracking
- `isModified` flag tracks whether instance differs from its template
- Set to `true` when instance properties differ from template
- Set to `false` when synced with template
- Custom instances (no templateId) are always `isModified: true`

### Synchronization
- Sync operation reverts instance to template state
- Only affects config, content, data, and dataSource
- Display settings are preserved (layout-specific)
- Updates `lastSyncedAt` timestamp

## Validation Rules

### Template Validation
1. **Required Fields:**
   - `id` must be unique across templates
   - `type` must be valid TileType
   - `title` must be non-empty string
   - `config` must match type requirements
   - `defaultDisplaySettings` must be valid DisplaySettings

2. **Content Requirements:**
   - Text tiles: `content.richText` required
   - Image tiles: `content.imageUrl` required
   - Smart tiles: Structure TBD
   - Chart tiles: `config.options` required

### Instance Validation
1. **Required Fields:**
   - `id` must be unique across instances
   - `layoutId` must reference existing layout
   - `type` must be valid TileType
   - `title` must be non-empty string
   - `config` must match type requirements
   - `displaySettings` must be valid DisplaySettings

2. **Template Relationship:**
   - If `templateId` provided, must reference existing template
   - `type` must match template type (if linked)

### Common Data Constraints
- `tags` array max 10 items
- `thumbnail` max 500KB if base64
- `richText` max 100KB
- `imageUrl` must be valid URL
- `displaySettings.opacity` must be between 0 and 1
- Color values must be valid hex codes

## Storage Considerations

### Templates
- Stored in `tile_templates` table
- `content`, `config`, and `defaultDisplaySettings` are JSON columns
- Templates are versioned independently of instances
- Large content should reference external storage
- Thumbnails should be optimized/compressed

### Instances
- Stored in `tile_instances` table
- Linked to templates via foreign key (optional)
- `content`, `config`, and `displaySettings` are JSON columns
- Instance data overrides template data when present
- Instances are layout-specific and deleted with layouts

### Performance Optimizations
- Templates cached for frequent access
- Instance resolution performed at render time
- Denormalized type field in instances for quick filtering
- Usage counts updated asynchronously