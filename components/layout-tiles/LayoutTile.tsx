'use client';

import React, { useState } from 'react';
import Highcharts from 'highcharts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TileData } from '@/lib/types';
import LayoutTileHeader from './LayoutTileHeader';
import LayoutTileContent from './LayoutTileContent';
import { useLayout } from '@/contexts/LayoutContext';
import { useTiles } from '@/contexts/TileContext';

interface TileProps {
  tile: TileData;
  className?: string;
  onExpand?: () => void;
}

export default function LayoutTile({ 
  tile, 
  className,
  onExpand 
}: TileProps) {
  const [chartInstance, setChartInstance] = useState<Highcharts.Chart | null>(null);
  const { isEditMode } = useLayout();
  const { updateTile } = useTiles();

  const handleChartReady = (chart: Highcharts.Chart | null) => {
    setChartInstance(chart);
  };

  const handleLockToggle = () => {
    updateTile(tile.id, { isLocked: !tile.isLocked });
  };

  // Apply display settings
  const showTitle = tile.displaySettings?.showTitle !== false;
  const titlePosition = tile.displaySettings?.titlePosition || 'top';
  const borderStyle = tile.displaySettings?.border || 'default';

  return (
    <Card 
      className={cn(
        'py-0 gap-0', // Override Card's default py-6 and gap-6
        'overflow-hidden',
        'transition-all duration-200',
        'hover:shadow-md',
        'animate-tile-appear',
        'flex flex-col',
        'h-full w-full', // Ensure it fills the grid item
        '!relative', // Important: ensure relative positioning for handles
        isEditMode && 'border-2 border-primary/50', // Simple edit mode indicator
        isEditMode && tile.isLocked && 'opacity-95', // Subtle locked indicator
        borderStyle === 'none' && 'border-0 shadow-none',
        titlePosition === 'bottom' && 'flex-col-reverse',
        className
      )}
    >
      {showTitle && (
        <LayoutTileHeader 
          tile={tile} 
          onExpand={onExpand} 
          chartInstance={chartInstance} 
          tileId={tile.id}
          isLocked={tile.isLocked}
          onLockToggle={handleLockToggle}
        />
      )}
      <LayoutTileContent tile={tile} onChartReady={handleChartReady} />
    </Card>
  );
}