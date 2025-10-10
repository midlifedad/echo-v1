'use client';

import React from 'react';
import ChartWrapper from './ChartWrapper';
import type Highcharts from 'highcharts';

interface ChartPreviewProps {
  type?: string;
  config?: Highcharts.Options;
  data?: unknown;
  className?: string;
  fallback?: React.ReactNode;
}

export default function ChartPreview({
  type,
  config,
  data,
  className,
  fallback = <div className="text-muted-foreground text-xs">No preview</div>
}: ChartPreviewProps) {
  try {
    if (!config || !type) {
      return <>{fallback}</>;
    }

    return (
      <ChartWrapper
        type={type}
        config={config}
        data={data}
        className={className}
      />
    );
  } catch (error) {
    console.error('Chart preview error:', error);
    return <>{fallback}</>;
  }
}