'use client';

import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartType, ChartConfig } from '@/lib/types';
import { getChartOptions } from '@/lib/chartConfigs';

// For Highcharts v12+, modules auto-initialize when imported
// Use dynamic import to avoid SSR issues
if (typeof window !== 'undefined') {
  // Import ALL chart type modules so AI can generate any chart type
  Promise.resolve()
    .then(() => import('highcharts/modules/exporting'))
    .then(() => import('highcharts/highcharts-more')) // Required for gauge, bubble, etc.
    .then(() => import('highcharts/highcharts-3d')) // Required for 3D charts (must load before pyramid3d, cylinder, etc.)
    // Basic chart types
    .then(() => import('highcharts/modules/solid-gauge'))
    .then(() => import('highcharts/modules/heatmap'))
    .then(() => import('highcharts/modules/treemap'))
    .then(() => import('highcharts/modules/treegraph'))
    // Flow & relationship charts
    .then(() => import('highcharts/modules/sankey'))
    .then(() => import('highcharts/modules/dependency-wheel'))
    .then(() => import('highcharts/modules/organization'))
    .then(() => import('highcharts/modules/networkgraph'))
    .then(() => import('highcharts/modules/arc-diagram'))
    // Hierarchical charts
    .then(() => import('highcharts/modules/sunburst'))
    // Specialized charts
    .then(() => import('highcharts/modules/funnel'))
    .then(() => import('highcharts/modules/pyramid3d')) // Requires highcharts-3d
    .then(() => import('highcharts/modules/bullet'))
    .then(() => import('highcharts/modules/wordcloud'))
    .then(() => import('highcharts/modules/venn'))
    .then(() => import('highcharts/modules/timeline'))
    .then(() => import('highcharts/modules/histogram-bellcurve'))
    .then(() => import('highcharts/modules/pareto'))
    .then(() => import('highcharts/modules/streamgraph'))
    .then(() => import('highcharts/modules/variwide'))
    .then(() => import('highcharts/modules/variable-pie'))
    .then(() => import('highcharts/modules/vector'))
    .then(() => import('highcharts/modules/windbarb'))
    .then(() => import('highcharts/modules/xrange'))
    .then(() => import('highcharts/modules/dumbbell'))
    .then(() => import('highcharts/modules/lollipop'))
    .then(() => import('highcharts/modules/item-series'))
    .then(() => import('highcharts/modules/pictorial'))
    .then(() => import('highcharts/modules/cylinder')); // Requires highcharts-3d
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