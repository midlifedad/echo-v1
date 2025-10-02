'use client';

import React, { memo, useCallback, useRef, useEffect } from 'react';
import GridLayout, { WidthProvider, Layout } from 'react-grid-layout';
import { TileData } from '@/lib/types';
import { GRID_CONFIG } from '@/lib/constants';
import GridItem from './GridItem';

const GridLayoutWithProvider = WidthProvider(GridLayout);

interface GridEditModeProps {
  className: string;
  layout: Layout[];
  cols: number;
  tiles: Array<TileData & { inheritanceMode?: string; gridLayout?: Layout }>;
  onLayoutChange: (layout: Layout[]) => void;
  onExpand: (tile: TileData) => void;
}

/**
 * Optimized edit mode grid component
 * Handles draggable and resizable grid with debounced updates
 */
const GridEditMode = memo(({ 
  className, 
  layout, 
  cols,
  tiles, 
  onLayoutChange,
  onExpand 
}: GridEditModeProps) => {
  const layoutChangeTimer = useRef<NodeJS.Timeout>();

  // Debounced layout change handler
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (layoutChangeTimer.current) {
      clearTimeout(layoutChangeTimer.current);
    }

    layoutChangeTimer.current = setTimeout(() => {
      onLayoutChange(newLayout);
    }, 150); // 150ms debounce
  }, [onLayoutChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (layoutChangeTimer.current) {
        clearTimeout(layoutChangeTimer.current);
      }
    };
  }, []);

  return (
    <GridLayoutWithProvider 
      className={className}
      layout={layout}
      onLayoutChange={handleLayoutChange}
      cols={cols}
      rowHeight={GRID_CONFIG.ROW_HEIGHT}
      margin={GRID_CONFIG.MARGIN}
      containerPadding={GRID_CONFIG.CONTAINER_PADDING}
      isDraggable={true}
      isResizable={true}
      resizeHandles={GRID_CONFIG.RESIZE_HANDLES}
      compactType="vertical"
      preventCollision={false}
      useCSSTransforms={true}
    >
      {tiles.map((tile) => (
        <div key={`tile-${tile.id}`}>
          <GridItem tile={tile} onExpand={onExpand} />
        </div>
      ))}
    </GridLayoutWithProvider>
  );
});

GridEditMode.displayName = 'GridEditMode';

export default GridEditMode;