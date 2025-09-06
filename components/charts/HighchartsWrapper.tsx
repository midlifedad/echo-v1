'use client';

import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartType, ChartConfig } from '@/lib/types';
import { getChartOptions } from '@/lib/chartConfigs';

interface HighchartsWrapperProps {
  type: ChartType;
  config: ChartConfig;
  data: Record<string, unknown>;
}

export default function HighchartsWrapper({ type, config, data }: HighchartsWrapperProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = getChartOptions(type, config, data);

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
    />
  );
}