/**
 * Column Mapper Service
 * Intelligent column mapping for CSV/spreadsheet data import
 */

import * as ss from 'simple-statistics';
import { 
  ColumnAnalysis, 
  DataType, 
  ColumnStatistics, 
  ColumnPatterns,
  DataQuality,
  ColumnSuggestions,
  ColumnRole,
  DataTransformation,
  CleaningOperation,
  AggregationOption,
  ColumnMapping,
  DataProfile,
  DataShape,
  DataRelationship,
  ChartRecommendation,
  MappingSuggestion,
  ChartMappingResult,
  COMMON_PATTERNS,
  TYPE_PATTERNS,
  CHART_COMPATIBILITY
} from '@/lib/types/dataImport';
import { ChartType } from '@/lib/types';

export class ColumnMapper {
  /**
   * Analyze a single column of data
   */
  analyzeColumn(
    columnData: any[], 
    columnName: string, 
    columnIndex: number
  ): ColumnAnalysis {
    const dataType = this.detectDataType(columnData);
    const patterns = this.detectPatterns(columnData, columnName, dataType);
    const statistics = this.calculateStatistics(columnData, dataType);
    const quality = this.assessDataQuality(columnData, dataType);
    const suggestions = this.generateSuggestions(columnName, dataType, patterns, statistics, columnData);

    return {
      name: columnName,
      index: columnIndex,
      dataType,
      subType: this.detectSubType(columnData, dataType),
      statistics,
      patterns,
      quality,
      suggestions
    };
  }

  /**
   * Detect the primary data type of a column
   */
  private detectDataType(columnData: any[]): DataType {
    const nonNullData = columnData.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullData.length === 0) return 'unknown';

    const types: Record<DataType, number> = {
      string: 0,
      number: 0,
      date: 0,
      boolean: 0,
      categorical: 0,
      mixed: 0,
      unknown: 0
    };

    for (const value of nonNullData) {
      // Check if value is already a number type
      if (typeof value === 'number' && !isNaN(value)) {
        types.number++;
        continue;
      }
      
      const strValue = String(value).trim();
      
      if (this.isBoolean(strValue)) {
        types.boolean++;
      } else if (this.isDate(strValue)) {
        types.date++;
      } else if (this.isNumber(strValue)) {
        types.number++;
      } else {
        types.string++;
      }
    }

    // Determine primary type based on majority
    const total = nonNullData.length;
    const threshold = 0.8; // 80% consistency required

    if (types.number / total >= threshold) return 'number';
    if (types.date / total >= threshold) return 'date';
    if (types.boolean / total >= threshold) return 'boolean';
    
    // Check if categorical (limited unique values)
    const uniqueCount = new Set(nonNullData).size;
    if (uniqueCount <= 20 && uniqueCount / total <= 0.5) {
      return 'categorical';
    }
    
    if (types.string / total >= threshold) return 'string';
    
