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
    id: 'editor',
    label: 'Editor',
    icon: 'Edit3',
    href: '/editor'
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