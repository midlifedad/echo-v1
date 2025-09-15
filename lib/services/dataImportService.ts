/**
 * Data Import Service
 * Orchestrates the data import process and generates tile configurations
 */

import { 
  ParsedData, 
  DataProfile, 
  ChartRecommendation,
  ImportMethod,
  ColumnAnalysis 
} from '@/lib/types/dataImport';
import { ChartType } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

interface ImportContext {
  parsedData: ParsedData;
  dataProfile: DataProfile;
  chartConfig: ChartRecommendation;
  importMethod: ImportMethod;
}

interface GeneratedTile {
  title: string;
  type: ChartType;
  data: any;
  config: any;
  metadata: {
    source: ImportMethod;
    columns: string[];
    rowCount: number;
    generatedAt: string;
  };
}

class DataImportService {
  /**
   * Generate a tile configuration from imported data
   */
  async generateTileFromData(context: ImportContext): Promise<GeneratedTile> {
    const { parsedData, dataProfile, chartConfig, importMethod } = context;
    
    try {
      logger.info('Generating tile from imported data', {
        chartType: chartConfig.chartType,
        rowCount: parsedData.data.length,
        columnCount: dataProfile.columnCount
      });

      // Generate title based on data
      const title = this.generateTitle(dataProfile, chartConfig);
      
      // Transform data for the specific chart type
      const chartData = this.transformDataForChart(
        parsedData,
        dataProfile,
        chartConfig
      );
      
      // Generate chart configuration
      const chartConfiguration = this.generateChartConfig(
        chartConfig,
        dataProfile
      );
      
      const tile: GeneratedTile = {
        title,
        type: chartConfig.chartType as ChartType,
        data: chartData,
        config: chartConfiguration,
        metadata: {
          source: importMethod,
          columns: dataProfile.columns.map(c => c.name),
          rowCount: parsedData.data.length,
          generatedAt: new Date().toISOString()
        }
      };
      
      logger.info('Tile generated successfully', { title, type: tile.type });
      
      return tile;
    } catch (error) {
      logger.error('Failed to generate tile', error);
      throw new Error(`Failed to generate tile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a meaningful title for the chart
   */
  private generateTitle(dataProfile: DataProfile, chartConfig: ChartRecommendation): string {
    // Try to find measure and dimension columns
    const measureColumn = dataProfile.columns.find(c => 
      c.suggestions?.possibleRoles?.includes('measure')
    );
    const dimensionColumn = dataProfile.columns.find(c => 
      c.suggestions?.possibleRoles?.includes('dimension')
    );
    const timeColumn = dataProfile.columns.find(c => 
      c.suggestions?.possibleRoles?.includes('time')
    );
    
    // Generate title based on columns and chart type
    if (chartConfig.chartType === 'line' && timeColumn && measureColumn) {
      return `${measureColumn.name} over ${timeColumn.name}`;
    }
    
    if (chartConfig.chartType === 'bar' && dimensionColumn && measureColumn) {
      return `${measureColumn.name} by ${dimensionColumn.name}`;
    }
    
    if (chartConfig.chartType === 'pie' && dimensionColumn) {
      return `${dimensionColumn.name} Distribution`;
    }
    
    if (chartConfig.chartType === 'scatter' && dataProfile.columns.length >= 2) {
      const [col1, col2] = dataProfile.columns;
      return `${col1.name} vs ${col2.name}`;
    }
    
    // Default title
    return `${chartConfig.chartType.charAt(0).toUpperCase() + chartConfig.chartType.slice(1)} Chart`;
  }

  /**
   * Transform raw data into chart-specific format
   */
  private transformDataForChart(
    parsedData: ParsedData,
    dataProfile: DataProfile,
    chartConfig: ChartRecommendation
  ): any {
    const { chartType } = chartConfig;
    
    switch (chartType) {
      case 'line':
        return this.transformToLineData(parsedData, dataProfile, chartConfig);
      
      case 'bar':
      case 'column':
        return this.transformToBarData(parsedData, dataProfile, chartConfig);
      
      case 'pie':
        return this.transformToPieData(parsedData, dataProfile, chartConfig);
      
      case 'scatter':
        return this.transformToScatterData(parsedData, dataProfile, chartConfig);
      
      case 'area':
        return this.transformToAreaData(parsedData, dataProfile, chartConfig);
      
      default:
        // Return raw data as fallback
        return parsedData.data;
    }
  }

  /**
   * Transform data for line chart
   */
  private transformToLineData(
    parsedData: ParsedData,
    dataProfile: DataProfile,
    chartConfig: ChartRecommendation
  ): any {
    // Find x-axis (time/category) and y-axis (measure) columns
    const xColumn = this.findColumnByRole(dataProfile, ['time', 'dimension']);
    const yColumn = this.findColumnByRole(dataProfile, ['measure']);
    
    if (!xColumn || !yColumn) {
      throw new Error('Unable to determine x and y columns for line chart');
    }
    
    // Create series data
    const categories = parsedData.data.map(row => row[xColumn.name]);
    const data = parsedData.data.map(row => {
      const value = row[yColumn.name];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });
    
    return {
      categories,
      series: [{
        name: yColumn.name,
        data
      }]
    };
  }

  /**
   * Transform data for bar/column chart
   */
  private transformToBarData(
    parsedData: ParsedData,
    dataProfile: DataProfile,
    chartConfig: ChartRecommendation
  ): any {
    const categoryColumn = this.findColumnByRole(dataProfile, ['dimension', 'categorical']);
    const valueColumn = this.findColumnByRole(dataProfile, ['measure']);
    
    if (!categoryColumn || !valueColumn) {
      throw new Error('Unable to determine category and value columns for bar chart');
    }
    
    // Aggregate data if needed
    const aggregated = this.aggregateData(
      parsedData.data,
      categoryColumn.name,
      valueColumn.name
    );
    
    return {
      categories: Object.keys(aggregated),
      series: [{
        name: valueColumn.name,
        data: Object.values(aggregated)
      }]
    };
  }

  /**
   * Transform data for pie chart
   */
  private transformToPieData(
    parsedData: ParsedData,
    dataProfile: DataProfile,
    chartConfig: ChartRecommendation
  ): any {
    const categoryColumn = this.findColumnByRole(dataProfile, ['dimension', 'categorical']);
    const valueColumn = this.findColumnByRole(dataProfile, ['measure']);
    
    if (!categoryColumn) {
      throw new Error('Unable to determine category column for pie chart');
    }
    
    let data: Array<{ name: string; y: number }>;
    
    if (valueColumn) {
      // Aggregate by category
      const aggregated = this.aggregateData(
        parsedData.data,
        categoryColumn.name,
        valueColumn.name
      );
      
      data = Object.entries(aggregated).map(([name, value]) => ({
        name,
        y: value
      }));
    } else {
      // Count occurrences
      const counts = this.countOccurrences(parsedData.data, categoryColumn.name);
      data = Object.entries(counts).map(([name, count]) => ({
        name,
        y: count
      }));
    }
    
    // Sort by value and limit to top 10
    data.sort((a, b) => b.y - a.y);
    if (data.length > 10) {
      const others = data.slice(10).reduce((sum, item) => sum + item.y, 0);
      data = data.slice(0, 10);
      if (others > 0) {
        data.push({ name: 'Others', y: others });
      }
    }
    
    return data;
  }

  /**
   * Transform data for scatter plot
   */
  private transformToScatterData(
    parsedData: ParsedData,
    dataProfile: DataProfile,
    chartConfig: ChartRecommendation
  ): any {
    // Find two numeric columns
    const numericColumns = dataProfile.columns.filter(c => c.dataType === 'number');
    
    if (numericColumns.length < 2) {
      throw new Error('Need at least two numeric columns for scatter plot');
    }
    
    const [xColumn, yColumn] = numericColumns;
    
    const data = parsedData.data
      .map(row => {
        const x = row[xColumn.name];
        const y = row[yColumn.name];
        
        if (typeof x === 'number' && typeof y === 'number') {
          return [x, y];
        }
        return null;
      })
      .filter(point => point !== null);
    
    return {
      series: [{
        name: `${xColumn.name} vs ${yColumn.name}`,
        data
      }]
    };
  }

  /**
   * Transform data for area chart
   */
  private transformToAreaData(
    parsedData: ParsedData,
    dataProfile: DataProfile,
    chartConfig: ChartRecommendation
  ): any {
    // Similar to line chart but with area styling
    return this.transformToLineData(parsedData, dataProfile, chartConfig);
  }

  /**
   * Generate chart configuration
   */
  private generateChartConfig(
    chartConfig: ChartRecommendation,
    dataProfile: DataProfile
  ): any {
    const baseConfig = {
      chart: {
        type: chartConfig.chartType
      },
      title: {
        text: null // Title is handled separately
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      }
    };
    
    // Add chart-specific configuration
    switch (chartConfig.chartType) {
      case 'pie':
        return {
          ...baseConfig,
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f}%'
              },
              showInLegend: true
            }
          }
        };
      
      case 'line':
      case 'area':
        return {
          ...baseConfig,
          xAxis: {
            type: 'category'
          },
          yAxis: {
            title: {
              text: null
            }
          },
          plotOptions: {
            area: {
              fillOpacity: 0.3
            }
          }
        };
      
      case 'bar':
      case 'column':
        return {
          ...baseConfig,
          xAxis: {
            type: 'category'
          },
          yAxis: {
            title: {
              text: null
            }
          },
          plotOptions: {
            series: {
              borderRadius: 3
            }
          }
        };
      
      case 'scatter':
        return {
          ...baseConfig,
          xAxis: {
            title: {
              enabled: true
            }
          },
          yAxis: {
            title: {
              enabled: true
            }
          },
          plotOptions: {
            scatter: {
              marker: {
                radius: 5,
                states: {
                  hover: {
                    enabled: true
                  }
                }
              }
            }
          }
        };
      
      default:
        return baseConfig;
    }
  }

  /**
   * Helper: Find column by role
   */
  private findColumnByRole(
    dataProfile: DataProfile,
    roles: string[]
  ): ColumnAnalysis | undefined {
    return dataProfile.columns.find(column =>
      column.suggestions?.possibleRoles?.some(role => roles.includes(role))
    );
  }

  /**
   * Helper: Aggregate data by category
   */
  private aggregateData(
    data: any[],
    categoryField: string,
    valueField: string,
    aggregation: 'sum' | 'avg' | 'count' = 'sum'
  ): Record<string, number> {
    const grouped: Record<string, number[]> = {};
    
    for (const row of data) {
      const category = String(row[categoryField] || 'Unknown');
      const value = parseFloat(row[valueField]) || 0;
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(value);
    }
    
    const result: Record<string, number> = {};
    
    for (const [category, values] of Object.entries(grouped)) {
      switch (aggregation) {
        case 'sum':
          result[category] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[category] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          result[category] = values.length;
          break;
      }
    }
    
    return result;
  }

  /**
   * Helper: Count occurrences
   */
  private countOccurrences(data: any[], field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const row of data) {
      const value = String(row[field] || 'Unknown');
      counts[value] = (counts[value] || 0) + 1;
    }
    
    return counts;
  }
}

// Export singleton instance
export const dataImportService = new DataImportService();