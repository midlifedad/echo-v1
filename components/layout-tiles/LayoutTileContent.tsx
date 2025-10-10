'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { TileData } from '@/lib/types';
import { cn } from '@/lib/utils';
import ChartWrapper from '@/components/charts/ChartWrapper';
import TextTileContent from '@/components/tiles/TextTileContent';
import ImageTileContent from '@/components/tiles/ImageTileContent';
import SmartTileContent from '@/components/tiles/SmartTileContent';

interface TileContentProps {
  tile: TileData;
  onChartReady?: (chart: Highcharts.Chart | null) => void;
}

export default function LayoutTileContent({ tile, onChartReady }: TileContentProps) {
  // Debug logging for tile rendering
  console.log('[LayoutTileContent] Rendering tile:', {
    id: tile.id,
    type: tile.type,
    title: tile.title,
    hasConfig: !!tile.config,
    hasData: !!tile.data,
    config: tile.config,
    data: tile.data
  });

  // Get padding classes based on display settings
  const getPaddingClass = () => {
    const padding = tile.displaySettings?.padding;
    switch (padding) {
      case 'none': return 'p-0';
      case 'small': return 'p-2';
      case 'large': return 'p-6';
      case 'medium':
      default: return 'p-4';
    }
  };

  const paddingClass = getPaddingClass();
  // Route to appropriate content renderer based on tile type
  switch (tile.type) {
    case 'text':
      return (
        <div className={cn('flex-1 overflow-hidden min-h-0 flex', paddingClass)}>
          <TextTileContent content={tile.content as any} className="flex-1" />
        </div>
      );
    
    case 'image':
      return (
        <div className={cn('flex-1 overflow-hidden min-h-0 flex', paddingClass)}>
          <ImageTileContent content={tile.content as any} />
        </div>
      );
    
    case 'smart':
      return (
        <div className={cn('flex-1 overflow-hidden min-h-0 flex', paddingClass)}>
          <SmartTileContent content={tile.content as any} />
        </div>
      );
    
    default:
      // All chart types use ChartWrapper
      return (
        <div className={cn('flex-1 overflow-hidden min-h-0 flex', paddingClass)}>
          <ChartWrapper
            type={tile.type}
            config={tile.config}
            data={tile.data}
            className="flex-1"
            onChartReady={onChartReady}
          />
        </div>
      );
  }
}