'use client';

import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartType, ChartConfig } from '@/lib/types';
import { getChartOptions } from '@/lib/chartConfigs';

// For Highcharts v12+, modules auto-initialize when imported
// Use dynamic import to avoid SSR issues
if (typeof window !== 'undefined') {
  // Just import the module, it will auto-attach to Highcharts
  import('highcharts/modules/exporting');
}

interface HighchartsWrapperProps {
  type: ChartType;
  config: ChartConfig;
  data: Record<string, unknown>;
  onChartReady?: (chart: Highcharts.Chart | null) => void;
}

export default function HighchartsWrapper({ type, config, data, onChartReady }: HighchartsWrapperProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = getChartOptions(type, config, data);

  useEffect(() => {
    // Notify parent when chart is ready
    if (onChartReady && chartRef.current?.chart) {
      onChartReady(chartRef.current.chart);
    }
  }, [onChartReady]);

  useEffect(() => {
    // Handle responsive resize
    const handleResize = () => {
      if (chartRef.current?.chart) {
        chartRef.current.chart.reflow();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <HighchartsReact
      ref={chartRef}
      highcharts={Highcharts}
      options={chartOptions}
      containerProps={{
        className: 'h-full w-full'
      }}
      callback={(chart: Highcharts.Chart) => {
        if (onChartReady) {
          onChartReady(chart);
        }
      }}
    />
  );
}