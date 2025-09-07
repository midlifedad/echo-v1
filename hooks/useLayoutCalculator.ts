'use client';

import { useCallback, useMemo } from 'react';
import { LayoutItem, Layouts, Breakpoint, TileData } from '@/lib/types';
import { BREAKPOINT_COLUMNS, BREAKPOINT_ORDER, GRID_CONFIG } from '@/lib/constants';

interface LayoutCalculatorOptions {
  tiles: TileData[];
  layouts: Layouts;
  layoutInheritance: { [tileId: string]: { [key in Breakpoint]?: 'inherit' | 'custom' } };
  lockedTiles: Set<string>;
  lockedPositions: { [tileId: string]: { layout: LayoutItem; sourceBreakpoint: string } };
}

/**
 * Custom hook for managing layout calculations
 * Centralizes all layout computation logic
 */
export function useLayoutCalculator({
  tiles,
  layouts,
  layoutInheritance,
  lockedTiles,
  lockedPositions,
}: LayoutCalculatorOptions) {
  /**
   * Generate a default layout for a tile at a specific breakpoint
   * Uses intelligent positioning based on breakpoint characteristics
   */
  const generateDefaultLayout = useCallback((
    breakpoint: Breakpoint,
    tileId: string,
    index: number
  ): LayoutItem => {
    const cols = BREAKPOINT_COLUMNS[breakpoint];
    
    // Smart layout generation based on breakpoint
    let w: number, x: number, y: number;
    
    switch(breakpoint) {
      case 'lg':
        // 3 columns layout for large screens
        w = Math.floor(cols / 3);
        x = (index * w) % cols;
        y = Math.floor((index * w) / cols) * GRID_CONFIG.DEFAULT_HEIGHT;
        break;
      case 'md':
        // 2 columns for first row, 3 for subsequent
        w = index < 2 ? Math.floor(cols / 2) : Math.floor(cols / 3);
        x = index < 2 ? (index * w) : ((index - 2) * w) % cols;
        y = index < 2 ? 0 : Math.floor((index - 2) / 3 + 1) * GRID_CONFIG.DEFAULT_HEIGHT;
        break;
      case 'sm':
        // 2 columns layout
        w = Math.floor(cols / 2);
        x = (index % 2) * w;
        y = Math.floor(index / 2) * GRID_CONFIG.DEFAULT_HEIGHT;
        break;
      case 'xs':
        // Single column layout
        w = cols;
        x = 0;
        y = index * GRID_CONFIG.DEFAULT_HEIGHT;
        break;
    }
    
    return {
      i: `tile-${tileId}`,
      x,
      y,
      w,
      h: GRID_CONFIG.DEFAULT_HEIGHT,
      minW: GRID_CONFIG.MIN_WIDTH,
      minH: GRID_CONFIG.MIN_HEIGHT,
    };
  }, []);

  /**
   * Scale a layout item from one breakpoint to another
   * Maintains proportions while respecting grid constraints
   */
  const scaleLayout = useCallback((
    layout: LayoutItem,
    fromBreakpoint: string,
    toBreakpoint: string
  ): LayoutItem => {
    const fromCols = BREAKPOINT_COLUMNS[fromBreakpoint as Breakpoint];
    const toCols = BREAKPOINT_COLUMNS[toBreakpoint as Breakpoint];
    
    if (!fromCols || !toCols) {
      console.warn(`Invalid breakpoint for scaling: ${fromBreakpoint} -> ${toBreakpoint}`);
      return layout;
    }
    
    const ratio = toCols / fromCols;
    
    // Scale width and x position, maintain height and y
    const scaledW = Math.max(layout.minW || GRID_CONFIG.MIN_WIDTH, Math.round(layout.w * ratio));
    const scaledX = Math.min(Math.round(layout.x * ratio), toCols - scaledW);
    
    return {
      ...layout,
      x: scaledX,
      w: scaledW,
      // Preserve vertical positioning
      y: layout.y,
      h: layout.h,
    };
  }, []);

  /**
   * Get the inherited layout for a tile at a specific breakpoint
   * Follows the inheritance chain from larger breakpoints
   */
  const getInheritedLayout = useCallback((
    tileId: string,
    breakpoint: Breakpoint
  ): LayoutItem | undefined => {
    const tileKey = `tile-${tileId}`;
    const inheritance = layoutInheritance[tileId]?.[breakpoint];
    
    // If custom, use the stored layout
    if (inheritance === 'custom') {
      return layouts[breakpoint]?.find(l => l.i === tileKey);
    }
    
    // Find the next larger breakpoint with a custom layout
    const targetIndex = BREAKPOINT_ORDER.indexOf(breakpoint);
    
    for (let i = targetIndex - 1; i >= 0; i--) {
      const sourceBreakpoint = BREAKPOINT_ORDER[i];
      const sourceInheritance = layoutInheritance[tileId]?.[sourceBreakpoint];
      
      if (sourceInheritance === 'custom' || i === 0) {
        const sourceLayout = layouts[sourceBreakpoint]?.find(l => l.i === tileKey);
        if (sourceLayout) {
          return scaleLayout(sourceLayout, sourceBreakpoint, breakpoint);
        }
      }
    }
    
    // Fallback to current breakpoint layout
    return layouts[breakpoint]?.find(l => l.i === tileKey);
  }, [layouts, layoutInheritance, scaleLayout]);

  /**
   * Compute layout for a specific tile considering all constraints
   * Handles locked tiles, inheritance, and defaults
   */
  const computeTileLayout = useCallback((
    tile: TileData,
    breakpoint: Breakpoint,
    index: number
  ): LayoutItem => {
    // Handle globally locked tiles
    if (lockedTiles.has(tile.id)) {
      const lockedPosition = lockedPositions[tile.id];
      
      if (lockedPosition) {
        // Scale the locked position to current breakpoint
        const scaledLayout = scaleLayout(
          lockedPosition.layout,
          lockedPosition.sourceBreakpoint,
          breakpoint
        );
        // Mark as static to prevent dragging
        return { ...scaledLayout, static: true };
      }
    }
    
    // Handle inheritance modes
    const inheritanceMode = layoutInheritance[tile.id]?.[breakpoint];
    
    if (inheritanceMode === 'custom') {
      const customLayout = layouts[breakpoint]?.find(l => l.i === `tile-${tile.id}`);
      if (customLayout) return customLayout;
    } else if (inheritanceMode === 'inherit' || !inheritanceMode) {
      const inheritedLayout = getInheritedLayout(tile.id, breakpoint);
      if (inheritedLayout) return inheritedLayout;
    }
    
    // Generate default layout as fallback
    return generateDefaultLayout(breakpoint, tile.id, index);
  }, [lockedTiles, lockedPositions, layoutInheritance, layouts, scaleLayout, getInheritedLayout, generateDefaultLayout]);

  /**
   * Compute layouts for all tiles at a specific breakpoint
   */
  const computeBreakpointLayouts = useCallback((breakpoint: Breakpoint): LayoutItem[] => {
    return tiles.map((tile, index) => computeTileLayout(tile, breakpoint, index));
  }, [tiles, computeTileLayout]);

  /**
   * Compute complete layouts for all breakpoints
   */
  const computeAllLayouts = useMemo((): Layouts => {
    const computed: Layouts = {};
    
    BREAKPOINT_ORDER.forEach(breakpoint => {
      computed[breakpoint] = computeBreakpointLayouts(breakpoint);
    });
    
    return computed;
  }, [computeBreakpointLayouts]);

  /**
   * Ensure complete layouts exist for all tiles and breakpoints
   * Preserves existing layouts while adding missing ones
   */
  const ensureCompleteLayouts = useCallback((currentLayouts: Layouts): Layouts => {
    const completeLayouts: Layouts = {};
    
    BREAKPOINT_ORDER.forEach(bp => {
      const existingLayouts = currentLayouts[bp] || [];
      const updatedLayouts = [...existingLayouts];
      
      // Add missing tiles only
      tiles.forEach((tile, index) => {
        const tileLayoutId = `tile-${tile.id}`;
        const exists = existingLayouts.find(l => l.i === tileLayoutId);
        
        if (!exists) {
          updatedLayouts.push(generateDefaultLayout(bp, tile.id, index));
        }
      });
      
      completeLayouts[bp] = updatedLayouts;
    });
    
    return completeLayouts;
  }, [tiles, generateDefaultLayout]);

  return {
    generateDefaultLayout,
    scaleLayout,
    getInheritedLayout,
    computeTileLayout,
    computeBreakpointLayouts,
    computeAllLayouts,
    ensureCompleteLayouts,
  };
}