# Layout Schemas

## Overview
Layouts define how tiles are positioned and organized within a dashboard. The system supports responsive layouts with different configurations for various screen sizes.

## Layout Schema

```typescript
interface Layout {
  id: string;                    // Unique identifier
  name: string;                  // User-friendly name
  description?: string;          // Purpose/use case description
  config?: LayoutConfig;         // Layout configuration
  isDefault: boolean;            // Default layout flag
  isShared: boolean;             // Shared vs personal
  ownerId?: string;              // Creator identifier
  tags?: string[];               // Categorization tags
  metadata?: LayoutMetadata;     // Additional metadata
  createdAt: Date;
  updatedAt: Date;
}
```

## Layout Configuration

```typescript
interface LayoutConfig {
  cols?: BreakpointConfig<number>;      // Columns per breakpoint
  rowHeight?: number;                    // Base row height in pixels
  compactType?: 'vertical' | 'horizontal' | null;
  preventCollision?: boolean;            // Prevent tile overlap
}

interface BreakpointConfig<T> {
  lg: T;    // Large screens (≥1200px)
  md: T;    // Medium screens (≥996px)
  sm: T;    // Small screens (≥768px)
  xs: T;    // Extra small screens (<768px)
}
```

## Layout-Tile Positioning

The junction between layouts and tiles stores position data for each breakpoint.

```typescript
interface LayoutTile {
  layoutId: string;              // Reference to Layout
  tileId: string;                // Reference to Tile
  breakpoint: Breakpoint;        // Screen size identifier
  position: GridPosition;        // Position configuration
  isVisible: boolean;            // Visibility flag
  inheritanceMode?: InheritanceMode;  // Position inheritance
}

type Breakpoint = 'lg' | 'md' | 'sm' | 'xs';
type InheritanceMode = 'inherit' | 'custom';
```

## Grid Position Schema

```typescript
interface GridPosition {
  x: number;        // X coordinate (0-based)
  y: number;        // Y coordinate (0-based)  
  w: number;        // Width in grid units
  h: number;        // Height in grid units
  minW?: number;    // Minimum width constraint
  minH?: number;    // Minimum height constraint
  maxW?: number;    // Maximum width constraint
  maxH?: number;    // Maximum height constraint
  static?: boolean; // Lock position (prevent drag/resize)
}
```

## Layout Metadata

```typescript
interface LayoutMetadata {
  purpose?: string;       // e.g., "executive", "operations", "analytics"
  theme?: string;         // Visual theme identifier
  version?: number;       // Version for change tracking
  lastModified?: Date;    // Last modification timestamp
  customProperties?: Record<string, any>;
}
```

## Breakpoint System

### Default Breakpoints
```typescript
const BREAKPOINTS = {
  lg: 1200,  // Desktop
  md: 996,   // Tablet landscape
  sm: 768,   // Tablet portrait
  xs: 480    // Mobile
};
```

### Default Grid Configuration
```typescript
const DEFAULT_GRID_CONFIG = {
  cols: { lg: 12, md: 10, sm: 6, xs: 4 },
  rowHeight: 80,
  margin: [9, 9],
  containerPadding: [0, 0],
  compactType: 'vertical'
};
```

## Position Inheritance

Tiles can inherit positions from larger breakpoints or define custom positions.

```typescript
interface TileInheritance {
  [tileId: string]: {
    lg?: InheritanceMode;
    md?: InheritanceMode;
    sm?: InheritanceMode;
    xs?: InheritanceMode;
  };
}
```

**Inheritance Rules:**
1. `inherit`: Use scaled position from next larger breakpoint
2. `custom`: Use explicitly defined position for this breakpoint
3. Default: Inherit from larger breakpoint

## Locked Tiles

Tiles can be locked to prevent editing at specific positions.

```typescript
interface LockedTile {
  tileId: string;
  layouts: {
    [breakpoint: string]: GridPosition;
  };
  lockedBy?: string;
  lockedAt?: Date;
  reason?: string;
}
```

## Layout Templates

Pre-defined layout configurations for common use cases.

```typescript
interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: string;
  positions: {
    [breakpoint: string]: GridPosition[];
  };
  recommendedTiles?: {
    position: number;
    type: string;
    config?: any;
  }[];
}
```

## Validation Rules

### Grid Position Constraints
- `x` ≥ 0 and < column count
- `y` ≥ 0
- `w` > 0 and ≤ column count
- `h` > 0
- `minW` ≤ `w` ≤ `maxW` (if defined)
- `minH` ≤ `h` ≤ `maxH` (if defined)

### Layout Constraints
- Layout name must be unique per user
- Only one layout can be default
- Shared layouts require ownerId
- Maximum 50 tiles per layout

## Storage Optimization

### Persistence Strategy
```typescript
interface LayoutStorage {
  // Separate storage for different concerns
  layouts: Layout[];                    // Core layout data
  positions: Map<string, LayoutTile[]>; // Position data by layoutId
  inheritance: TileInheritance;         // Inheritance settings
  locked: LockedTile[];                 // Locked tile positions
}
```

### Caching Strategy
- Cache active layout in memory
- Lazy load position data for non-active layouts
- Store user preferences separately
- Persist to database on significant changes only

## Example Layout

```json
{
  "id": "layout-001",
  "name": "Executive Dashboard",
  "description": "High-level metrics for executives",
  "isDefault": true,
  "config": {
    "cols": { "lg": 12, "md": 10, "sm": 6, "xs": 4 },
    "rowHeight": 80
  },
  "metadata": {
    "purpose": "executive",
    "version": 1
  }
}
```

## Position Example

```json
{
  "layoutId": "layout-001",
  "tileId": "tile-revenue",
  "breakpoint": "lg",
  "position": {
    "x": 0,
    "y": 0,
    "w": 6,
    "h": 4,
    "minW": 3,
    "minH": 2
  },
  "isVisible": true,
  "inheritanceMode": "custom"
}