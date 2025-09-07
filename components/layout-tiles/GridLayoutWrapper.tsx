'use client';

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import GridLayout, { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { useLayout } from '@/contexts/LayoutContext';
import { useTiles } from '@/contexts/TileContext';
import { cn } from '@/lib/utils';
import LayoutTile from './LayoutTile';
import LayoutTileFullscreen from './LayoutTileFullscreen';
import { TileData } from '@/lib/types';
import { BREAKPOINT_COLUMNS, GRID_CONFIG } from '@/lib/constants';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '@/styles/grid-layout.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const GridLayoutWithProvider = WidthProvider(GridLayout);

interface GridLayoutWrapperProps {
  className?: string;
}

export default function GridLayoutWrapper({ className }: GridLayoutWrapperProps) {
  const { 
    isEditMode, 
    layouts, 
    setLayouts, 
    currentBreakpoint, 
    setCurrentBreakpoint,
    editingBreakpoint,
    layoutInheritance,
    updateTileInheritance,
    getInheritedLayout,
    customLayouts,
    isTileLocked,
    lockedTiles,
    lockedPositions,
  } = useLayout();
  const { tiles, reorderTiles } = useTiles();
  const [expandedTile, setExpandedTile] = React.useState<TileData | null>(null);
  const [initializedLayouts, setInitializedLayouts] = React.useState(false);

  /**
   * Generate default layout for a tile at a specific breakpoint
   * Memoized to prevent unnecessary recalculations
   */
  const generateDefaultLayoutForBreakpoint = useCallback((breakpoint: string, tileId: string, index: number) => {
    const cols = BREAKPOINT_COLUMNS[breakpoint as keyof typeof BREAKPOINT_COLUMNS] || BREAKPOINT_COLUMNS.lg;
    
    // Calculate position based on breakpoint columns
    let w, x, y;
    
    switch(breakpoint) {
      case 'lg':
        w = 4;
        x = (index * w) % cols;
        y = Math.floor((index * w) / cols) * GRID_CONFIG.DEFAULT_HEIGHT;
        break;
      case 'md':
        w = index < 2 ? 5 : 3;
        x = index < 2 ? (index * 5) : ((index - 2) * 3);
        y = index < 2 ? 0 : GRID_CONFIG.DEFAULT_HEIGHT;
        break;
      case 'sm':
        w = index < 2 ? 6 : 3;
        x = index < 2 ? 0 : ((index - 2) * 3) % cols;
        y = index < 2 ? (index * GRID_CONFIG.DEFAULT_HEIGHT) : (8 + Math.floor((index - 2) / 2) * 3);
        break;
      case 'xs':
        w = 4;
        x = 0;
        y = index * GRID_CONFIG.DEFAULT_HEIGHT;
        break;
      default:
        w = 4;
        x = (index * 4) % BREAKPOINT_COLUMNS.lg;
        y = Math.floor((index * 4) / BREAKPOINT_COLUMNS.lg) * GRID_CONFIG.DEFAULT_HEIGHT;
    }
    
    return {
      i: `tile-${tileId}`,
      x,
      y,
      w,
      h: GRID_CONFIG.DEFAULT_HEIGHT,
      minW: GRID_CONFIG.MIN_WIDTH,
      minH: GRID_CONFIG.MIN_HEIGHT
    };
  }, []);

  // Carefully ensure layouts exist only for missing tiles, preserve existing positions
  const ensureCompleteLayouts = useCallback((currentLayouts: Layouts) => {
    const breakpoints = ['lg', 'md', 'sm', 'xs'];
    const completeLayouts: Layouts = {};
    
    breakpoints.forEach(bp => {
      // Start with existing layouts for this breakpoint
      const existingLayouts = currentLayouts[bp] || [];
      const updatedLayouts = [...existingLayouts];
      
      // Only add missing tiles, don't regenerate existing ones
      tiles.forEach((tile, index) => {
        const tileLayoutId = `tile-${tile.id}`;
        const existsAlready = existingLayouts.find(l => l.i === tileLayoutId);
        
        if (!existsAlready) {
          // Only generate default if this tile truly doesn't exist
          updatedLayouts.push(generateDefaultLayoutForBreakpoint(bp, tile.id, index));
        }
      });
      
      completeLayouts[bp] = updatedLayouts;
    });
    
    return completeLayouts;
  }, [tiles, generateDefaultLayoutForBreakpoint]);

  // Initialize layouts with complete breakpoint data on mount
  // Optimized to only run when tiles change or on initial mount
  React.useEffect(() => {
    if (!initializedLayouts && tiles.length > 0) {
      const completeLayouts = ensureCompleteLayouts(layouts);
      setLayouts(completeLayouts);
      setInitializedLayouts(true);
    }
  }, [initializedLayouts, tiles.length, setLayouts, ensureCompleteLayouts]); // Only depend on tiles.length, not tiles array

  // Compute layouts for a specific breakpoint with inheritance logic
  const computeLayoutsForBreakpoint = useCallback((breakpoint: string) => {
    return tiles.map((tile, index) => {
      let layoutItem;
      
      // Check if this tile is globally locked first
      if (isTileLocked(tile.id)) {
        const lockedPosition = lockedPositions[tile.id];
        
        if (lockedPosition && lockedPosition.layouts && lockedPosition.layouts[breakpoint]) {
          // Use the exact stored position for this breakpoint (no scaling)
          layoutItem = { ...lockedPosition.layouts[breakpoint], static: true };
        } else {
          // No stored locked position for this breakpoint, use current layout or generate default
          layoutItem = layouts[breakpoint]?.find(l => l.i === `tile-${tile.id}`) || 
                      generateDefaultLayoutForBreakpoint(breakpoint, tile.id, index);
          // Still mark as static to prevent dragging
          layoutItem = { ...layoutItem, static: true };
        }
      } else {
        // Normal inheritance logic for non-locked tiles
        const inheritanceMode = layoutInheritance[tile.id]?.[breakpoint as 'lg' | 'md' | 'sm' | 'xs'];
        
        if (inheritanceMode === 'inherit' || !inheritanceMode) {
          // Use inherited layout
          layoutItem = getInheritedLayout(tile.id, breakpoint);
        } else {
          // Use stored layout for custom
          layoutItem = layouts[breakpoint]?.find(l => l.i === `tile-${tile.id}`);
        }
        
        // Fallback to generated default
        if (!layoutItem) {
          layoutItem = generateDefaultLayoutForBreakpoint(breakpoint, tile.id, index);
        }
      }
      
      return layoutItem;
    });
  }, [tiles, layouts, layoutInheritance, getInheritedLayout, generateDefaultLayoutForBreakpoint, isTileLocked, lockedPositions]);

  // Create computed layouts that respect inheritance for all breakpoints
  const computedLayouts = useMemo(() => {
    const breakpoints = ['lg', 'md', 'sm', 'xs'];
    const computed: Layouts = {};
    
    breakpoints.forEach(bp => {
      computed[bp] = computeLayoutsForBreakpoint(bp);
    });
    
    return computed;
  }, [computeLayoutsForBreakpoint]);

  // Convert tiles to grid items with proper layouts (for edit mode)
  const gridItems = useMemo(() => {
    // Use editing breakpoint in edit mode, current breakpoint otherwise
    const activeBreakpoint = isEditMode ? editingBreakpoint : currentBreakpoint;
    
    return tiles.map((tile, index) => {
      // Get the computed layout for this breakpoint
      const layoutItem = computeLayoutsForBreakpoint(activeBreakpoint)[index];
      const inheritanceMode = layoutInheritance[tile.id]?.[activeBreakpoint as 'lg' | 'md' | 'sm' | 'xs'];
      
      return {
        ...tile,
        gridLayout: layoutItem,
        inheritanceMode: inheritanceMode || 'inherit',
      };
    });
  }, [tiles, computeLayoutsForBreakpoint, currentBreakpoint, editingBreakpoint, isEditMode, layoutInheritance]);

  // Debounce timer ref for layout changes
  const layoutChangeTimer = useRef<NodeJS.Timeout>();

  /**
   * Handle layout changes with debouncing to prevent excessive updates
   * Debounced to 150ms to balance responsiveness with performance
   */
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: any) => {
    // Clear existing timer
    if (layoutChangeTimer.current) {
      clearTimeout(layoutChangeTimer.current);
    }

    // When a tile is moved/resized, mark it as custom for this breakpoint
    const activeBreakpoint = isEditMode ? editingBreakpoint : currentBreakpoint;
    
    // Only process changes if we're in edit mode
    if (isEditMode) {
      // Debounce the layout update to prevent excessive re-renders
      layoutChangeTimer.current = setTimeout(() => {
        currentLayout.forEach(layout => {
          const tileId = layout.i.replace('tile-', '');
          const currentInheritance = layoutInheritance[tileId]?.[activeBreakpoint as 'lg' | 'md' | 'sm' | 'xs'];
          
          // Only update if not already custom and not globally locked
          if (currentInheritance !== 'custom' && !isTileLocked(tileId)) {
            updateTileInheritance(tileId, activeBreakpoint, 'custom');
          }
        });
        
        // Only update the specific breakpoint that changed, preserve others
        setLayouts(prev => ({
          ...prev,
          [activeBreakpoint]: currentLayout
        }));
      }, 150); // 150ms debounce
    }
  }, [setLayouts, isEditMode, editingBreakpoint, currentBreakpoint, layoutInheritance, updateTileInheritance, isTileLocked]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (layoutChangeTimer.current) {
        clearTimeout(layoutChangeTimer.current);
      }
    };
  }, []);

  const handleBreakpointChange = useCallback((newBreakpoint: string) => {
    setCurrentBreakpoint(newBreakpoint);
  }, [setCurrentBreakpoint]);

  const handleExpand = (tile: TileData) => {
    setExpandedTile(tile);
  };

  const handleCloseExpanded = () => {
    setExpandedTile(null);
  };

  // Breakpoint configuration
  const editingCols = BREAKPOINT_COLUMNS[editingBreakpoint as keyof typeof BREAKPOINT_COLUMNS] || BREAKPOINT_COLUMNS.lg;
  
  // Base grid configuration - memoized to prevent unnecessary re-creation
  const baseGridConfig = useMemo(() => ({
    className: cn('layout', className),
    rowHeight: GRID_CONFIG.ROW_HEIGHT,
    margin: GRID_CONFIG.MARGIN,
    containerPadding: GRID_CONFIG.CONTAINER_PADDING,
    isDraggable: isEditMode,
    isResizable: isEditMode,
    resizeHandles: GRID_CONFIG.RESIZE_HANDLES,
    compactType: 'vertical' as const,
    preventCollision: false,
    useCSSTransforms: true,
  }), [className, isEditMode]);

  if (!isEditMode) {
    // View mode - use ResponsiveGridLayout in read-only mode
    return (
      <>
        <div className={cn(
          'grid-layout-wrapper',
          className
        )}>
          <ResponsiveGridLayout 
            key={`grid-${Array.from(lockedTiles).sort().join('-')}`} // Force re-render when locked state changes
            {...baseGridConfig}
            layouts={computedLayouts}
            onLayoutChange={() => {}} // Disable layout changes in view mode
            onBreakpointChange={handleBreakpointChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }} // Keep hardcoded for react-grid-layout compatibility  
            cols={BREAKPOINT_COLUMNS}
            isDraggable={false}
            isResizable={false}
            compactType={null} // Disable auto-compaction in view mode
            preventCollision={true} // Prevent any automatic rearrangement
            allowOverlap={false} // Prevent tiles from overlapping
            isBounded={true} // Keep tiles within bounds
          >
            {gridItems.map((tile) => (
              <LayoutTile 
                key={`tile-${tile.id}`}
                tile={tile}
                onExpand={() => handleExpand(tile)}
                className="grid-item-content"
              />
            ))}
          </ResponsiveGridLayout>
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

  // Edit mode - use static GridLayout with fixed columns for the editing breakpoint
  // Get the layout for the current editing breakpoint
  const editModeLayout = gridItems.map(item => item.gridLayout);
  
  return (
    <>
      <div className={cn(
        'grid-layout-wrapper',
        isEditMode && 'edit-mode',
        className
      )}>
        <GridLayoutWithProvider 
          {...baseGridConfig}
          layout={editModeLayout}
          onLayoutChange={(newLayout) => {
            // Update layouts for the editing breakpoint
            const updatedLayouts = { ...layouts, [editingBreakpoint]: newLayout };
            handleLayoutChange(newLayout, updatedLayouts);
          }}
          cols={editingCols}
        >
          {gridItems.map((tile) => (
            <LayoutTile 
              key={`tile-${tile.id}`}
              tile={tile}
              onExpand={() => handleExpand(tile)}
              className="grid-item-content"
            />
          ))}
        </GridLayoutWithProvider>
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