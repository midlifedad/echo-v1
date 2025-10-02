/**
 * AI Chart Recommendations Component
 * Displays AI-generated chart recommendations for datasets
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { Dataset, DatasetPreview } from '@/lib/types/dataset';
import { ChartRecommendation, ChartRecommendationResponse } from '@/lib/types/chart-recommendations';
import { chartMCPService } from '@/lib/services/chartMCP';
import HighchartsWrapper from '@/components/charts/HighchartsWrapper';

interface AIRecommendationsProps {
  dataset: Dataset | DatasetPreview;
  onSelect: (recommendation: ChartRecommendation, config: any) => void;
  onCancel: () => void;
  intent?: string;
  preferences?: {
    audience?: 'technical' | 'executive' | 'general';
    style?: 'minimal' | 'detailed' | 'decorative';
    colorBlindSafe?: boolean;
  };
}

export default function AIRecommendations({
  dataset,
  onSelect,
  onCancel,
  intent,
  preferences
}: AIRecommendationsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ChartRecommendationResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState('recommended');
  const [selectedChart, setSelectedChart] = useState<ChartRecommendation | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [dataset]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build the dataset object if it's a preview
      const fullDataset: Dataset = 'statistics' in dataset ? dataset : {
        id: dataset.id,
        name: dataset.name,
        data: dataset.rows,
        columns: dataset.columns,
        metadata: {
          source: 'import' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        statistics: {
          rowCount: dataset.totalRows,
          columnCount: dataset.columns.length
        }
      };

      const response = await chartMCPService.recommendFromDataset(fullDataset, {
        intent,
        preferences: preferences ? {
          audience: preferences.audience,
          style: preferences.style,
          colorScheme: preferences.colorBlindSafe ? 'colorblind' : undefined,
          accessibility: preferences.colorBlindSafe
        } : undefined
      });

      setRecommendations(response);
      setSelectedChart(response.recommended);
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      setError('Failed to generate chart recommendations. Please try again.');
      
      // Provide fallback recommendations
      setRecommendations(getFallbackRecommendations(dataset));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRecommendations = (data: Dataset | DatasetPreview): ChartRecommendationResponse => {
    const hasNumeric = data.columns.some(col => col.dataType === 'number');
    const hasDate = data.columns.some(col => col.dataType === 'date' || col.dataType === 'datetime');

    return {
      recommended: {
        id: 'fallback-1',
        chartType: hasDate && hasNumeric ? 'line' : 'column',
        confidence: 0.7,
        rationale: 'Basic chart based on data types',
        config: {
          chart: { type: hasDate && hasNumeric ? 'line' : 'column' },
          title: { text: data.name },
          series: []
        }
      },
      alternatives: [
        {
          id: 'fallback-2',
          chartType: 'bar',
          confidence: 0.6,
          rationale: 'Alternative visualization',
          config: { chart: { type: 'bar' } }
        },
        {
          id: 'fallback-3',
          chartType: 'pie',
          confidence: 0.5,
          rationale: 'For categorical data',
          config: { chart: { type: 'pie' } }
        }
      ],
      dataProfile: {
        rowCount: 'totalRows' in dataset ? dataset.totalRows : dataset.statistics.rowCount,
        columnCount: dataset.columns.length,
        dataTypes: {},
        temporalColumns: [],
        numericColumns: [],
        categoricalColumns: [],
        nullPercentage: 0,
        hasTimeSeries: hasDate,
        hasGeographicData: false,
        suggestedRelationships: []
      }
    };
  };

  const handleSelectChart = () => {
    if (selectedChart) {
      onSelect(selectedChart, selectedChart.config);
    }
  };

  const renderChartOption = (chart: ChartRecommendation, isRecommended: boolean = false) => (
    <Card 
      className={`cursor-pointer transition-all ${
        selectedChart?.id === chart.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedChart(chart)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {chart.chartType.charAt(0).toUpperCase() + chart.chartType.slice(1)} Chart
            {isRecommended && (
              <Badge className="bg-green-100 text-green-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Progress value={chart.confidence * 100} className="w-20" />
            <span className="text-sm text-muted-foreground">
              {Math.round(chart.confidence * 100)}%
            </span>
          </div>
        </div>
        <CardDescription>{chart.rationale}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center">
          {chart.config && (
            <HighchartsWrapper
              options={chart.config}
              containerProps={{ style: { height: '100%', width: '100%' } }}
            />
          )}
        </div>
        {chart.insights && chart.insights.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Insights:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {chart.insights.slice(0, 3).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing your data...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generating AI-powered chart recommendations
        </p>
      </div>
    );
  }

  if (error && !recommendations) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
          <Button onClick={loadRecommendations} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Chart Recommendations
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Based on your data structure and patterns
          </p>
        </div>
        {recommendations.processingTime && (
          <Badge variant="outline">
            Generated in {recommendations.processingTime}ms
          </Badge>
        )}
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Using fallback recommendations. {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="alternatives">
            Alternatives ({recommendations.alternatives.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-4">
          {renderChartOption(recommendations.recommended, true)}
        </TabsContent>

        <TabsContent value="alternatives" className="mt-4 space-y-4">
          {recommendations.alternatives.map(chart => (
            <div key={chart.id}>
              {renderChartOption(chart)}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadRecommendations}
            disabled={loading}
          >
            Regenerate
          </Button>
          <Button 
            onClick={handleSelectChart}
            disabled={!selectedChart}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Use This Chart
          </Button>
        </div>
      </div>
    </div>
  );
}