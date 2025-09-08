import type { ChartType } from './types';

export function generateSampleData(type: ChartType): any {
  switch (type) {
    case 'line':
    case 'spline':
      return {
        series: [
          {
            name: 'Revenue',
            data: [30000, 35000, 32000, 38000, 40000, 42000, 45000, 48000, 52000, 55000, 58000, 60000]
          },
          {
            name: 'Costs',
            data: [20000, 22000, 21000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 31000]
          }
        ],
        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
      };

    case 'area':
    case 'areaspline':
      return {
        series: [
          {
            name: 'Organic Traffic',
            data: [1000, 1200, 1100, 1400, 1600, 1500, 1800, 2000, 2200, 2100, 2400, 2600]
          },
          {
            name: 'Paid Traffic',
            data: [500, 600, 550, 700, 800, 750, 900, 1000, 1100, 1050, 1200, 1300]
          }
        ],
        xAxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
      };

    case 'column':
      return {
        series: [
          {
            name: 'Sales',
            data: [150, 230, 180, 290, 210, 160, 200, 250]
          },
          {
            name: 'Leads',
            data: [300, 460, 360, 580, 420, 320, 400, 500]
          }
        ],
        xAxis: {
          categories: ['Q1 Week 1', 'Q1 Week 2', 'Q1 Week 3', 'Q1 Week 4', 'Q2 Week 1', 'Q2 Week 2', 'Q2 Week 3', 'Q2 Week 4']
        }
      };

    case 'bar':
      return {
        series: [
          {
            name: 'Performance',
            data: [85, 92, 78, 88, 95]
          }
        ],
        xAxis: {
          categories: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
        }
      };

    case 'pie':
    case 'donut':
      return {
        series: [{
          name: 'Share',
          data: [
            { name: 'Direct', y: 35.5 },
            { name: 'Social Media', y: 25.2 },
            { name: 'Email', y: 20.8 },
            { name: 'Referral', y: 12.3 },
            { name: 'Other', y: 6.2 }
          ]
        }]
      };

    case 'scatter':
      return {
        series: [{
          name: 'Data Points',
          data: Array.from({ length: 20 }, () => [
            Math.random() * 100,
            Math.random() * 100
          ])
        }]
      };

    case 'bubble':
      return {
        series: [{
          name: 'Bubble Data',
          data: Array.from({ length: 10 }, () => [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 50 + 10
          ])
        }]
      };

    case 'gauge':
      return {
        series: [{
          name: 'Performance',
          data: [Math.floor(Math.random() * 100)]
        }],
        yAxis: {
          min: 0,
          max: 100,
          stops: [
            [0.1, '#DF5353'], // red
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#55BF3B']  // green
          ]
        }
      };

    case 'heatmap':
      return {
        series: [{
          name: 'Heatmap Data',
          data: Array.from({ length: 50 }, (_, i) => [
            i % 10,
            Math.floor(i / 10),
            Math.random() * 100
          ])
        }]
      };

    case 'treemap':
      return {
        series: [{
          name: 'Tree',
          data: [
            { name: 'Category A', value: 35 },
            { name: 'Category B', value: 25 },
            { name: 'Category C', value: 20 },
            { name: 'Category D', value: 15 },
            { name: 'Category E', value: 5 }
          ]
        }]
      };

    case 'funnel':
      return {
        series: [{
          name: 'Funnel',
          data: [
            ['Visits', 1000],
            ['Cart', 500],
            ['Checkout', 300],
            ['Purchase', 150],
            ['Retention', 50]
          ]
        }]
      };

    case 'waterfall':
      return {
        series: [{
          name: 'Waterfall',
          data: [
            { name: 'Start', y: 1000 },
            { name: 'Product Revenue', y: 500 },
            { name: 'Service Revenue', y: 300 },
            { name: 'Fixed Costs', y: -400 },
            { name: 'Variable Costs', y: -200 },
            { name: 'Net', isSum: true }
          ]
        }]
      };

    default:
      return {
        series: [{
          name: 'Sample Data',
          data: [10, 20, 30, 40, 50]
        }],
        xAxis: {
          categories: ['A', 'B', 'C', 'D', 'E']
        }
      };
  }
}