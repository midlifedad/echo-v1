// Import generated types from schema
import type { 
  Layout as SchemaLayout,
  TileTemplate as SchemaTileTemplate,
  TileInstance as SchemaTileInstance,
  LayoutTile as SchemaLayoutTile,
  Page as SchemaPage,
  Tile as SchemaTile // Legacy
} from '@/lib/db/schema';

// Re-export schema types
export type Layout = SchemaLayout;
export type TileTemplate = SchemaTileTemplate;
export type TileInstance = SchemaTileInstance;
export type LayoutTile = SchemaLayoutTile;
export type Page = SchemaPage;
export type Tile = SchemaTile; // Legacy

// Display settings for tiles within layouts
export interface TileDisplaySettings {
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  expandable?: boolean;
  showTitle?: boolean;
  titlePosition?: 'top' | 'bottom' | 'hidden';
  padding?: number;
  backgroundColor?: string;
  opacity?: number;
  interactive?: boolean;
  locked?: boolean;
}

// Extended tile template with computed fields
export interface TileTemplateWithMetadata extends TileTemplate {
  isFavorite?: boolean;
  instanceCount?: number;
  lastUsedAt?: Date | null;
}

// Extended tile instance with relationships
export interface TileInstanceWithRelations extends TileInstance {
  template?: TileTemplate | null;
  layout?: Layout;
  parentInstance?: TileInstance | null;
  positions?: LayoutTilePosition[];
}

// Position data for a tile at different breakpoints
export interface LayoutTilePosition {
  breakpoint: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
  };
  isVisible: boolean;
  inheritanceMode: 'inherit' | 'custom';
}

// Complete tile instance with all position data
export interface TileInstanceWithPositions extends TileInstance {
  positions: {
    [breakpoint: string]: LayoutTilePosition['position'];
  };
}

// Legacy API Response types (for migration compatibility)
export interface TileWithPositions extends Tile {
  positions: {
    [breakpoint: string]: {
      position: LayoutTile['position'];
      isVisible: boolean;
      inheritanceMode: LayoutTile['inheritanceMode'];
    };
  };
}

// Template-specific request types
export interface CreateTileTemplateRequest {
  type: string;
  title: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  config: Record<string, any>;
  data?: Record<string, any>;
  content?: Record<string, any>;
  dataSource?: Record<string, any>;
  defaultDisplaySettings?: TileDisplaySettings;
  isPublic?: boolean;
}

export interface UpdateTileTemplateRequest {
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  config?: Record<string, any>;
  data?: Record<string, any>;
  content?: Record<string, any>;
  dataSource?: Record<string, any>;
  defaultDisplaySettings?: TileDisplaySettings;
  isPublic?: boolean;
}

// Instance-specific request types
export interface CreateTileInstanceRequest {
  templateId?: string; // Optional - can create custom instance without template
  layoutId: string;
  type: string;
  title: string;
  config: Record<string, any>;
  data?: Record<string, any>;
  content?: Record<string, any>;
  dataSource?: Record<string, any>;
  displaySettings?: TileDisplaySettings;
  positions?: {
    [breakpoint: string]: LayoutTilePosition['position'];
  };
}

export interface UpdateTileInstanceRequest {
  title?: string;
  config?: Record<string, any>;
  data?: Record<string, any>;
  content?: Record<string, any>;
  dataSource?: Record<string, any>;
  displaySettings?: TileDisplaySettings;
  isModified?: boolean;
}

export interface CopyTileInstanceRequest {
  sourceInstanceId: string;
  targetLayoutId: string;
  positions?: {
    [breakpoint: string]: LayoutTilePosition['position'];
  };
}

export interface SaveInstanceAsTemplateRequest {
  instanceId: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Layout request types
export interface CreateLayoutRequest {
  name: string;
  description?: string;
  config?: Partial<Layout['config']>;
  isShared?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateLayoutRequest {
  name?: string;
  description?: string;
  config?: Partial<Layout['config']>;
  isDefault?: boolean;
  isShared?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Legacy request types (for migration compatibility)
export interface CreateTileRequest {
  type: string;
  title: string;
  config?: any;
  data?: any;
  content?: any; // Added for text/image/smart tiles
  dataSource?: any;
}

export interface UpdateTileRequest {
  type?: string;
  title?: string;
  config?: any;
  data?: any;
  content?: any; // Added for text/image/smart tiles
  dataSource?: any;
}

export interface AddTileToLayoutRequest {
  tileId: string;
  positions: {
    [breakpoint: string]: LayoutTile['position'];
  };
}

export interface UpdateTilePositionRequest {
  tileInstanceId: string;
  breakpoint: 'lg' | 'md' | 'sm';
  position: LayoutTile['position'];
  isVisible?: boolean;
  inheritanceMode?: 'inherit' | 'custom';
}

// Response types
export interface TileTemplateListResponse {
  templates: TileTemplateWithMetadata[];
  total: number;
  limit: number;
  offset: number;
}

export interface TileInstanceListResponse {
  instances: TileInstanceWithRelations[];
  total: number;
}

export interface LayoutWithTiles extends Layout {
  tileInstances: TileInstanceWithPositions[];
}