'use client';

import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartType, ChartConfig } from '@/lib/types';
import { getChartOptions } from '@/lib/chartConfigs';

// For Highcharts v12+, modules auto-initialize when imported
// Use dynamic import to avoid SSR issues
if (typeof window !== 'undefined') {
  // Import required modules in the correct order - they will auto-attach to Highcharts
  Promise.resolve()
    .then(() => import('highcharts/modules/exporting'))
    .then(() => import('highcharts/highcharts-more')) // Required for gauge charts
    .then(() => import('highcharts/modules/solid-gauge')); // For solid gauge charts (must be after highcharts-more)
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