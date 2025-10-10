'use client';

import React, { memo } from 'react';
import { Responsive, WidthProvider, Layouts, Layout } from 'react-grid-layout';
import { TileData } from '@/lib/types';
import { BREAKPOINT_COLUMNS, GRID_CONFIG } from '@/lib/constants';
import GridItem from './GridItem';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridViewModeProps {
  className: string;
  layouts: Layouts;
  tiles: Array<TileData & { inheritanceMode?: string; gridLayout?: Layout }>;
  onBreakpointChange: (breakpoint: string) => void;
  onExpand: (tile: TileData) => void;
}

/**
 * Optimized view mode grid component
 * Handles read-only grid display with responsive layouts
 */
const GridViewMode = memo(({ 
  className, 
  layouts, 
  tiles, 
  onBreakpointChange,
  onExpand 
}: GridViewModeProps) => {
  return (
    <ResponsiveGridLayout 
      className={className}
      layouts={layouts}
      onLayoutChange={() => {}} // No-op in view mode
      onBreakpointChange={onBreakpointChange}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
      cols={BREAKPOINT_COLUMNS}
      rowHeight={GRID_CONFIG.ROW_HEIGHT}
      margin={GRID_CONFIG.MARGIN}
      containerPadding={GRID_CONFIG.CONTAINER_PADDING}
      isDraggable={false}
      isResizable={false}
      compactType={null} // Disable auto-compaction
      preventCollision={true}
      useCSSTransforms={true}
    >
      {tiles.map((tile) => (
        <div key={`tile-${tile.id}`}>
          <GridItem tile={tile} onExpand={onExpand} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
});

GridViewMode.displayName = 'GridViewMode';

export default GridViewMode;