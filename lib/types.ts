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

export interface TileData {
  id: string;
  type: ChartType;
  title: string;
  position: number;
  config: ChartConfig;
  data?: Record<string, unknown>;
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
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<TileData>) => void;
  reorderTiles: (tiles: TileData[]) => void;
}