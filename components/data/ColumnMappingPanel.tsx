import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  ScatterChart,
  LineChart,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { sanitizeText } from '@/lib/utils/domSanitizer';
import type {
  DataProfile,
  ParsedData,
  ChartRecommendation,
  ColumnAnalysis
} from '@/lib/types/dataImport';

interface ColumnMappingPanelProps {
  dataProfile: DataProfile;
  parsedData: ParsedData;
  selectedChart: ChartRecommendation | null;
  onChartSelect: (chart: ChartRecommendation) => void;
  onConfirm: (chart: ChartRecommendation) => void;
  onBack: () => void;
  isProcessing?: boolean;
  error?: string | null;
}

const CHART_ICONS = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  scatter: ScatterChart,
  area: TrendingUp,
  column: BarChart3,
};

export default function ColumnMappingPanel({
  dataProfile,
  parsedData,
  selectedChart,
  onChartSelect,
  onConfirm,
  onBack,
  isProcessing = false,
  error = null
}: ColumnMappingPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'number': return '123';
      case 'date': return '📅';
      case 'string': return 'Abc';
      case 'boolean': return '✓✗';
      case 'categorical': return '🏷️';
      default: return '?';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleChartSelect = (chart: ChartRecommendation) => {
    onChartSelect(chart);
  };

  const handleConfirm = () => {
    if (selectedChart) {
      onConfirm(selectedChart);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Column Analysis & Chart Selection</h3>
        <p className="text-sm text-muted-foreground">
          We've analyzed your data and found the best ways to visualize it. Select a chart type to continue.
        </p>
      </div>

      {/* Data Quality Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Data Quality Score</span>
            <span className={`text-2xl font-bold ${getQualityColor(dataProfile.overallQuality)}`}>
              {Math.round(dataProfile.overallQuality * 100)}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={dataProfile.overallQuality * 100} className="h-2" />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Shape:</span>{' '}
              <Badge variant="outline" className="ml-1">{dataProfile.shape}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Rows:</span>{' '}
              <span className="font-medium">{dataProfile.rowCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Columns:</span>{' '}
              <span className="font-medium">{dataProfile.columnCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Issues:</span>{' '}
              <span className="font-medium">{dataProfile.issues?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Recommended Charts</h4>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        
        <div className="grid gap-3">
          {dataProfile.chartRecommendations.map((chart, index) => {
            const Icon = CHART_ICONS[chart.chartType as keyof typeof CHART_ICONS] || BarChart3;
            const isSelected = selectedChart?.chartType === chart.chartType;
            
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary shadow-sm bg-accent' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleChartSelect(chart)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base capitalize">
                          {chart.chartType} Chart
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {chart.reason}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isSelected ? "default" : "secondary"}>
                        {Math.round(chart.confidence * 100)}% match
                      </Badge>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {chart.mapping && (
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Mapping:</span>{' '}
                      {chart.mapping.sourceColumn} → {chart.mapping.targetRole}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Column Details (Collapsible) */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full justify-between"
        >
          <span className="text-sm font-medium">Column Details</span>
          <ArrowRight className={`h-4 w-4 transition-transform ${
            showDetails ? 'rotate-90' : ''
          }`} />
        </Button>
        
        {showDetails && (
          <ScrollArea className="h-[200px] rounded-md border p-3">
            <div className="space-y-3">
              {dataProfile.columns.map((column: ColumnAnalysis) => (
                <div key={column.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                        {getDataTypeIcon(column.dataType)}
                      </span>
                      <span className="text-sm font-medium">{sanitizeText(column.name)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {column.dataType}
                    </Badge>
                  </div>
                  
                  {column.quality && (
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>
                        Completeness: {Math.round(column.quality.completeness * 100)}%
                      </span>
                      <span>
                        Unique: {column.statistics?.uniqueCount || 0}
                      </span>
                      {column.suggestions?.possibleRoles && (
                        <span>
                          Roles: {column.suggestions.possibleRoles.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Issues/Warnings */}
      {dataProfile.issues && dataProfile.issues.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Data quality issues detected:</p>
              {dataProfile.issues.slice(0, 3).map((issue, index) => (
                <p key={index} className="text-sm">
                  • {issue}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Custom Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={!selectedChart || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              Creating Chart...
            </>
          ) : (
            <>
              Create Chart
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}