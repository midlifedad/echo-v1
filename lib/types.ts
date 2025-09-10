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
  type: TileType;
  title: string;
  position: number;
  config: ChartConfig;
  data?: Record<string, unknown>;
  content?: TileContent;
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

// Extended tile types including non-chart tiles
export type TileType = ChartType | 'text' | 'image' | 'smart' | 'ai-generated';

// Content types for different tile types
export interface TextTileContent {
  richText: string;
  format: 'html' | 'markdown';
}

export interface ImageTileContent {
  imageUrl: string;
  caption?: string;
  alt?: string;
}

export interface SmartTileContent {
  // Structure TBD - placeholder for future implementation
  smartData?: Record<string, any>;
}

export type TileContent = TextTileContent | ImageTileContent | SmartTileContent;

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
  addTile: (type: TileType) => void;
  removeTile: (id: string, onCleanup?: (tileId: string) => void) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  reorderTiles: (tiles: TileData[]) => void;
}

// Layout system types
export type Breakpoint = 'lg' | 'md' | 'sm' | 'xs';

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

export interface LayoutContextType {
  isEditMode: boolean;
  setEditMode: (enabled: boolean) => void;
  layouts: Layouts;
  setLayouts: (layouts: Layouts) => void;
  currentBreakpoint: string;
  setCurrentBreakpoint: (breakpoint: string) => void;
  editingBreakpoint: string;
  setEditingBreakpoint: (breakpoint: string) => void;
  useResponsiveLayout: boolean;
  setUseResponsiveLayout: (responsive: boolean) => void;
  customBreakpoints: Set<string>;
  markBreakpointAsCustom: (breakpoint: string) => void;
  simulatedViewport?: number;
  setSimulatedViewport: (width: number | undefined) => void;
  getBreakpointLayout: (breakpoint: Breakpoint) => LayoutItem[];
  scaleLayout: (layout: LayoutItem, fromBreakpoint: string, toBreakpoint: string) => LayoutItem;
  saveLayouts: () => void;
  cancelEdit: () => void;
  resetToDefault: () => void;
  resetBreakpoint: (breakpoint: string) => void;
  cleanupTileData: (tileId: string) => void;
}