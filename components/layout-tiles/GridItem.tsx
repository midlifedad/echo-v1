'use client';

import React, { memo } from 'react';
import { TileData } from '@/lib/types';
import LayoutTile from './LayoutTile';

interface GridItemProps {
  tile: TileData & { inheritanceMode?: string };
  onExpand: (tile: TileData) => void;
}

/**
 * Memoized grid item component to prevent unnecessary re-renders
 * Only re-renders when tile data changes
 */
const GridItem = memo(({ tile, onExpand }: GridItemProps) => {
  const handleExpand = () => onExpand(tile);

  return (
    <div className="grid-item-content">
      <LayoutTile 
        tile={tile}
        onExpand={handleExpand}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if tile data actually changed
  return (
    prevProps.tile.id === nextProps.tile.id &&
    prevProps.tile.type === nextProps.tile.type &&
    prevProps.tile.title === nextProps.tile.title &&
    prevProps.tile.inheritanceMode === nextProps.tile.inheritanceMode
  );
});

GridItem.displayName = 'GridItem';

export default GridItem;