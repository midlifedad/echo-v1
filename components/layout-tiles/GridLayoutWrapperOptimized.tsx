'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from 'react-grid-layout';
import { useLayout } from '@/contexts/LayoutContext';
import { useTiles } from '@/contexts/TileContext';
import { useLayoutCalculator } from '@/hooks/useLayoutCalculator';
import { cn } from '@/lib/utils';
import { TileData } from '@/lib/types';
import { BREAKPOINT_COLUMNS } from '@/lib/constants';
import GridViewMode from './GridViewMode';
import GridEditMode from './GridEditMode';
import LayoutTileFullscreen from './LayoutTileFullscreen';
import { LayoutErrorBoundary } from '@/components/error/LayoutErrorBoundary';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '@/styles/grid-layout.css';

interface GridLayoutWrapperProps {
  className?: string;
}

/**
 * Optimized Grid Layout Wrapper Component
 * Manages responsive grid layouts with edit/view modes
 * Uses composition and memoization for better performance
 */
function GridLayoutContent({ className }: GridLayoutWrapperProps) {
  const { 
    isEditMode, 
    layouts, 
    setLayouts, 
    currentBreakpoint, 
    setCurrentBreakpoint,
    editingBreakpoint,
    layoutInheritance,
    updateTileInheritance,
    lockedTiles,
    lockedPositions,
    isTileLocked,
  } = useLayout();
  
  const { tiles } = useTiles();
  const [expandedTile, setExpandedTile] = useState<TileData | null>(null);
  const [initializedLayouts, setInitializedLayouts] = useState(false);

  // Use the layout calculator hook
  const {
    ensureCompleteLayouts,
    computeAllLayouts,
    computeBreakpointLayouts,
  } = useLayoutCalculator({
    tiles,
    layouts,
    layoutInheritance,
    lockedTiles,
    lockedPositions,
  });

  // Initialize layouts on mount
  useEffect(() => {
    if (!initializedLayouts && tiles.length > 0) {
      const completeLayouts = ensureCompleteLayouts(layouts);
      setLayouts(completeLayouts);
      setInitializedLayouts(true);
    }
  }, [initializedLayouts, tiles.length, setLayouts, ensureCompleteLayouts, layouts]);

  // Compute layouts with inheritance and locking
  const computedLayouts = useMemo(() => computeAllLayouts, [computeAllLayouts]);

  // Get active breakpoint and tiles
  const activeBreakpoint = isEditMode ? editingBreakpoint : currentBreakpoint;
  const activeLayout = useMemo(
    () => computeBreakpointLayouts(activeBreakpoint as 'lg' | 'md' | 'sm' | 'xs'),
    [computeBreakpointLayouts, activeBreakpoint]
  );

  // Prepare tiles with layout information
  const gridItems = useMemo(() => {
    return tiles.map((tile, index) => {
      const layoutItem = activeLayout[index];
      const inheritanceMode = layoutInheritance[tile.id]?.[activeBreakpoint as 'lg' | 'md' | 'sm' | 'xs'];
      const isLocked = isTileLocked(tile.id);
      
      return {
        ...tile,
        gridLayout: layoutItem,
        inheritanceMode: isLocked ? 'locked' : (inheritanceMode || 'inherit'),
      };
    });
  }, [tiles, activeLayout, layoutInheritance, activeBreakpoint, isTileLocked]);

  /**
   * Handle layout changes in edit mode
   * Updates inheritance mode and persists layout
   */
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!isEditMode) return;

    // Mark tiles as custom when moved/resized
    newLayout.forEach(layout => {
      const tileId = layout.i.replace('tile-', '');
      const currentInheritance = layoutInheritance[tileId]?.[activeBreakpoint as 'lg' | 'md' | 'sm' | 'xs'];
      
      if (currentInheritance !== 'custom' && !isTileLocked(tileId)) {
        updateTileInheritance(tileId, activeBreakpoint, 'custom');
      }
    });
    
    // Update layouts for current breakpoint
    setLayouts(prev => ({
      ...prev,
      [activeBreakpoint]: newLayout
    }));
  }, [isEditMode, activeBreakpoint, layoutInheritance, updateTileInheritance, isTileLocked, setLayouts]);

  const handleBreakpointChange = useCallback((newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  }, [setCurrentBreakpoint]);

  const handleExpand = useCallback((tile: TileData) => {
    setExpandedTile(tile);
  }, []);

  const handleCloseExpanded = useCallback(() => {
    setExpandedTile(null);
  }, []);

  const editingCols = BREAKPOINT_COLUMNS[editingBreakpoint as keyof typeof BREAKPOINT_COLUMNS] || BREAKPOINT_COLUMNS.lg;

  return (
    <>
      <div className={cn('grid-layout-wrapper', isEditMode && 'edit-mode', className)}>
        {isEditMode ? (
          <GridEditMode
            className="layout"
            layout={activeLayout}
            cols={editingCols}
            tiles={gridItems}
            onLayoutChange={handleLayoutChange}
            onExpand={handleExpand}
          />
        ) : (
          <GridViewMode
            className="layout"
            layouts={computedLayouts}
            tiles={gridItems}
            onBreakpointChange={handleBreakpointChange}
            onExpand={handleExpand}
          />
        )}
      </div>

      {expandedTile && (
        <LayoutTileFullscreen
          tile={expandedTile}
          isOpen={!!expandedTile}
          onClose={handleCloseExpanded}
        />
      )}
    </>
  );
}

/**
 * Main export with error boundary wrapper
 */
export default function GridLayoutWrapperOptimized(props: GridLayoutWrapperProps) {
  return (
    <LayoutErrorBoundary>
      <GridLayoutContent {...props} />
    </LayoutErrorBoundary>
  );
}