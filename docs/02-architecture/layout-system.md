# Layout System Architecture

## Overview
The layout system manages the spatial organization and responsive behavior of tiles within dashboards. It provides a flexible grid-based positioning system with multi-breakpoint support.

## Core Concepts

### Grid System
The foundation is a responsive grid with configurable columns and rows:
- **Grid Units**: Abstract measurement units
- **Breakpoints**: Responsive screen size thresholds
- **Positions**: X/Y coordinates within the grid
- **Dimensions**: Width/height in grid units

### Layout Hierarchy
```
Dashboard → Layout → Breakpoints → Tile Positions
```

## Layout Engine

### Grid Calculation
```typescript
interface GridEngine {
  // Grid calculations
  calculateGrid(viewport: Viewport): Grid;
  gridToPixels(gridPos: GridPosition, grid: Grid): PixelPosition;
  pixelsToGrid(pixelPos: PixelPosition, grid: Grid): GridPosition;
  
  // Collision detection
  detectCollisions(positions: GridPosition[]): Collision[];
  resolveCollisions(positions: GridPosition[]): GridPosition[];
  
  // Compaction
  compact(positions: GridPosition[], direction: Direction): GridPosition[];
}
```

### Coordinate System
```
Grid Space:
┌─────────────────────────┐
│ (0,0)  (1,0)  (2,0) ... │
│ (0,1)  (1,1)  (2,1) ... │
│ (0,2)  (1,2)  (2,2) ... │
│  ...    ...    ...  ... │
└─────────────────────────┘

Position = { x: column, y: row, w: width, h: height }
```

## Responsive System

### Breakpoint Management
```typescript
interface BreakpointManager {
  breakpoints: Map<string, number>;
  current: string;
  
  detect(viewport: number): string;
  getColumns(breakpoint: string): number;
  scale(position: GridPosition, from: string, to: string): GridPosition;
}
```

### Breakpoint Flow
```
Viewport Change → Breakpoint Detection → Position Retrieval → Scaling → Rendering
```

### Scaling Algorithm
When transitioning between breakpoints:
1. **Proportional Scaling**: Maintain relative proportions
2. **Column Adjustment**: Adapt to different column counts
3. **Overflow Prevention**: Ensure tiles stay within bounds

```typescript
function scalePosition(pos: GridPosition, fromCols: number, toCols: number) {
  const ratio = toCols / fromCols;
  return {
    x: Math.floor(pos.x * ratio),
    y: pos.y,  // Maintain vertical position
    w: Math.max(1, Math.round(pos.w * ratio)),
    h: pos.h   // Maintain height
  };
}
```

## Position Management

### Position Storage
Positions are stored per layout, per tile, per breakpoint:
```
layouts/
  └── layout-001/
      └── positions/
          ├── lg/ { tile-001: {...}, tile-002: {...} }
          ├── md/ { tile-001: {...}, tile-002: {...} }
          ├── sm/ { tile-001: {...}, tile-002: {...} }
          └── xs/ { tile-001: {...}, tile-002: {...} }
```

### Position Inheritance
Tiles can inherit positions from larger breakpoints:
```typescript
interface InheritanceResolver {
  resolve(tileId: string, breakpoint: string): GridPosition;
  inherit(position: GridPosition, fromBp: string, toBp: string): GridPosition;
  markCustom(tileId: string, breakpoint: string): void;
}
```

**Inheritance Rules:**
1. Check for custom position at current breakpoint
2. If none, inherit from next larger breakpoint
3. Scale position to fit current grid
4. Cache result for performance

## Layout Operations

### Adding Tiles
```
Find Space → Validate Position → Place Tile → Update Storage
```

```typescript
interface TilePlacer {
  findSpace(size: Size, existing: GridPosition[]): GridPosition;
  canPlace(position: GridPosition, existing: GridPosition[]): boolean;
  place(tile: Tile, position: GridPosition): void;
}
```

### Moving Tiles
```
Validate Move → Check Collisions → Resolve → Update Position
```

```typescript
interface TileMover {
  canMove(tile: string, to: GridPosition): boolean;
  move(tile: string, to: GridPosition): GridPosition[];
  swap(tile1: string, tile2: string): void;
}
```

