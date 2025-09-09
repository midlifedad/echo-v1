'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { TileData } from '@/lib/types';
import ChartWrapper from '@/components/charts/ChartWrapper';
import TextTileContent from '@/components/tiles/TextTileContent';
import ImageTileContent from '@/components/tiles/ImageTileContent';
import SmartTileContent from '@/components/tiles/SmartTileContent';

interface TileContentProps {
  tile: TileData;
  onChartReady?: (chart: Highcharts.Chart | null) => void;
}

export default function LayoutTileContent({ tile, onChartReady }: TileContentProps) {
  // Route to appropriate content renderer based on tile type
  switch (tile.type) {
    case 'text':
      return <TextTileContent content={tile.content as any} />;
    
    case 'image':
      return <ImageTileContent content={tile.content as any} />;
    
    case 'smart':
      return <SmartTileContent content={tile.content as any} />;
    
    default:
      // All chart types use ChartWrapper
      return (
        <div className="flex-1 p-3 overflow-hidden min-h-0 flex">
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