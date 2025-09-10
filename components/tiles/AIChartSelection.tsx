'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Check, 
  Star, 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  ScatterChart,
  Gauge,
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
  
  // Combine recommended and alternatives for display
  const allOptions = [response.recommended, ...response.alternatives];
  
  const handleSelect = (option: ChartOption) => {
    setSelectedIndex(option.index);
    onSelect(option);
  };

  const getChartIcon = (type: string) => {
    const Icon = CHART_ICONS[type] || BarChart3;
    return <Icon className="h-4 w-4" />;
  };

  const getRankingInfo = (index: number) => {
    return response.ranking.find(r => r.index === index);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm text-muted-foreground">
        Select one of the generated chart options:
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid gap-4">
          {allOptions.map((option) => {
            const ranking = getRankingInfo(option.index);
            const isRecommended = option.index === response.recommended.index;
            const isSelected = selectedIndex === option.index;
            
            return (
              <div
                key={option.index}
                className={cn(
                  "relative rounded-lg border-2 transition-all cursor-pointer",
                  isRecommended && "border-primary shadow-sm",
                  isSelected && "ring-2 ring-primary ring-offset-2",
                  !isRecommended && !isSelected && "border-border hover:border-muted-foreground"
                )}
                onClick={() => handleSelect(option)}
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
                        {ranking && (
                          <Badge variant="outline" className="ml-auto">
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
            onClick={() => onSelect(allOptions.find(o => o.index === selectedIndex)!)}
            className="w-full"
          >
            Use Selected Chart
          </Button>
        </div>
      )}
    </div>
  );
}