'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Check, 
  Star,
  Info, 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  ScatterChart,
  Gauge,
  Sparkles,
} from 'lucide-react';
import type { ChartOption, ChartMCPResponse } from '@/lib/services/chartMCP';
import { chartMCPService } from '@/lib/services/chartMCP';

interface AIChartSelectionProps {
  response: ChartMCPResponse;
  onSelect: (option: ChartOption) => void;
  className?: string;
}

const CHART_ICONS: Record<string, any> = {
  line: Activity,
  area: TrendingUp,
  column: BarChart3,
  bar: BarChart3,
  pie: PieChart,
  donut: PieChart,
  scatter: ScatterChart,
  gauge: Gauge,
  spline: Activity,
};

export function AIChartSelection({ response, onSelect, className }: AIChartSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedOptimized, setSelectedOptimized] = useState<boolean>(false);
  
  // Build options list: recommended (with optimized if available) + alternatives
  const buildOptions = () => {
    const options: (ChartOption & { isOptimized?: boolean })[] = [];
    
    // Add recommended chart
    options.push(response.recommended);
    
    // If recommended has an optimized version, add it as a separate option
    if (response.recommended.optimized) {
      options.push({
        ...response.recommended,
        config: response.recommended.optimized.config,
        imageUrl: response.recommended.optimized.imageUrl,
        reason: `Optimized version: ${response.recommended.optimized.improvements.join(', ')}`,
        isOptimized: true
      });
    }
    
    // Add alternatives
    options.push(...response.alternatives);
    
    return options;
  };
  
  const allOptions = buildOptions();

  // Handle clicking a chart card - just highlight it, don't call onSelect yet
  const handleCardClick = (option: ChartOption & { isOptimized?: boolean }) => {
    console.log('[AIChartSelection] 🖱️ Chart card clicked:', {
      index: option.index,
      isOptimized: option.isOptimized || false,
      chartType: option.chartType
    });
    setSelectedIndex(option.index);
    setSelectedOptimized(option.isOptimized || false);
  };

  // Handle the "Use Selected Chart" button - this calls onSelect
  const handleConfirmSelection = () => {
    console.log('[AIChartSelection] ✅ Use Selected Chart button clicked');
    const selected = allOptions.find(o =>
      o.index === selectedIndex &&
      (o.isOptimized || false) === selectedOptimized
    );

    if (selected) {
      console.log('[AIChartSelection] 📤 Calling onSelect with chart:', {
        index: selected.index,
        chartType: selected.chartType,
        isOptimized: selected.isOptimized,
        hasConfig: !!selected.config
      });
      onSelect(selected);
    } else {
      console.error('[AIChartSelection] ❌ No chart found matching selection');
    }
  };

  const getChartIcon = (type: string) => {
    const Icon = CHART_ICONS[type] || BarChart3;
    return <Icon className="h-4 w-4" />;
  };

  const getRankingInfo = (index: number) => {
    const ranking = response.ranking.find(r => r.index === index);
    console.log('[AIChartSelection] 📊 Ranking info for index', index, ':', ranking);
    return ranking;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
        <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Selecting a chart will automatically configure your tile with all data, styling, and settings
        </p>
      </div>
      <div className="text-sm text-muted-foreground">
        Choose from the AI-generated options below:
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid gap-4">
          {allOptions.map((option, optionIdx) => {
            const ranking = getRankingInfo(option.index);
            const isRecommended = option.index === response.recommended.index && !option.isOptimized;
            const isOptimized = option.isOptimized || false;
            const isSelected = selectedIndex === option.index && selectedOptimized === isOptimized;
            
            return (
              <div
                key={`${option.index}-${isOptimized ? 'optimized' : 'original'}`}
                className={cn(
                  "relative rounded-lg border-2 transition-all cursor-pointer",
                  isRecommended && "border-primary shadow-sm",
                  isOptimized && "border-green-500 shadow-green-100",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  !isRecommended && !isOptimized && !isSelected && "border-border hover:border-muted-foreground"
                )}
                onClick={() => handleCardClick(option)}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute -top-3 left-4 px-2 bg-background">
                    <Badge variant="default" className="gap-1">
                      <Star className="h-3 w-3" />
                      Recommended
                    </Badge>
                  </div>
                )}
                
                {/* Optimized Badge */}
                {isOptimized && (
                  <div className="absolute -top-3 left-4 px-2 bg-background">
                    <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
                      <Sparkles className="h-3 w-3" />
                      Optimized Version
                    </Badge>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Chart Preview */}
                    <div className="relative flex-shrink-0 w-48 h-32 bg-muted rounded overflow-hidden">
                      {option.imageUrl ? (
                        <img
                          src={chartMCPService.getImageUrl(option.imageUrl)}
                          alt={`${option.chartType} chart preview`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {getChartIcon(option.chartType)}
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Chart Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getChartIcon(option.chartType)}
                        <span className="font-medium capitalize">{option.chartType} Chart</span>
                        {ranking && ranking.score !== undefined && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-auto",
                              ranking.score >= 0.8 && "bg-green-50 border-green-200 text-green-700",
                              ranking.score >= 0.6 && ranking.score < 0.8 && "bg-blue-50 border-blue-200 text-blue-700",
                              ranking.score < 0.6 && "bg-yellow-50 border-yellow-200 text-yellow-700"
                            )}
                          >
                            Score: {(ranking.score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {option.reason}
                      </p>
                      
                      {option.config?.title?.text && (
                        <p className="text-xs font-medium">
                          Title: {option.config.title.text}
                        </p>
                      )}
                      
                      {option.config?.series && (
                        <p className="text-xs text-muted-foreground">
                          {option.config.series.length} data series
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      {selectedIndex !== null && (
        <div className="pt-4 border-t">
          <Button
            onClick={handleConfirmSelection}
            className="w-full"
            size="lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Use Selected Chart
          </Button>
        </div>
      )}
    </div>
  );
}