    return 'mixed';
  }

  /**
   * Detect sub-type within a data type
   */
  private detectSubType(columnData: any[], dataType: DataType): string | undefined {
    const nonNullData = columnData.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullData.length === 0) return undefined;

    // First check string values for patterns
    const stringValues = nonNullData.map(v => String(v).trim());
    
    // Check for currency pattern (can be in string format)
    if (stringValues.some(v => TYPE_PATTERNS.CURRENCY.test(v))) return 'currency';
    
    // Check for percentage pattern (can be in string format)
    if (stringValues.some(v => TYPE_PATTERNS.PERCENTAGE.test(v))) return 'percentage';

    switch (dataType) {
      case 'string':
        // Check for specific string patterns
        const sampleStr = stringValues.slice(0, 100);
        
        if (sampleStr.every(v => TYPE_PATTERNS.EMAIL.test(v))) return 'email';
        if (sampleStr.every(v => TYPE_PATTERNS.URL.test(v))) return 'url';
        if (sampleStr.every(v => TYPE_PATTERNS.PHONE.test(v))) return 'phone';
        break;
        
      case 'number':
        // Check if all integers
        const numbers = nonNullData
          .map(v => typeof v === 'number' ? v : Number(v))
          .filter(n => !isNaN(n));
        
        if (numbers.length > 0 && numbers.every(n => Number.isInteger(n))) {
          return 'integer';
        }
        
        return 'decimal';
    }
    
    return undefined;
  }

  /**
   * Detect patterns in column data
   */
  private detectPatterns(
    columnData: any[], 
    columnName: string,
    dataType: DataType
  ): ColumnPatterns {
    const nonNullData = columnData.filter(v => v !== null && v !== undefined && v !== '');
    const subType = this.detectSubType(columnData, dataType);
    
    return {
      isTimeSeries: this.isTimeSeries(nonNullData, dataType),
      isIdentifier: this.isIdentifier(nonNullData, columnName),
      isCategorical: dataType === 'categorical',
      isNumeric: dataType === 'number',
      isCurrency: subType === 'currency',
      isPercentage: subType === 'percentage',
      isEmail: subType === 'email',
      isURL: subType === 'url',
      isPhone: subType === 'phone',
      hasSequentialPattern: this.hasSequentialPattern(nonNullData, dataType),
      dateFormat: dataType === 'date' ? this.detectDateFormat(nonNullData) : undefined,
      numberFormat: dataType === 'number' ? this.detectNumberFormat(nonNullData) : undefined
    };
  }

  /**
   * Calculate statistics for a column
   */
  private calculateStatistics(columnData: any[], dataType: DataType): ColumnStatistics {
    const nonNullData = columnData.filter(v => v !== null && v !== undefined);
    const nonEmptyData = nonNullData.filter(v => v !== '');
    
    const stats: ColumnStatistics = {
      count: columnData.length,
      uniqueCount: new Set(nonNullData).size,
      nullCount: columnData.length - nonNullData.length,
      emptyCount: nonNullData.length - nonEmptyData.length
    };

    if (dataType === 'number' && nonEmptyData.length > 0) {
      const numbers = nonEmptyData.map(v => Number(v)).filter(n => !isNaN(n));
      
      if (numbers.length > 0) {
        stats.min = ss.min(numbers);
        stats.max = ss.max(numbers);
        stats.mean = ss.mean(numbers);
        stats.median = ss.median(numbers);
        stats.stdDev = numbers.length > 1 ? ss.standardDeviation(numbers) : 0;
        stats.sum = ss.sum(numbers);
      }
    }

    if (dataType === 'categorical' || stats.uniqueCount <= 20) {
      // Calculate top values
      const valueCounts = new Map<any, number>();
      for (const value of nonEmptyData) {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      }
      
      const sortedValues = Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      stats.topValues = sortedValues.map(([value, count]) => ({
        value,
        count,
        percentage: count / nonEmptyData.length
      }));
      
      if (sortedValues.length > 0) {
        stats.mode = sortedValues[0][0];
      }
    }

    if (dataType === 'date' && nonEmptyData.length > 0) {
      const dates = nonEmptyData
        .map(v => new Date(v))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (dates.length > 0) {
        stats.earliestDate = dates[0];
        stats.latestDate = dates[dates.length - 1];
        stats.dateRange = Math.ceil(
          (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    return stats;
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(columnData: any[], dataType: DataType): DataQuality {
    const nonNullData = columnData.filter(v => v !== null && v !== undefined && v !== '');
    const issues: string[] = [];
    const outliers: any[] = [];

    // Calculate completeness
    const completeness = nonNullData.length / columnData.length;
    if (completeness < 0.8) {
      issues.push(`${Math.round((1 - completeness) * 100)}% missing values`);
    }

    // Calculate consistency
    let consistency = 1;
    if (dataType === 'mixed') {
      consistency = 0.5;
      issues.push('Mixed data types detected');
    }

    // Calculate validity
    let validity = 1;
    if (dataType === 'number') {
      const numbers = nonNullData.map(v => Number(v)).filter(n => !isNaN(n));
      validity = numbers.length / nonNullData.length;
      
      // Detect outliers using IQR method
      if (numbers.length > 4) {
        const q1 = ss.quantile(numbers, 0.25);
        const q3 = ss.quantile(numbers, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        numbers.forEach((value, index) => {
          if (value < lowerBound || value > upperBound) {
            outliers.push({
              index,
              value,
              reason: value < lowerBound ? 'Below lower bound' : 'Above upper bound'
            });
          }
        });
        
        if (outliers.length > 0) {
          issues.push(`${outliers.length} potential outliers detected`);
        }
      }
    }

    // Calculate uniqueness
    const uniqueness = new Set(nonNullData).size / nonNullData.length;

    return {
      completeness,
      consistency,
      validity,
      uniqueness,
      outliers: outliers.slice(0, 10), // Limit to 10 outliers
      issues
    };
  }

  /**
   * Generate suggestions for column usage
   */
  private generateSuggestions(
    columnName: string,
    dataType: DataType,
    patterns: ColumnPatterns,
    statistics: ColumnStatistics,
    columnData?: any[]
  ): ColumnSuggestions {
    const possibleRoles: ColumnRole[] = [];
    const recommendedTransformations: DataTransformation[] = [];
    const cleaningOperations: CleaningOperation[] = [];
    const aggregationOptions: AggregationOption[] = [];
    
    const nonNullData = columnData ? columnData.filter(v => v !== null && v !== undefined && v !== '') : [];

    // Determine possible roles based on patterns and name
    if (patterns.isTimeSeries || dataType === 'date') {
      possibleRoles.push('time');
    }
    
    if (dataType === 'number') {
      // Check if this looks like a measure based on name and not being an identifier
      const looksLikeMeasure = !patterns.isIdentifier || 
        COMMON_PATTERNS.MEASURE.patterns.some(p => p.test(columnName));
      
      if (looksLikeMeasure) {
        possibleRoles.push('measure');
        
        // Add aggregation options for numeric data
        aggregationOptions.push(
          { type: 'sum', applicable: true, description: 'Sum of values' },
          { type: 'average', applicable: true, description: 'Average value' },
          { type: 'min', applicable: true, description: 'Minimum value' },
          { type: 'max', applicable: true, description: 'Maximum value' },
          { type: 'count', applicable: true, description: 'Count of values' }
        );
      }
      
      if (patterns.isIdentifier) {
        possibleRoles.push('id');
      }
    }
    
    if (dataType === 'categorical' || patterns.isCategorical) {
      possibleRoles.push('dimension');
    }
    
    if (dataType === 'string' && !patterns.isIdentifier) {
      possibleRoles.push('label');
    }

    // Check column name patterns
    for (const [patternName, patternDef] of Object.entries(COMMON_PATTERNS)) {
      if (patternDef.patterns.some(pattern => pattern.test(columnName))) {
        if (!possibleRoles.includes(patternDef.role)) {
          possibleRoles.push(patternDef.role);
        }
      }
    }

    // Suggest transformations
    if (dataType === 'string') {
      // Check if string values are actually numbers
      const canBeNumber = nonNullData.some(v => {
        const str = String(v).trim();
        return this.isNumber(str) && !this.isDate(str);
      });
      
      if (canBeNumber) {
        recommendedTransformations.push({
          type: 'parse_number',
          description: 'Convert string to number'
        });
      }
      
      if (this.couldBeDate(columnName)) {
        recommendedTransformations.push({
          type: 'parse_date',
          description: 'Parse as date'
        });
      }
    }

    // Suggest cleaning operations
    if (statistics.nullCount > 0) {
      cleaningOperations.push({
        type: 'remove_nulls',
        description: 'Remove null values',
        affectedRows: statistics.nullCount
      });
    }
    
    if (statistics.uniqueCount < statistics.count) {
      cleaningOperations.push({
        type: 'remove_duplicates',
        description: 'Remove duplicate values',
        affectedRows: statistics.count - statistics.uniqueCount
      });
    }

    return {
      possibleRoles,
      recommendedTransformations,
      cleaningOperations,
      aggregationOptions
    };
  }

  /**
   * Create a complete data profile from parsed data
   */
  analyzeDataset(
    headers: string[],
    rows: Record<string, any>[]
  ): DataProfile {
    const columns: ColumnAnalysis[] = [];
    const columnData: Map<string, any[]> = new Map();

    // Extract column data
    headers.forEach(header => {
      columnData.set(header, rows.map(row => row[header]));
    });

    // Analyze each column
    headers.forEach((header, index) => {
      const analysis = this.analyzeColumn(
        columnData.get(header) || [],
        header,
        index
      );
      columns.push(analysis);
    });

    // Detect relationships
    const relationships = this.detectRelationships(columns, columnData);

    // Determine data shape
    const dataShape = this.determineDataShape(columns, relationships);

    // Generate chart recommendations
    const chartRecommendations = this.recommendCharts(columns, dataShape, relationships);

    // Calculate overall quality
    const overallQuality = this.calculateOverallQuality(columns);

    return {
      columns,
      rowCount: rows.length,
      columnCount: headers.length,
      dataShape,
      relationships,
      chartRecommendations,
      overallQuality
    };
  }

  /**
   * Detect relationships between columns
   */
  private detectRelationships(
    columns: ColumnAnalysis[],
    columnData: Map<string, any[]>
  ): DataRelationship[] {
    const relationships: DataRelationship[] = [];

    // Check for correlations between numeric columns
    const numericColumns = columns.filter(c => c.dataType === 'number');
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1Data = columnData.get(numericColumns[i].name) || [];
        const col2Data = columnData.get(numericColumns[j].name) || [];
        
        const correlation = this.calculateCorrelation(col1Data, col2Data);
        
        if (Math.abs(correlation) > 0.5) {
          relationships.push({
            column1: numericColumns[i].name,
            column2: numericColumns[j].name,
            type: 'correlation',
            strength: Math.abs(correlation),
            description: correlation > 0 ? 'Positive correlation' : 'Negative correlation'
          });
        }
      }
    }

    // Check for time series relationships
    const timeColumns = columns.filter(c => c.patterns?.isTimeSeries || c.dataType === 'date');
    const measureColumns = columns.filter(c => c.suggestions?.possibleRoles.includes('measure'));
    
    if (timeColumns.length > 0 && measureColumns.length > 0) {
      relationships.push({
        column1: timeColumns[0].name,
        column2: measureColumns[0].name,
        type: 'grouping',
        strength: 0.8,
        description: 'Time series relationship'
      });
    }

    return relationships;
  }

  /**
   * Determine the overall shape of the data
   */
  private determineDataShape(
    columns: ColumnAnalysis[],
    relationships: DataRelationship[]
  ): DataShape {
    const hasTimeColumn = columns.some(c => c.patterns?.isTimeSeries || c.dataType === 'date');
    const hasMeasures = columns.some(c => c.suggestions?.possibleRoles.includes('measure'));
    const hasDimensions = columns.some(c => c.suggestions?.possibleRoles.includes('dimension'));
    
    // Only return time_series if we have both time AND measures
    if (hasTimeColumn && hasMeasures) {
      return 'time_series';
    }
    
    // Cross-sectional needs dimensions and measures without time
    if (hasDimensions && hasMeasures && !hasTimeColumn) {
      return 'cross_sectional';
    }
    
    // Matrix only if ALL columns are numeric
    if (columns.length > 1 && columns.every(c => c.dataType === 'number')) {
      return 'matrix';
    }
    
    // Default to list for single columns or mixed types
    return 'list';
  }

  /**
   * Recommend charts based on data analysis
   */
  private recommendCharts(
    columns: ColumnAnalysis[],
    dataShape: DataShape,
    relationships: DataRelationship[]
  ): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = [];
    
    const timeColumns = columns.filter(c => c.suggestions?.possibleRoles.includes('time'));
    const measureColumns = columns.filter(c => c.suggestions?.possibleRoles.includes('measure'));
    const dimensionColumns = columns.filter(c => c.suggestions?.possibleRoles.includes('dimension'));

    // Line chart for time series
    if (timeColumns.length > 0 && measureColumns.length > 0) {
      recommendations.push({
        chartType: 'line',
        confidence: 0.9,
        reason: 'Time series data detected',
        mapping: {
          sourceColumn: timeColumns[0].name,
          targetRole: 'time',
          chartDataField: 'x'
        }
      });
    }

    // Bar chart for categorical comparisons
    if (dimensionColumns.length > 0 && measureColumns.length > 0) {
      recommendations.push({
        chartType: 'bar',
        confidence: 0.85,
        reason: 'Categorical data with measures',
        mapping: {
          sourceColumn: dimensionColumns[0].name,
          targetRole: 'dimension',
          chartDataField: 'category'
        }
      });
    }

    // Pie chart for composition
    if (dimensionColumns.length === 1 && measureColumns.length === 1) {
      const dimension = dimensionColumns[0];
      if (dimension.statistics && dimension.statistics.uniqueCount <= 10) {
        recommendations.push({
          chartType: 'pie',
          confidence: 0.75,
          reason: 'Limited categories suitable for composition view',
          mapping: {
            sourceColumn: dimension.name,
            targetRole: 'dimension',
            chartDataField: 'category'
          }
        });
      }
    }

    // Scatter plot for correlations
    if (measureColumns.length >= 2) {
      const correlation = relationships.find(r => r.type === 'correlation');
      if (correlation) {
        recommendations.push({
          chartType: 'scatter',
          confidence: correlation.strength,
          reason: `Correlation detected between ${correlation.column1} and ${correlation.column2}`,
          mapping: {
            sourceColumn: correlation.column1,
            targetRole: 'measure',
            chartDataField: 'x'
          }
        });
      }
    }

    // Sort by confidence
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate overall data quality score
   */
  private calculateOverallQuality(columns: ColumnAnalysis[]): number {
    if (columns.length === 0) return 0;
    
    const qualityScores = columns.map(col => {
      if (!col.quality) return 0;
      
      return (
        col.quality.completeness * 0.4 +
        col.quality.consistency * 0.3 +
        col.quality.validity * 0.2 +
        col.quality.uniqueness * 0.1
      );
    });
    
    return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  }

  /**
   * Generate mapping suggestions for charts
   */
  suggestMappings(
    dataProfile: DataProfile,
    targetChartType?: ChartType
  ): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    
    // If no target chart type, use recommendations
    if (!targetChartType) {
      dataProfile.chartRecommendations.forEach(rec => {
        const mapping = this.createMappingForChart(
          rec.chartType as ChartType,
          dataProfile.columns
        );
        
        if (mapping) {
          suggestions.push({
            confidence: rec.confidence,
            reasoning: rec.reason,
            mapping: mapping.mappings[0],
            alternativeMappings: mapping.mappings.slice(1)
          });
        }
      });
    } else {
      // Create specific mapping for target chart type
      const mapping = this.createMappingForChart(targetChartType, dataProfile.columns);
      
      if (mapping) {
        suggestions.push({
          confidence: 0.8,
          reasoning: `Mapping for ${targetChartType} chart`,
          mapping: mapping.mappings[0],
          alternativeMappings: mapping.mappings.slice(1)
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Create mapping for specific chart type
   */
  private createMappingForChart(
    chartType: ChartType,
    columns: ColumnAnalysis[]
  ): ChartMappingResult | null {
    const compatibility = CHART_COMPATIBILITY[chartType as keyof typeof CHART_COMPATIBILITY];
    
    if (!compatibility) return null;
    
    const mappings: ColumnMapping[] = [];
    const warnings: string[] = [];
    
    // Find columns for required roles
    for (const role of compatibility.requiredRoles) {
      const column = columns.find(c => 
        c.suggestions?.possibleRoles.includes(role as ColumnRole)
      );
      
      if (column) {
        mappings.push({
          sourceColumn: column.name,
          targetRole: role as ColumnRole,
          chartDataField: this.getChartDataField(role as ColumnRole, chartType)
        });
      } else {
        warnings.push(`No suitable column found for ${role}`);
      }
    }
    
    if (warnings.length > 0 && warnings.length >= compatibility.requiredRoles.length) {
      return null;
    }
    
    return {
      chartType,
      mappings,
      dataTransformations: [],
      warnings
    };
  }

  /**
   * Get chart data field for a role
   */
  private getChartDataField(
    role: ColumnRole,
    chartType: ChartType
  ): 'x' | 'y' | 'z' | 'value' | 'category' | 'series' | 'size' | 'color' | undefined {
    switch (role) {
      case 'time':
        return 'x';
      case 'measure':
        return chartType === 'scatter' || chartType === 'bubble' ? 'y' : 'value';
      case 'dimension':
        return 'category';
      default:
        return undefined;
    }
  }

  // Helper methods
  private isBoolean(value: string): boolean {
    return TYPE_PATTERNS.BOOLEAN.test(value);
  }

  private isDate(value: string): boolean {
    // Check common date patterns first
    if (TYPE_PATTERNS.DATE.some(pattern => pattern.test(value))) {
      return true;
    }
    
    // Don't treat plain numbers as dates
    if (/^\d+$/.test(value)) {
      return false;
    }
    
    // Check if parseable as date
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      // Make sure it's a reasonable date (not just a number)
      const date = new Date(parsed);
      const year = date.getFullYear();
      return year >= 1900 && year <= 2100;
    }
    
    return false;
  }

  private isNumber(value: string): boolean {
    return TYPE_PATTERNS.NUMBER.test(value) || !isNaN(Number(value));
  }

  private isTimeSeries(data: any[], dataType: DataType): boolean {
    if (dataType !== 'date') return false;
    
    // Check if dates are sequential
    const dates = data
      .map(v => new Date(v))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length < 2) return false;
    
    // Check for regular intervals
    const intervals = [];
    for (let i = 1; i < Math.min(dates.length, 10); i++) {
      intervals.push(dates[i].getTime() - dates[i - 1].getTime());
    }
    
    // Check if intervals are consistent (with 10% tolerance)
    const avgInterval = ss.mean(intervals);
    const stdInterval = ss.standardDeviation(intervals);
    
    return stdInterval / avgInterval < 0.1;
  }

  private isIdentifier(data: any[], columnName: string): boolean {
    // Check if column name suggests identifier
    if (COMMON_PATTERNS.IDENTIFIER.patterns.some(p => p.test(columnName))) {
      return true;
    }
    
    // Check if all values are unique
    const uniqueCount = new Set(data).size;
    return uniqueCount === data.length;
  }

  private hasSequentialPattern(data: any[], dataType: DataType): boolean {
    if (dataType !== 'number') return false;
    
    const numbers = data
      .map(v => Number(v))
      .filter(n => !isNaN(n))
      .slice(0, 20);
    
    if (numbers.length < 3) return false;
    
    // Check for arithmetic sequence
    const differences = [];
    for (let i = 1; i < numbers.length; i++) {
      differences.push(numbers[i] - numbers[i - 1]);
    }
    
    const uniqueDiffs = new Set(differences);
    return uniqueDiffs.size === 1;
  }

  private detectDateFormat(data: any[]): string {
    const sample = data.slice(0, 10).map(v => String(v));
    
    for (const [format, pattern] of Object.entries({
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'DD-MM-YYYY': /^\d{2}-\d{2}-\d{4}$/,
      'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/
    })) {
      if (sample.every(v => (pattern as RegExp).test(v))) {
        return format;
      }
    }
    
    return 'auto';
  }

  private detectNumberFormat(data: any[]): string {
    const sample = data.slice(0, 10).map(v => String(v));
    
    if (sample.some(v => v.includes(','))) return 'comma-separated';
    if (sample.some(v => v.includes('.'))) return 'decimal';
    return 'integer';
  }

  private couldBeDate(columnName: string): boolean {
    return COMMON_PATTERNS.TIME.patterns.some(p => p.test(columnName));
  }

  private calculateCorrelation(data1: any[], data2: any[]): number {
    const nums1 = data1.map(v => Number(v)).filter(n => !isNaN(n));
    const nums2 = data2.map(v => Number(v)).filter(n => !isNaN(n));
    
    if (nums1.length !== nums2.length || nums1.length < 2) return 0;
    
    try {
      return ss.sampleCorrelation(nums1, nums2);
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const columnMapper = new ColumnMapper();