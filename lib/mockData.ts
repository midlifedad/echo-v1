import { ChartType } from './types';

export function generateMockData(type: ChartType): Record<string, unknown> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories = ['Google', 'Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube'];
  
  switch (type) {
    case 'line':
    case 'spline':
    case 'areaspline':
      return {
        categories: months.slice(0, 6),
        series: [{
          name: 'Revenue',
          data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100000) + 10000)
        }]
      };

    case 'area':
      return {
        categories: months.slice(0, 8),
        series: [
          {
            name: 'Organic Traffic',
            data: Array.from({ length: 8 }, () => Math.floor(Math.random() * 5000) + 1000)
          },
          {
            name: 'Paid Traffic',
            data: Array.from({ length: 8 }, () => Math.floor(Math.random() * 3000) + 500)
          }
        ]
      };

    case 'column':
    case 'bar':
      return {
        categories: months.slice(0, 6),
        series: [
          {
            name: 'Sales',
            data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 50000) + 5000)
          },
          {
            name: 'Leads',
            data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000) + 100)
          }
        ]
      };

    case 'pie':
    case 'donut':
      return {
        series: categories.slice(0, 5).map(name => ({
          name,
          y: Math.floor(Math.random() * 100) + 10
        }))
      };

    case 'scatter':
      return {
        series: [{
          name: 'Correlation',
          data: Array.from({ length: 20 }, () => [
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
          ])
        }]
      };

    case 'bubble':
      return {
        series: [{
          name: 'Campaigns',
          data: Array.from({ length: 10 }, () => [
            Math.floor(Math.random() * 100) + 10,
            Math.floor(Math.random() * 100) + 10,
            Math.floor(Math.random() * 50) + 5
          ])
        }]
      };

    case 'heatmap':
      return {
        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        yCategories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        series: [{
          name: 'Activity',
          data: Array.from({ length: 20 }, (_, i) => [
            i % 4,
            Math.floor(i / 4),
            Math.floor(Math.random() * 100)
          ])
        }]
      };

    case 'treemap':
      return {
        series: [{
          name: 'Revenue by Channel',
          data: categories.slice(0, 6).map((name, i) => ({
            name,
            value: Math.floor(Math.random() * 10000) + 1000,
            colorValue: i
          }))
        }]
      };

    case 'funnel':
      return {
        series: [{
          name: 'Conversion Funnel',
          data: [
            ['Impressions', 50000],
            ['Clicks', 8500],
            ['Leads', 2100],
            ['Opportunities', 420],
            ['Customers', 84]
          ]
        }]
      };

    case 'gauge':
      return {
        series: [{
          name: 'Performance',
          data: [Math.floor(Math.random() * 100)]
        }]
      };

    case 'waterfall':
      return {
        categories: ['Start', 'Q1', 'Q2', 'Q3', 'Q4', 'End'],
        series: [{
          name: 'Revenue',
          data: [
            { y: 100000, isSum: true },
            { y: 15000 },
            { y: -8000 },
            { y: 12000 },
            { y: -5000 },
            { y: 114000, isSum: true }
          ]
        }]
      };

    default:
      return {
        categories: months.slice(0, 6),
        series: [{
          name: 'Data',
          data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100))
        }]
      };
  }
}