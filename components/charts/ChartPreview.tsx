'use client';

import React from 'react';
import ChartWrapper from './ChartWrapper';

interface ChartPreviewProps {
  type?: string;
  config?: any;
  data?: any;
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
        type={type as any}
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