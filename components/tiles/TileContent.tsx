'use client';

import React from 'react';
import { TileData } from '@/lib/types';
import ChartWrapper from '@/components/charts/ChartWrapper';

interface TileContentProps {
  tile: TileData;
}

export default function TileContent({ tile }: TileContentProps) {
  return (
    <div className="flex-1 p-3 overflow-hidden min-h-0 flex">
      <ChartWrapper
        type={tile.type}
        config={tile.config}
        data={tile.data}
        className="flex-1"
      />
    </div>
  );
}