### Resizing Tiles
```
Validate Size → Check Bounds → Adjust Neighbors → Update
```

```typescript
interface TileResizer {
  canResize(tile: string, size: Size): boolean;
  resize(tile: string, size: Size): GridPosition[];
  getConstraints(tile: string): SizeConstraints;
}
```

## Collision Resolution

### Detection
```typescript
function detectCollision(a: GridPosition, b: GridPosition): boolean {
  return !(
    a.x + a.w <= b.x ||  // a is left of b
    b.x + b.w <= a.x ||  // b is left of a
    a.y + a.h <= b.y ||  // a is above b
    b.y + b.h <= a.y     // b is above a
  );
}
```

### Resolution Strategies
1. **Push Down**: Move colliding tiles down
2. **Push Right**: Move colliding tiles right
3. **Swap**: Exchange positions
4. **Compact**: Remove empty spaces

## Layout Persistence

### Storage Strategy
```typescript
interface LayoutStorage {
  // Save operations
  saveLayout(layout: Layout): Promise<void>;
  savePositions(layoutId: string, positions: Positions): Promise<void>;
  
  // Load operations
  loadLayout(id: string): Promise<Layout>;
  loadPositions(layoutId: string): Promise<Positions>;
  
  // Batch operations
  saveAll(layouts: Layout[]): Promise<void>;
  loadAll(): Promise<Layout[]>;
}
```

### Caching Layer
```typescript
interface LayoutCache {
  layouts: Map<string, Layout>;
  positions: Map<string, Positions>;
  
  get(id: string): Layout | undefined;
  set(id: string, layout: Layout): void;
  invalidate(id: string): void;
  clear(): void;
}
```

## Edit Mode

### Drag and Drop
```
Mouse Down → Start Drag → Calculate Position → Preview → Drop → Commit
```

```typescript
interface DragHandler {
  startDrag(tile: string, point: Point): DragState;
  updateDrag(point: Point): GridPosition;
  previewDrag(position: GridPosition): void;
  completeDrag(): void;
  cancelDrag(): void;
}
```

### Resize Handles
```
Handle Grab → Start Resize → Calculate Size → Preview → Release → Commit
```

```typescript
interface ResizeHandler {
  handles: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  
  startResize(tile: string, handle: string): ResizeState;
  updateResize(delta: Delta): Size;
  previewResize(size: Size): void;
  completeResize(): void;
}
```

## Performance Optimization

### Virtual Rendering
Only render visible tiles:
```typescript
interface VirtualRenderer {
  viewport: Rectangle;
  visible: Set<string>;
  
  updateViewport(viewport: Rectangle): void;
  getVisibleTiles(): Tile[];
  shouldRender(tile: Tile): boolean;
}
```

### Update Batching
Batch layout changes to minimize reflows:
```typescript
interface UpdateBatcher {
  pending: Update[];
  
  add(update: Update): void;
  flush(): void;
  schedule(callback: () => void): void;
}
```

### Memoization
Cache expensive calculations:
```typescript
interface LayoutMemo {
  grids: Map<string, Grid>;
  positions: WeakMap<Layout, Positions>;
  calculations: LRUCache<string, any>;
}
```

## Layout Templates

### Template Structure
```typescript
interface LayoutTemplate {
  id: string;
  name: string;
  positions: {
    [breakpoint: string]: TemplatePosition[];
  };
  recommendedTiles: TileRecommendation[];
}

interface TemplatePosition {
  slot: string;
  position: GridPosition;
  constraints?: SizeConstraints;
}
```

### Template Application
```
Load Template → Map Tiles to Slots → Apply Positions → Validate → Save
```

## Testing Strategies

### Unit Tests
- Grid calculations
- Collision detection
- Position scaling
- Inheritance resolution

### Integration Tests
- Full layout lifecycle
- Multi-breakpoint transitions
- Drag and drop operations
- Template application

### Performance Tests
- Large tile counts (100+)
- Rapid viewport changes
- Complex collision scenarios
- Memory usage patterns