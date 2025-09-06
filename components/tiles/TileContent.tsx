'use client';

import React from 'react';
import Highcharts from 'highcharts';
import { TileData } from '@/lib/types';
import ChartWrapper from '@/components/charts/ChartWrapper';

interface TileContentProps {
  tile: TileData;
  onChartReady?: (chart: Highcharts.Chart | null) => void;
}

export default function TileContent({ tile, onChartReady }: TileContentProps) {
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