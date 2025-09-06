import Highcharts from 'highcharts';
import { ChartType, ChartConfig } from './types';

export function getChartOptions(type: ChartType, config: ChartConfig, data: Record<string, unknown>): Highcharts.Options {
  const baseOptions: Highcharts.Options = {
    chart: {
      type: getHighchartsType(type),
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      spacing: [5, 5, 5, 5],
      reflow: true
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          enabled: false // Disable default context menu since we have our own export button
        }
      }
    },
    responsive: {
      rules: [
        {
          condition: { maxWidth: 200 },
          chartOptions: {
            legend: { 
              enabled: false  // Hide legend on very small tiles
            },
            xAxis: {
              labels: { 
                style: { fontSize: '8px' }
              }
            } as Highcharts.XAxisOptions,
            yAxis: {
              labels: { 
                style: { fontSize: '8px' }
              }
            } as Highcharts.YAxisOptions,
            tooltip: {
              style: { fontSize: '9px' }
            }
          }
        },
        {
          condition: { maxWidth: 300 },
          chartOptions: {
            legend: { 
              itemStyle: { fontSize: '8px' }
            },
            xAxis: {
              labels: { 
                style: { fontSize: '9px' }
              }
            } as Highcharts.XAxisOptions,
            yAxis: {
              labels: { 
                style: { fontSize: '9px' }
              }
            } as Highcharts.YAxisOptions,
            tooltip: {
              style: { fontSize: '10px' }
            }
          }
        },
        {
          condition: { maxWidth: 400 },
          chartOptions: {
            legend: { 
              itemStyle: { fontSize: '9px' }
            },
            xAxis: {
              labels: { 
                style: { fontSize: '10px' }
              }
            } as Highcharts.XAxisOptions,
            yAxis: {
              labels: { 
                style: { fontSize: '10px' }
              }
            } as Highcharts.YAxisOptions,
            tooltip: {
              style: { fontSize: '11px' }
            }
          }
        }
      ]
    },
    title: {
      text: undefined // We handle titles in the tile header
    },
    subtitle: {
      text: undefined
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: shouldShowLegend(type),
      align: 'center',
      verticalAlign: 'bottom',
      y: 0,
      itemStyle: {
        fontSize: '10px',
        fontWeight: '400',
        color: '#666666'
      },
      itemMarginHorizontal: 5,
      itemMarginVertical: 2
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderRadius: 6,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        offsetX: 0,
        offsetY: 2,
        opacity: 0.5,
        width: 8
      },
      style: {
        fontSize: '12px',
        color: '#2f2f2f'
      }
    },
    colors: [
      '#6e45e2', // Primary purple - exact brand color
      '#88d3ce', // Secondary teal
      '#ffd166', // Tertiary yellow
      '#e74c3c', // Red
      '#2ecc71', // Green
      '#3498db', // Blue
      '#f39c12', // Orange
      '#9b59b6', // Purple variant
      '#1abc9c', // Turquoise
      '#34495e'  // Dark gray
    ],
    plotOptions: {
      series: {
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    }
  };

  // Type-specific configurations
  switch (type) {
    case 'line':
    case 'spline':
    case 'areaspline':
      return {
        ...baseOptions,
        xAxis: {
          categories: data.categories,
          gridLineWidth: 0,
          tickColor: '#e0e0e0',
          lineColor: '#e0e0e0',
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        yAxis: {
          title: { text: undefined },
          gridLineColor: '#f0f0f0',
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        series: data.series,
        plotOptions: {
          ...baseOptions.plotOptions,
          line: {
            lineWidth: 3,
            marker: {
              radius: 4,
              fillColor: '#ffffff',
              lineWidth: 2,
              states: {
                hover: { radius: 6 }
              }
            }
          },
          spline: {
            lineWidth: 3,
            marker: {
              radius: 4,
              fillColor: '#ffffff',
              lineWidth: 2
            }
          }
        }
      };

    case 'area':
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'area'
        },
        xAxis: {
          categories: data.categories,
          gridLineWidth: 0,
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        yAxis: {
          title: { text: undefined },
          gridLineColor: '#f0f0f0',
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        series: data.series,
        plotOptions: {
          ...baseOptions.plotOptions,
          area: {
            fillOpacity: 0.3,
            lineWidth: 2,
            marker: {
              radius: 3
            },
            stacking: 'normal'
          }
        }
      };

    case 'column':
    case 'bar':
      return {
        ...baseOptions,
        xAxis: {
          categories: data.categories,
          gridLineWidth: 0,
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        yAxis: {
          title: { text: undefined },
          gridLineColor: '#f0f0f0',
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        series: data.series,
        plotOptions: {
          ...baseOptions.plotOptions,
          column: {
            borderRadius: 3,
            pointPadding: 0.1,
            groupPadding: 0.15
          },
          bar: {
            borderRadius: 3,
            pointPadding: 0.1,
            groupPadding: 0.15
          }
        }
      };

    case 'pie':
      return {
        ...baseOptions,
        responsive: {
          rules: [
            {
              condition: { maxWidth: 200 },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      enabled: false  // Hide labels on very small pies
                    }
                  }
                }
              }
            },
            {
              condition: { maxWidth: 300 },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      style: {
                        fontSize: '8px'
                      },
                      distance: 2
                    }
                  }
                }
              }
            },
            {
              condition: { maxWidth: 400 },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      style: {
                        fontSize: '9px'
                      },
                      distance: 3
                    }
                  }
                }
              }
            }
          ]
        },
        series: [{
          name: 'Share',
          data: data.series,
          type: 'pie'
        }],
        plotOptions: {
          ...baseOptions.plotOptions,
          pie: {
            innerSize: 0,
            size: '85%',
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.percentage:.1f}%',
              style: {
                fontSize: '10px',
                color: '#666666'
              },
              distance: 5
            }
          }
        }
      };

    case 'donut':
      return {
        ...baseOptions,
        responsive: {
          rules: [
            {
              condition: { maxWidth: 200 },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      enabled: false  // Hide labels on very small donuts
                    }
                  }
                }
              }
            },
            {
              condition: { maxWidth: 300 },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      style: {
                        fontSize: '8px'
                      }
                    }
                  }
                }
              }
            },
            {
              condition: { maxWidth: 400 },
              chartOptions: {
                plotOptions: {
                  pie: {
                    dataLabels: {
                      style: {
                        fontSize: '9px'
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        series: [{
          name: 'Share',
          data: data.series,
          type: 'pie'
        }],
        plotOptions: {
          ...baseOptions.plotOptions,
          pie: {
            innerSize: '60%',
            size: '85%',
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.percentage:.1f}%',
              style: {
                fontSize: '10px',
                color: '#666666'
              }
            }
          }
        }
      };

    case 'scatter':
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'scatter'
        },
        xAxis: {
          title: { text: undefined },
          gridLineColor: '#f0f0f0',
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        yAxis: {
          title: { text: undefined },
          gridLineColor: '#f0f0f0',
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        series: data.series,
        plotOptions: {
          ...baseOptions.plotOptions,
          scatter: {
            marker: {
              radius: 4,
              states: {
                hover: {
                  enabled: true,
                  lineColor: 'rgb(100,100,100)'
                }
              }
            }
          }
        }
      };

    case 'gauge':
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'solidgauge'
        },
        pane: {
          center: ['50%', '70%'],
          size: '100%',
          startAngle: -90,
          endAngle: 90,
          background: [{
            backgroundColor: '#f0f0f0',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc' as const
          }]
        },
        yAxis: {
          min: 0,
          max: 100,
          stops: [
            [0.1, '#ff6b6b'],
            [0.5, '#ffd166'],
            [0.9, '#88d3ce']
          ],
          lineWidth: 0,
          tickWidth: 0,
          minorTickInterval: undefined,
          tickAmount: 2,
          title: {
            y: -70,
            text: 'Performance'
          },
          labels: {
            y: 16,
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        } as Highcharts.YAxisOptions,
        series: data.series,
        plotOptions: {
          ...baseOptions.plotOptions,
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true,
              format: '<div style="text-align:center"><span style="font-size:20px;color:#2f2f2f">{y}%</span></div>'
            }
          }
        }
      };

    default:
      return {
        ...baseOptions,
        xAxis: {
          categories: data.categories || [],
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        yAxis: {
          title: { text: undefined },
          labels: {
            style: { fontSize: '11px', color: '#a0aec0' }
          }
        },
        series: data.series || []
      };
  }
}

function getHighchartsType(type: ChartType): string {
  const typeMap: Record<ChartType, string> = {
    'line': 'line',
    'spline': 'spline',
    'area': 'area',
    'areaspline': 'areaspline',
    'column': 'column',
    'bar': 'bar',
    'pie': 'pie',
    'donut': 'pie',
    'scatter': 'scatter',
    'bubble': 'bubble',
    'heatmap': 'heatmap',
    'treemap': 'treemap',
    'funnel': 'funnel',
    'gauge': 'solidgauge',
    'waterfall': 'waterfall'
  };
  
  return typeMap[type] || 'line';
}

function shouldShowLegend(type: ChartType): boolean {
  return !['pie', 'donut', 'gauge', 'treemap'].includes(type);
}