'use client';

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import GridLayout, { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { useLayout } from '@/contexts/LayoutContext';
import { useTiles } from '@/contexts/TileContext';
import { cn } from '@/lib/utils';
import LayoutTile from './LayoutTile';
import LayoutTileFullscreen from './LayoutTileFullscreen';
import { TileData, Breakpoint } from '@/lib/types';
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
    useResponsiveLayout,
    customBreakpoints,
    markBreakpointAsCustom,
    getBreakpointLayout,
    editAllBreakpoints,
  } = useLayout();
  const { tiles, reorderTiles } = useTiles();
  const [expandedTile, setExpandedTile] = React.useState<TileData | null>(null);
  const [initializedLayouts, setInitializedLayouts] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Track modal state from DOM
  useEffect(() => {
    const checkModals = () => {
      // Check for any open dialogs by looking for dialog elements with open state
      const hasOpenModal = document.querySelector('[role="dialog"][data-state="open"]') !== null;
      setIsModalOpen(hasOpenModal);
    };

    // Check on mount and set up observer
    checkModals();
    
    // Use MutationObserver to track dialog state changes
    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state']
    });

    return () => observer.disconnect();
  }, []);

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
    const breakpoints = ['lg', 'md', 'sm'];
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

  // Compute layouts for all breakpoints using the simplified logic
  const computedLayouts = useMemo(() => {
    const breakpoints = ['lg', 'md', 'sm'] as const;
    const computed: Layouts = {};
    
    breakpoints.forEach(bp => {
      computed[bp] = getBreakpointLayout(bp);
    });
    
    return computed;
  }, [getBreakpointLayout]);

  // Convert tiles to grid items with proper layouts (for edit mode)
  const gridItems = useMemo(() => {
    // Use editing breakpoint in edit mode, current breakpoint otherwise
    const activeBreakpoint = isEditMode ? editingBreakpoint : currentBreakpoint;
    const activeLayout = getBreakpointLayout(activeBreakpoint as Breakpoint);
    
    return tiles.map((tile, index) => {
      // Find the layout for this tile
      const layoutItem = activeLayout.find(l => l.i === `tile-${tile.id}`) || 
                        generateDefaultLayoutForBreakpoint(activeBreakpoint, tile.id, index);
      
      // Apply lock state to grid layout and ensure current min height
      const gridLayoutWithLock = {
        ...layoutItem,
        minH: GRID_CONFIG.MIN_HEIGHT,  // Force the current min height from constants
        static: tile.isLocked || false
      };
      
      return {
        ...tile,
        gridLayout: gridLayoutWithLock,
      };
    });
  }, [tiles, getBreakpointLayout, generateDefaultLayoutForBreakpoint, currentBreakpoint, editingBreakpoint, isEditMode]);

  // Debounce timer ref for layout changes
  const layoutChangeTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle layout changes with debouncing to prevent excessive updates
   * Debounced to 150ms to balance responsiveness with performance
   */
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Layouts) => {
    // Clear existing timer
    if (layoutChangeTimer.current) {
      clearTimeout(layoutChangeTimer.current);
    }

    // When a tile is moved/resized, mark this breakpoint as custom
    const activeBreakpoint = isEditMode ? editingBreakpoint : currentBreakpoint;
    
    // Only process changes if we're in edit mode
    if (isEditMode) {
      // Debounce the layout update to prevent excessive re-renders
      layoutChangeTimer.current = setTimeout(() => {
        if (editAllBreakpoints) {
          // Apply changes to all breakpoints
          const breakpoints = ['lg', 'md', 'sm'];
          const updatedLayouts: Layouts = {};
          
          breakpoints.forEach(bp => {
            // Mark each breakpoint as custom
            markBreakpointAsCustom(bp);
            // Apply the same layout to each breakpoint (adjusting for column differences)
            updatedLayouts[bp] = currentLayout;
          });
          
          setLayouts((prev: Layouts) => ({
            ...prev,
            ...updatedLayouts
          }));
        } else {
          // Mark this breakpoint as having custom layout
          markBreakpointAsCustom(activeBreakpoint);
          
          // Only update the specific breakpoint that changed, preserve others
          setLayouts((prev: Layouts) => ({
            ...prev,
            [activeBreakpoint]: currentLayout
          }));
        }
      }, 150); // 150ms debounce
    }
  }, [setLayouts, isEditMode, editingBreakpoint, currentBreakpoint, markBreakpointAsCustom, editAllBreakpoints]);

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
    isDraggable: isEditMode && !isModalOpen,
    isResizable: isEditMode && !isModalOpen,
    resizeHandles: GRID_CONFIG.RESIZE_HANDLES,
    compactType: null,
    preventCollision: true,
    useCSSTransforms: true,
  }), [className, isEditMode, isModalOpen]);

  if (!isEditMode) {
    // View mode - use ResponsiveGridLayout in read-only mode
    return (
      <>
        <div 
          className={cn(
            'grid-layout-wrapper',
            isModalOpen && 'pointer-events-none',
            className
          )}
          onClick={isModalOpen ? (e) => e.stopPropagation() : undefined}
          onPointerDown={isModalOpen ? (e) => e.stopPropagation() : undefined}
        >
          <ResponsiveGridLayout 
            {...baseGridConfig}
            layouts={computedLayouts}
            onLayoutChange={() => {}} // Disable layout changes in view mode
            onBreakpointChange={handleBreakpointChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }} // Keep hardcoded for react-grid-layout compatibility  
            cols={BREAKPOINT_COLUMNS}
            isDraggable={false}
            isResizable={false}
            compactType={null} // Disable auto-compaction in view mode
            preventCollision={true} // Prevent any automatic rearrangement
            allowOverlap={false} // Prevent tiles from overlapping
            isBounded={true} // Keep tiles within bounds
          >
            {gridItems.map((tile) => (
              <div key={`tile-${tile.id}`}>
                <LayoutTile 
                  tile={tile}
                  onExpand={() => handleExpand(tile)}
                  className="grid-item-content"
                />
              </div>
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
  // Use the same computed layout as view mode for consistency
  const editModeLayout = computedLayouts[editingBreakpoint] || gridItems.map(item => item.gridLayout);
  
  return (
    <>
      <div 
        className={cn(
          'grid-layout-wrapper',
          isEditMode && 'edit-mode',
          isModalOpen && 'pointer-events-none',
          className
        )}
        onClick={isModalOpen ? (e) => e.stopPropagation() : undefined}
        onPointerDown={isModalOpen ? (e) => e.stopPropagation() : undefined}
      >
        <GridLayoutWithProvider 
          {...baseGridConfig}
          layout={editModeLayout}
          onLayoutChange={(newLayout) => {
            // Update layouts for the editing breakpoint
            const updatedLayouts = { ...layouts, [editingBreakpoint]: newLayout };
            handleLayoutChange(newLayout, updatedLayouts);
          }}
          cols={editingCols}
          compactType={null}
          preventCollision={true}
        >
          {gridItems.map((tile) => (
            <div key={`tile-${tile.id}`}>
              <LayoutTile 
                tile={tile}
                onExpand={() => handleExpand(tile)}
                className="grid-item-content"
              />
            </div>
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