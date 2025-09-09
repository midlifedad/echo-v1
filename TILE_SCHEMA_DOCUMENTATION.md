# Tile Schema Documentation

## Overview

The Echo Dashboard V3 tile system has been extended to support multiple tile types beyond charts. This document describes the schema structure, data formats, and usage for each tile type.

## Database Schema

### Tiles Table

The `tiles` table stores all tile configurations with the following structure:

```typescript
{
  id: string;                    // Unique identifier
  type: string;                   // Tile type (see Tile Types below)
  title: string;                  // Display title
  name?: string;                  // User-friendly name for library
  description?: string;           // What this tile shows
  category?: string;              // Category for organization
  tags?: string[];               // Tags for searching/filtering
  isTemplate: boolean;           // Pre-built vs user-created
  thumbnail?: string;            // Preview image (base64 or URL)
  ownerId?: string;              // Creator ID
  isPublic: boolean;             // Shared across users
  usageCount: number;            // Track popularity
  config: {                      // Configuration object
    type: string;
    title: string;
    subtitle?: string;
    options: Record<string, any>;
  };
  data?: Record<string, any>;   // Static data for charts
  content?: {                   // Type-specific content (NEW)
    // Text tiles
    richText?: string;
    format?: 'html' | 'markdown';
    // Image tiles
    imageUrl?: string;
    caption?: string;
    alt?: string;
    // Smart tiles
    smartData?: Record<string, any>;
  };
  dataSource?: {                 // Data source configuration
    type: 'api' | 'database' | 'static';
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Tile Types

### 1. Text Tiles (`type: 'text'`)

Rich formatted text content with full HTML/Markdown support.

#### Schema Structure
```typescript
{
  type: 'text',
  title: 'Documentation',
  config: {
    type: 'text',
    title: 'Documentation',
    options: {}
  },
  content: {
    richText: '<h1>Welcome</h1><p>This is formatted content...</p>',
    format: 'html'  // or 'markdown'
  }
}
```

#### Features
- Rich text editing with Tiptap editor
- Support for headings, bold, italic, lists, quotes, code
- HTML format for rich display
- Future: Markdown format support

#### Usage Example
```typescript
const textTile = {
  id: 'text-1',
  type: 'text',
  title: 'Project Overview',
  content: {
    richText: '<h2>Overview</h2><p>This dashboard provides...</p>',
    format: 'html'
  }
};
```

### 2. Image Tiles (`type: 'image'`)

Display images with optional captions and alt text.

#### Schema Structure
```typescript
{
  type: 'image',
  title: 'Logo',
  config: {
    type: 'image',
    title: 'Logo',
    options: {}
  },
  content: {
    imageUrl: 'https://example.com/image.png',
    caption: 'Company Logo',
    alt: 'Alt text for accessibility'
  }
}
```

#### Features
- URL-based image display
- Optional caption below image
- Alt text for accessibility
- Error handling for failed loads
- Responsive image sizing

#### Usage Example
```typescript
const imageTile = {
  id: 'img-1',
  type: 'image',
  title: 'Dashboard Banner',
  content: {
    imageUrl: '/images/banner.jpg',
    caption: 'Q4 2024 Performance',
    alt: 'Bar chart showing Q4 performance metrics'
  }
};
```

### 3. Smart Tiles (`type: 'smart'`)

**Status: Placeholder - Coming Soon**

Smart tiles will combine data visualization with AI-powered insights.

#### Planned Structure
```typescript
{
  type: 'smart',
  title: 'Sales Analysis',
  config: {
    type: 'smart',
    title: 'Sales Analysis',
    options: {
      // Chart configuration
    }
  },
  content: {
    smartData: {
      // Structure TBD
    }
  }
}
```

### 4. Chart Tiles (existing types)

All existing chart types continue to work as before:
- `line`, `area`, `column`, `bar`
- `pie`, `donut`
- `scatter`, `bubble`
- `heatmap`, `treemap`
- `funnel`, `gauge`, `waterfall`
- `spline`, `areaspline`

#### Schema Structure
```typescript
{
  type: 'line',  // or any chart type
  title: 'Revenue Trend',
  config: {
    type: 'line',
    title: 'Revenue Trend',
    subtitle: 'Monthly revenue over time',
    options: {
      series: [...],
      xAxis: {...},
      yAxis: {...}
    }
  },
  data: {
    // Optional static data
  }
}
```

## Component Architecture

### Unified Tile Editor

The `TileEditor` component provides a unified interface that adapts based on tile type:

1. **Type Selection**: First choose tile type (Text, Image, Smart, or Chart types)
2. **Dynamic Tabs**: Shows relevant tabs based on type:
   - Text tiles: Basic, Content
   - Image tiles: Basic, Image
   - Smart tiles: Basic, Smart (placeholder)
   - Chart tiles: Basic, Data, Options

### Content Renderers

Each tile type has its own content renderer:

- `TextTileContent.tsx` - Renders rich text HTML
- `ImageTileContent.tsx` - Displays images with captions
- `SmartTileContent.tsx` - Placeholder for future smart tiles
- `ChartWrapper.tsx` - Existing chart renderer

### Layout Integration

The `LayoutTileContent.tsx` component routes tiles to appropriate renderers:

```typescript
switch (tile.type) {
  case 'text':
    return <TextTileContent content={tile.content} />;
  case 'image':
    return <ImageTileContent content={tile.content} />;
  case 'smart':
    return <SmartTileContent content={tile.content} />;
  default:
    // All chart types
    return <ChartWrapper ... />;
}
```

## Migration Guide

### For Existing Tiles

Existing chart tiles will continue to work without modification. The `content` field is optional and only used by new tile types.

### Adding New Tile Types

To add a new tile type:

1. Update `TileType` in `lib/types.ts`
2. Create content interface in `lib/types.ts`
3. Create content renderer component
4. Add case to `LayoutTileContent.tsx` router
5. Add tile type to `TILE_TYPES` in `TileForm.tsx`
6. Add content editor section in `TileEditor.tsx`

## API Usage

### Creating a Text Tile
```typescript
POST /api/tiles
{
  "type": "text",
  "title": "Instructions",
  "content": {
    "richText": "<p>Step-by-step guide...</p>",
    "format": "html"
  }
}
```

### Creating an Image Tile
```typescript
POST /api/tiles
{
  "type": "image",
  "title": "Dashboard Header",
  "content": {
    "imageUrl": "https://cdn.example.com/header.png",
    "caption": "Welcome to the Dashboard"
  }
}
```

### Updating Tile Content
```typescript
PUT /api/tiles/:id
{
  "content": {
    "richText": "<p>Updated content...</p>",
    "format": "html"
  }
}
```

## Best Practices

1. **Text Tiles**
   - Keep content concise and relevant
   - Use proper heading hierarchy
   - Include formatting for readability

2. **Image Tiles**
   - Use optimized image formats (WebP, compressed JPG/PNG)
   - Always provide alt text for accessibility
   - Consider CDN hosting for large images

3. **Smart Tiles** (Future)
   - Will combine best of charts and text
   - AI commentary should add value, not repeat obvious data

4. **Performance**
   - Lazy load large text content
   - Use image placeholders while loading
   - Cache rendered HTML for text tiles

## Database Migrations

The schema was updated with:
```sql
ALTER TABLE tiles ADD content text;
```

This is backward compatible as the field is nullable and only used by new tile types.