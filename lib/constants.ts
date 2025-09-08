import { Client, NavItem } from './types';

export const CLIENTS: Client[] = [
  {
    id: 'panda-express',
    name: 'Panda Express',
    logo: '/logos/panda-express.png',
    color: '#e31837'
  },
  {
    id: 'demo-client',
    name: 'Demo Client',
    logo: '/logos/demo.png',
    color: '#6e45e2'
  }
];

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'blueprint',
    label: 'Blueprint',
    icon: 'Map',
    href: '/blueprint'
  },
  {
    id: 'workstreams',
    label: 'Workstreams',
    icon: 'GitBranch',
    href: '/workstreams'
  },
  {
    id: 'repository',
    label: 'Repository',
    icon: 'Database',
    href: '/repository'
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: 'BarChart3',
    href: '/reporting'
  },
  {
    id: 'playground',
    label: 'Playground',
    icon: 'Zap',
    href: '/playground'
  },
  {
    id: 'tile-library',
    label: 'Tile Library',
    icon: 'Edit3',
    href: '/tile-library'
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: 'Layout',
    href: '/layout-editor'
  }
];

export const CHART_TYPES = [
  { id: 'line', name: 'Line Chart', icon: 'TrendingUp' },
  { id: 'area', name: 'Area Chart', icon: 'AreaChart' },
  { id: 'column', name: 'Column Chart', icon: 'BarChart' },
  { id: 'bar', name: 'Bar Chart', icon: 'BarChart3' },
  { id: 'pie', name: 'Pie Chart', icon: 'PieChart' },
  { id: 'donut', name: 'Donut Chart', icon: 'PieChart' },
  { id: 'scatter', name: 'Scatter Plot', icon: 'Scatter3D' },
  { id: 'bubble', name: 'Bubble Chart', icon: 'Circle' },
  { id: 'heatmap', name: 'Heatmap', icon: 'Grid3X3' },
  { id: 'treemap', name: 'Treemap', icon: 'TreePine' },
  { id: 'funnel', name: 'Funnel Chart', icon: 'Filter' },
  { id: 'gauge', name: 'Gauge Chart', icon: 'Gauge' },
  { id: 'waterfall', name: 'Waterfall Chart', icon: 'BarChart4' }
] as const;

// Layout system constants
export const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480
} as const;

export const BREAKPOINT_COLUMNS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4
} as const;

export const BREAKPOINT_ORDER = ['lg', 'md', 'sm', 'xs'] as const;

export const GRID_CONFIG = {
  ROW_HEIGHT: 80,
  MARGIN: [9, 9] as [number, number],
  CONTAINER_PADDING: [0, 0] as [number, number],
  RESIZE_HANDLES: ['se', 'sw', 'ne', 'nw'] as const,
  MIN_WIDTH: 2,
  MIN_HEIGHT: 2,
  DEFAULT_HEIGHT: 4
} as const;

// Storage keys for persistence
export const STORAGE_KEYS = {
  TILES: 'dashboard-tiles',
  LAYOUTS: 'dashboard-grid-layouts',
  INHERITANCE: 'dashboard-layout-inheritance',
  CUSTOM_LAYOUTS: 'dashboard-custom-layouts',
  LOCKED_TILES: 'dashboard-locked-tiles',
  LOCKED_POSITIONS: 'dashboard-locked-positions'
} as const;