# Layout Architecture Specification

## Overview

The Echo Dashboard Layout System enables users to create, manage, and switch between multiple dashboard layouts. Each layout defines the positioning and visibility of tiles (data visualizations) across different screen breakpoints. This document specifies the architecture, data models, and component relationships.

## Core Concepts

### 1. Tiles
**Definition**: A tile is a reusable data visualization component that displays charts, metrics, or other content.

**Characteristics**:
- Independent of layout (pure content/data)
- Can appear in multiple layouts
- Can have different positions in different layouts
- Persisted separately from layouts

### 2. Layouts
**Definition**: A layout defines the arrangement and positioning of tiles for a specific dashboard configuration.

**Characteristics**:
- Contains positioning information for multiple breakpoints
- Can include/exclude specific tiles
- Can be saved, named, and shared
- One layout can be marked as default

### 3. Layout-Tile Relationships
**Definition**: The junction between layouts and tiles that stores position-specific information.

**Characteristics**:
- Many-to-many relationship
- Stores per-breakpoint positioning
- Includes visibility state
- Maintains grid coordinates and dimensions

### 4. Pages/Views
**Definition**: A dashboard page or view that references a specific layout.

**Characteristics**:
- References a layout by ID
- Can apply filters or transformations
- Determines which layout to display

## Data Models

### Database Schema

```typescript
// Tile Entity
interface Tile {
  id: string;                    // Unique identifier
  type: ChartType;               // Chart type (line, bar, pie, etc.)
  title: string;                 // Display title
  config: {                      // Chart configuration
    type: string;
    title: string;
    subtitle?: string;
    options: Record<string, any>;
  };
  data?: Record<string, any>;    // Optional static data
  dataSource?: {                 // Optional dynamic data source
    type: 'api' | 'database' | 'static';
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Layout Entity
interface Layout {
  id: string;                    // Unique identifier
  name: string;                  // User-friendly name
  description?: string;          // Optional description
  isDefault: boolean;            // Default layout flag
  isShared: boolean;             // Shared vs personal
  ownerId?: string;              // User who created it
  tags?: string[];               // Categorization tags
  metadata?: {
    purpose?: string;            // e.g., "executive", "operations"
    theme?: string;              // Visual theme
    version?: number;            // Version for tracking changes
  };
  createdAt: Date;
  updatedAt: Date;
}

// Layout-Tile Junction
interface LayoutTile {
  layoutId: string;              // Foreign key to Layout
  tileId: string;                // Foreign key to Tile
  breakpoint: 'lg' | 'md' | 'sm' | 'xs';  // Screen size
  position: {
    x: number;                   // X coordinate in grid
    y: number;                   // Y coordinate in grid
    w: number;                   // Width in grid units
    h: number;                   // Height in grid units
    minW?: number;               // Minimum width
    minH?: number;               // Minimum height
    maxW?: number;               // Maximum width
    maxH?: number;               // Maximum height
    static?: boolean;            // Locked position
  };
  isVisible: boolean;            // Show/hide tile
  inheritanceMode?: 'inherit' | 'custom';  // Position inheritance
}

// Page/View Entity
interface Page {
  id: string;
  name: string;
  slug: string;                  // URL slug
  layoutId: string;              // Which layout to use
  filters?: {                    // Optional data filters
    dateRange?: { start: Date; end: Date };
    categories?: string[];
    customFilters?: Record<string, any>;
  };
  refreshInterval?: number;      // Auto-refresh in seconds
  access?: {                     // Access control
    public: boolean;
    roles?: string[];
    users?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Component Architecture

### Core Components

#### 1. Layout Manager (`components/layouts/LayoutManager.tsx`)
**Purpose**: Main component for managing layouts

**Responsibilities**:
- Display list of available layouts
- Create new layouts
- Edit layout metadata
- Delete layouts
- Set default layout

#### 2. Layout Selector (`components/layouts/LayoutSelector.tsx`)
**Purpose**: UI for switching between layouts

**Responsibilities**:
- Dropdown/modal with layout list
- Search/filter layouts
- Preview layout thumbnails
- Quick switch functionality

#### 3. Layout Editor (`components/layouts/LayoutEditor.tsx`)
**Purpose**: Visual editor for layout positioning

**Responsibilities**:
- Drag-and-drop tile positioning
- Resize tiles
- Add/remove tiles from layout
- Per-breakpoint editing
- Save layout changes

#### 4. Layout Template (`components/layouts/LayoutTemplate.tsx`)
**Purpose**: Reusable layout rendering component

**Props**:
```typescript
interface LayoutTemplateProps {
  layoutId: string;
  tiles: Tile[];
  isEditMode?: boolean;
  onLayoutChange?: (changes: LayoutChange) => void;
}
```

### Service Layer

#### 1. Layout Service (`lib/services/layoutService.ts`)
```typescript
interface LayoutService {
  // CRUD Operations
  createLayout(layout: Partial<Layout>): Promise<Layout>;
  getLayout(id: string): Promise<Layout>;
  updateLayout(id: string, updates: Partial<Layout>): Promise<Layout>;
  deleteLayout(id: string): Promise<void>;
  
  // Bulk Operations
  listLayouts(filters?: LayoutFilters): Promise<Layout[]>;
  duplicateLayout(id: string, newName: string): Promise<Layout>;
  
  // Layout-Tile Operations
  setTilePosition(layoutId: string, tileId: string, breakpoint: string, position: Position): Promise<void>;
  removeTileFromLayout(layoutId: string, tileId: string): Promise<void>;
  addTileToLayout(layoutId: string, tileId: string, positions: BreakpointPositions): Promise<void>;
  
