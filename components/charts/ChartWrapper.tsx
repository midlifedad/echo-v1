'use client';

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import { cn } from '@/lib/utils';
import { ChartType, ChartConfig } from '@/lib/types';
import { generateMockData } from '@/lib/mockData';
import HighchartsWrapper from './HighchartsWrapper';

interface ChartWrapperProps {
  type: ChartType;
  config: ChartConfig;
  data?: Record<string, unknown>;
  className?: string;
  onChartReady?: (chart: Highcharts.Chart | null) => void;
}

export default function ChartWrapper({ 
  type, 
  config, 
  data, 
  className,
  onChartReady 
}: ChartWrapperProps) {
  const [chartData, setChartData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[ChartWrapper] Loading chart:', {
          type,
          hasProvidedData: !!data,
          hasConfig: !!config,
          config,
          data
        });

        // Use provided data or generate mock data
        const dataToUse = data || generateMockData(type);

        console.log('[ChartWrapper] Data to use:', dataToUse);

        // Simulate loading delay for realism
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

        setChartData(dataToUse);
        console.log('[ChartWrapper] Chart data loaded successfully');
      } catch (err) {
        const errorMessage = 'Failed to load chart data';
        setError(errorMessage);
        console.error('[ChartWrapper] Chart data loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [type, data, config]);

  if (isLoading) {
    return (
      <div className={cn(
        'h-full w-full flex items-center justify-center',
        'rounded animate-pulse',
        className
      )}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'h-full w-full flex items-center justify-center',
        'bg-red-50 rounded border border-red-200',
        className
      )}>
        <div className="text-center">
          <p className="text-sm text-red-600 font-medium">Error</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-full w-full', className)}>
      <HighchartsWrapper
        type={type}
        config={config}
        data={chartData || {}}
        onChartReady={onChartReady}
      />
    </div>
  );
}