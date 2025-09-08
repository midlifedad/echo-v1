// Database entity types that match our schema
export interface Layout {
  id: string;
  name: string;
  description?: string | null;
  config: {
    cols: { lg: number; md: number; sm: number; xs: number };
    rowHeight: number;
    compactType: 'vertical' | 'horizontal' | null;
    preventCollision: boolean;
  };
  isShared: boolean;
  ownerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tile {
  id: string;
  type: string;
  title: string;
  config: any;
  data: any | null;
  dataSource: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutTile {
  layoutId: string;
  tileId: string;
  breakpoint: 'lg' | 'md' | 'sm' | 'xs';
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

export interface Page {
  id: string;
  name: string;
  slug: string;
  layoutId?: string | null;
  config: any | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface TileWithPositions extends Tile {
  positions: {
    [breakpoint: string]: {
      position: LayoutTile['position'];
      isVisible: boolean;
      inheritanceMode: LayoutTile['inheritanceMode'];
    };
  };
}

// Form/Request types
export interface CreateLayoutRequest {
  name: string;
  description?: string;
  config?: Partial<Layout['config']>;
  isShared?: boolean;
  ownerId?: string;
}

export interface UpdateLayoutRequest {
  name?: string;
  description?: string;
  config?: Partial<Layout['config']>;
  isShared?: boolean;
}

export interface CreateTileRequest {
  type: string;
  title: string;
  config?: any;
  data?: any;
  dataSource?: any;
}

export interface UpdateTileRequest {
  type?: string;
  title?: string;
  config?: any;
  data?: any;
  dataSource?: any;
}

export interface AddTileToLayoutRequest {
  tileId: string;
  positions: {
    [breakpoint: string]: LayoutTile['position'];
  };
}

export interface UpdateTilePositionRequest {
  tileId: string;
  breakpoint: 'lg' | 'md' | 'sm' | 'xs';
  position: LayoutTile['position'];
  isVisible?: boolean;
  inheritanceMode?: 'inherit' | 'custom';
}