  // Import/Export
  exportLayout(id: string): Promise<string>;
  importLayout(jsonData: string): Promise<Layout>;
}
```

#### 2. Tile Service (`lib/services/tileService.ts`)
```typescript
interface TileService {
  // CRUD Operations
  createTile(tile: Partial<Tile>): Promise<Tile>;
  getTile(id: string): Promise<Tile>;
  updateTile(id: string, updates: Partial<Tile>): Promise<Tile>;
  deleteTile(id: string): Promise<void>;
  
  // Bulk Operations
  listTiles(): Promise<Tile[]>;
  getTilesForLayout(layoutId: string): Promise<Tile[]>;
  
  // Data Operations
  refreshTileData(id: string): Promise<void>;
  updateTileConfig(id: string, config: ChartConfig): Promise<void>;
}
```

## API Endpoints

### Layout Endpoints
- `GET /api/layouts` - List all layouts
- `POST /api/layouts` - Create new layout
- `GET /api/layouts/:id` - Get specific layout
- `PUT /api/layouts/:id` - Update layout
- `DELETE /api/layouts/:id` - Delete layout
- `POST /api/layouts/:id/duplicate` - Duplicate layout
- `GET /api/layouts/:id/export` - Export layout as JSON
- `POST /api/layouts/import` - Import layout from JSON

### Tile Endpoints
- `GET /api/tiles` - List all tiles
- `POST /api/tiles` - Create new tile
- `GET /api/tiles/:id` - Get specific tile
- `PUT /api/tiles/:id` - Update tile
- `DELETE /api/tiles/:id` - Delete tile
- `POST /api/tiles/:id/refresh` - Refresh tile data

### Layout-Tile Endpoints
- `GET /api/layouts/:layoutId/tiles` - Get tiles for layout
- `POST /api/layouts/:layoutId/tiles` - Add tile to layout
- `PUT /api/layouts/:layoutId/tiles/:tileId` - Update tile position
- `DELETE /api/layouts/:layoutId/tiles/:tileId` - Remove tile from layout

## State Management

### Context Structure
```typescript
interface LayoutContextState {
  // Current State
  activeLayoutId: string | null;
  activeLayout: Layout | null;
  layouts: Layout[];
  isEditMode: boolean;
  editingBreakpoint: Breakpoint;
  
  // Actions
  setActiveLayout: (layoutId: string) => void;
  createLayout: (layout: Partial<Layout>) => Promise<Layout>;
  updateLayout: (id: string, updates: Partial<Layout>) => Promise<void>;
  deleteLayout: (id: string) => Promise<void>;
  
  // Edit Mode
  enterEditMode: () => void;
  exitEditMode: (save?: boolean) => void;
  updateTilePosition: (tileId: string, breakpoint: string, position: Position) => void;
}

interface TileContextState {
  // Current State
  tiles: Tile[];
  loadingTiles: Set<string>;
  
  // Actions
  createTile: (tile: Partial<Tile>) => Promise<Tile>;
  updateTile: (id: string, updates: Partial<Tile>) => Promise<void>;
  deleteTile: (id: string) => Promise<void>;
  refreshTileData: (id: string) => Promise<void>;
}
```

## User Workflows

### 1. Creating a New Layout
1. User clicks "New Layout" button
2. Modal appears with layout options
3. User enters name and description
4. User chooses template or starts blank
5. System creates layout and switches to edit mode
6. User positions tiles as desired
7. User saves layout

### 2. Editing an Existing Layout
1. User selects layout from dropdown
2. User clicks "Edit Layout" button
3. System enters edit mode
4. User drags/resizes tiles
5. User can add/remove tiles
6. User saves or cancels changes

### 3. Switching Layouts
1. User opens layout selector
2. User sees list/grid of available layouts
3. User clicks desired layout
4. System loads layout and updates display
5. URL updates to reflect current layout

## Performance Considerations

### Caching Strategy
- Cache layout definitions in memory
- Cache tile data with TTL based on refresh interval
- Use React Query or SWR for API state management
- Implement optimistic updates for better UX

### Lazy Loading
- Load tile data on demand
- Virtualize large tile lists
- Code-split layout management components
- Progressive enhancement for edit mode

### Database Optimization
- Index on layoutId, tileId for junction table
- Use transactions for bulk operations
- Implement soft deletes for recovery
- Regular cleanup of orphaned tiles

## Security Considerations

### Access Control
- Validate user permissions for layout CRUD
- Implement row-level security for personal layouts
- Sanitize user input in layout names/descriptions
- Rate limit API endpoints

### Data Protection
- Encrypt sensitive tile data
- Audit log for layout changes
- Backup strategy for layouts
- Version control for layout changes

## Migration Strategy

### From Current System
1. Export current layout from localStorage
2. Create default layout in database
3. Migrate tile positions to layout_tiles table
4. Update components to use new service layer
5. Remove old localStorage code

### Rollback Plan
1. Keep localStorage backup
2. Implement feature flag for new system
3. Parallel run both systems initially
4. Gradual migration per user/team

## Future Enhancements

### Phase 2
- Layout templates marketplace
- Collaborative editing
- Layout versioning and history
- A/B testing frameworks

### Phase 3
- AI-powered layout suggestions
- Responsive layout optimizer
- Performance analytics per layout
- Cross-device layout sync

## Testing Strategy

### Unit Tests
- Service layer methods
- Context state management
- Component rendering
- API endpoint handlers

### Integration Tests
- Layout CRUD workflows
- Tile positioning persistence
- Breakpoint switching
- Import/export functionality

### E2E Tests
- Complete user workflows
- Cross-browser compatibility
- Responsive behavior
- Performance benchmarks