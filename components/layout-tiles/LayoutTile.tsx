'use client';

import React, { useState } from 'react';
import Highcharts from 'highcharts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TileData } from '@/lib/types';
import LayoutTileHeader from './LayoutTileHeader';
import LayoutTileContent from './LayoutTileContent';
import TileInheritanceMenu from './TileInheritanceMenu';
import { useLayout } from '@/contexts/LayoutContext';

interface TileProps {
  tile: TileData & { inheritanceMode?: string };
  className?: string;
  onExpand?: () => void;
}

export default function LayoutTile({ 
  tile, 
  className,
  onExpand 
}: TileProps) {
  const [chartInstance, setChartInstance] = useState<Highcharts.Chart | null>(null);
  const { isEditMode, editingBreakpoint, currentBreakpoint, layoutInheritance, isTileLocked } = useLayout();
  
  // Determine inheritance mode: check global lock first, then inheritance mode
  const isLocked = isTileLocked(tile.id);
  const activeBreakpoint = isEditMode ? editingBreakpoint : currentBreakpoint;
  const inheritanceMode = isLocked ? 'locked' : (tile.inheritanceMode || layoutInheritance[tile.id]?.[activeBreakpoint as 'lg' | 'md' | 'sm' | 'xs'] || 'inherit');

  const handleChartReady = (chart: Highcharts.Chart | null) => {
    setChartInstance(chart);
  };

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
        className
      )}
      style={{
        ...(isEditMode && {
          borderWidth: '2px',
          borderStyle: inheritanceMode === 'inherit' ? 'dashed' : 'solid',
          borderColor: inheritanceMode === 'inherit' ? 'rgba(110, 69, 226, 0.4)' :
                      inheritanceMode === 'custom' ? '#6e45e2' :
                      inheritanceMode === 'locked' ? 'rgb(239, 68, 68)' : undefined
        })
      }}
    >
      <LayoutTileHeader tile={tile} onExpand={onExpand} chartInstance={chartInstance} tileId={tile.id} />
      <LayoutTileContent tile={tile} onChartReady={handleChartReady} />
      
      {isEditMode && inheritanceMode === 'locked' && (
        <div className="absolute inset-0 bg-background/5 pointer-events-none flex items-center justify-center rounded-lg">
          <div className="text-6xl opacity-10">🔒</div>
        </div>
      )}
    </Card>
  );
}