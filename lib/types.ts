export interface Client {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive?: boolean;
}

export interface GridLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface TileData {
  id: string;
  type: ChartType;
  title: string;
  position: number;
  config: ChartConfig;
  data?: Record<string, unknown>;
  gridLayout?: GridLayout;
}

export interface ChartConfig {
  type: string;
  title: string;
  subtitle?: string;
  options: Record<string, unknown>;
}

export type ChartType = 
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

export interface SidebarContextType {
  isCollapsed: boolean;
  isHovered: boolean;
  selectedClient: Client;
  activeSection: string;
  toggleSidebar: () => void;
  setHovered: (hovered: boolean) => void;
  setSelectedClient: (client: Client) => void;
  setActiveSection: (section: string) => void;
}

export interface TileContextType {
  tiles: TileData[];
  addTile: (type: ChartType) => void;
  removeTile: (id: string, onCleanup?: (tileId: string) => void) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  reorderTiles: (tiles: TileData[]) => void;
}

// Layout system types
export type Breakpoint = 'lg' | 'md' | 'sm' | 'xs';
export type InheritanceMode = 'inherit' | 'custom';

export interface TileInheritance {
  lg?: InheritanceMode;
  md?: InheritanceMode;
  sm?: InheritanceMode;
  xs?: InheritanceMode;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface Layouts {
  [breakpoint: string]: LayoutItem[];
}

export interface LockedPosition {
  layouts: {
    [breakpoint: string]: LayoutItem;
  };
}

export interface LayoutContextType {
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  layouts: Layouts;
  setLayouts: (layouts: Layouts) => void;
  currentBreakpoint: string;
  setCurrentBreakpoint: (breakpoint: string) => void;
  editingBreakpoint: string;
  setEditingBreakpoint: (breakpoint: string) => void;
  layoutInheritance: { [tileId: string]: TileInheritance };
  setLayoutInheritance: (inheritance: { [tileId: string]: TileInheritance }) => void;
  updateTileInheritance: (tileId: string, breakpoint: string, mode: InheritanceMode) => void;
  customLayouts: { [breakpoint: string]: string[] };
  simulatedViewport?: number;
  setSimulatedViewport: (width: number | undefined) => void;
  getInheritedLayout: (tileId: string, breakpoint: string) => LayoutItem | undefined;
  scaleLayout: (layout: LayoutItem, fromBreakpoint: string, toBreakpoint: string) => LayoutItem;
  lockedTiles: Set<string>;
  lockedPositions: { [tileId: string]: LockedPosition };
  setTileLocked: (tileId: string, locked: boolean, allBreakpointLayouts?: { [breakpoint: string]: LayoutItem }) => void;
  isTileLocked: (tileId: string) => boolean;
  saveLayouts: () => void;
  cancelEdit: () => void;
  resetToDefault: () => void;
  resetBreakpoint: (breakpoint: string) => void;
  cleanupTileData: (tileId: string) => void;
}