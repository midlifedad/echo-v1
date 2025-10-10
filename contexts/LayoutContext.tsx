'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  LayoutContextType, 
  Layouts, 
  LayoutItem, 
  Breakpoint
} from '@/lib/types';
import { 
  BREAKPOINTS, 
  BREAKPOINT_COLUMNS, 
  BREAKPOINT_ORDER, 
  GRID_CONFIG,
  STORAGE_KEYS
} from '@/lib/constants';

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Generate default layouts dynamically based on tile IDs
const generateDefaultLayoutsForTiles = (tileIds: string[]): Layouts => {
  const layouts: Layouts = { lg: [], md: [], sm: [] };
  
  // For each breakpoint, generate a sensible grid layout
  const breakpointConfigs = {
    lg: { cols: 12, tilesPerRow: 3 },
    md: { cols: 10, tilesPerRow: 2 },
    sm: { cols: 6, tilesPerRow: 1 }
  };
  
  Object.entries(breakpointConfigs).forEach(([breakpoint, config]) => {
    const tiles: LayoutItem[] = [];
    let currentY = 0;
    
    tileIds.forEach((tileId, index) => {
      const col = index % config.tilesPerRow;
      const row = Math.floor(index / config.tilesPerRow);
      const tileWidth = Math.floor(config.cols / config.tilesPerRow);
      
      tiles.push({
        i: tileId,
        x: col * tileWidth,
        y: row * GRID_CONFIG.DEFAULT_HEIGHT,
        w: tileWidth,
        h: GRID_CONFIG.DEFAULT_HEIGHT,
        minW: GRID_CONFIG.MIN_WIDTH,
        minH: GRID_CONFIG.MIN_HEIGHT
      });
    });
    
    layouts[breakpoint] = tiles;
  });
  
  return layouts;
};

// Legacy default layouts for initial state (when no tiles are loaded)
const getDefaultLayouts = (): Layouts => {
  // Generate default for first 5 tiles as fallback
  return generateDefaultLayoutsForTiles([
    'tile-1', 'tile-2', 'tile-3', 'tile-4', 'tile-5'
  ]);
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Layouts>(getDefaultLayouts());
  const [savedLayouts, setSavedLayouts] = useState<Layouts>(layouts);
  
  // Simplified: Use responsive layouts by default, custom overrides per breakpoint
  const [useResponsiveLayout, setUseResponsiveLayout] = useState(true);
  const [savedUseResponsiveLayout, setSavedUseResponsiveLayout] = useState(true);
  const [simulatedViewport, setSimulatedViewport] = useState<number | undefined>();
  
  // Track which breakpoints have been customized
  const [customBreakpoints, setCustomBreakpoints] = useState<Set<string>>(new Set());
  
  // Edit all breakpoints mode - when true, changes apply to all breakpoints
  const [editAllBreakpoints, setEditAllBreakpoints] = useState(false);
  
  // Determine initial breakpoint based on viewport width
  const getBreakpointFromWidth = (width: number): Breakpoint => {
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    return 'sm';
  };
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window !== 'undefined') {
      return getBreakpointFromWidth(window.innerWidth);
    }
    return 'lg';
  });
  const [editingBreakpoint, setEditingBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window !== 'undefined') {
      return getBreakpointFromWidth(window.innerWidth);
    }
    return 'lg';
  });

  // Update currentBreakpoint on window resize
  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpointFromWidth(window.innerWidth);
      setCurrentBreakpoint(newBreakpoint);
      // When not in edit mode, also update editingBreakpoint to match
      if (!isEditMode) {
        setEditingBreakpoint(newBreakpoint);
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Call once on mount to ensure correct initial value
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isEditMode]);

  // Load layouts from localStorage on mount
  useEffect(() => {
    const savedLayoutData = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
    const savedResponsiveData = localStorage.getItem('dashboard_responsive_mode');
    const savedCustomData = localStorage.getItem('dashboard_custom_breakpoints');
    
    if (savedLayoutData) {
      try {
        const parsedLayouts = JSON.parse(savedLayoutData);
        setLayouts(parsedLayouts);
        setSavedLayouts(parsedLayouts);
      } catch (error) {
        console.error('Failed to load saved layouts:', error);
      }
    }
    
    if (savedResponsiveData) {
      try {
        const parsedResponsive = JSON.parse(savedResponsiveData);
        setUseResponsiveLayout(parsedResponsive);
        setSavedUseResponsiveLayout(parsedResponsive);
      } catch (error) {
        console.error('Failed to load responsive mode:', error);
      }
    }
    
    if (savedCustomData) {
      try {
        const parsedCustom = JSON.parse(savedCustomData);
        setCustomBreakpoints(new Set(parsedCustom));
      } catch (error) {
        console.error('Failed to load custom breakpoints:', error);
      }
    }
  }, []);

  /**
   * Scale a layout item from one breakpoint to another
   * Maintains aspect ratio and ensures minimum constraints
   */
  const scaleLayout = useCallback((
    layout: LayoutItem,
    fromBreakpoint: string,
    toBreakpoint: string
  ): LayoutItem => {
    const fromCols = BREAKPOINT_COLUMNS[fromBreakpoint as keyof typeof BREAKPOINT_COLUMNS];
    const toCols = BREAKPOINT_COLUMNS[toBreakpoint as keyof typeof BREAKPOINT_COLUMNS];
    
    if (!fromCols || !toCols) {
      console.warn(`Invalid breakpoint for scaling: ${fromBreakpoint} -> ${toBreakpoint}`);
      return layout;
    }
    
    const ratio = toCols / fromCols;
    
    return {
      ...layout,
      x: Math.round(layout.x * ratio),
      w: Math.max(layout.minW || GRID_CONFIG.MIN_WIDTH, Math.round(layout.w * ratio)),
      // Keep y and h the same to preserve vertical layout
      y: layout.y,
      h: layout.h,
    };
  }, []);

  /**
   * Get layout for a breakpoint - either custom or responsive scaled
   */
  const getBreakpointLayout = useCallback((breakpoint: Breakpoint): LayoutItem[] => {
    // Always prefer stored layouts if they exist
    // This prevents layout jumping when switching between view/edit modes
    const storedLayout = layouts[breakpoint];
    if (storedLayout && storedLayout.length > 0) {
      return storedLayout;
    }
    
    // If this breakpoint has custom layout or responsive mode is off, use stored layout
    if (customBreakpoints.has(breakpoint) || !useResponsiveLayout) {
      return layouts[breakpoint] || [];
    }
    
    // Otherwise, scale from the largest breakpoint (lg)
    const sourceLayout = layouts.lg || [];
    if (breakpoint === 'lg') {
      return sourceLayout;
    }
    
    // Scale each tile from lg to target breakpoint
    return sourceLayout.map(item => scaleLayout(item, 'lg', breakpoint));
  }, [layouts, customBreakpoints, useResponsiveLayout, scaleLayout]);

  /**
   * Save all layout data to localStorage and exit edit mode
   */
  const saveLayouts = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));
      localStorage.setItem('dashboard_responsive_mode', JSON.stringify(useResponsiveLayout));
      localStorage.setItem('dashboard_custom_breakpoints', JSON.stringify(Array.from(customBreakpoints)));
      
      setSavedLayouts(layouts);
      setSavedUseResponsiveLayout(useResponsiveLayout);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save layout data:', error);
    }
  };

  const cancelEdit = () => {
    // Don't revert layouts - keep the current state to prevent layout jumping
    // Only exit edit mode without changing the layout data
    setEditMode(false);
  };

  /**
   * Reset all layout data to default values
   * @param tileIds - Optional array of tile IDs to generate layouts for. If not provided, uses fallback defaults.
   */
  const resetToDefault = (tileIds?: string[]) => {
    try {
      // Generate layouts based on actual tiles if provided, otherwise use fallback
      const defaultLayouts = tileIds && tileIds.length > 0 
        ? generateDefaultLayoutsForTiles(tileIds)
        : getDefaultLayouts();
      
      setLayouts(defaultLayouts);
      setUseResponsiveLayout(true);
      setCustomBreakpoints(new Set());
      
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(defaultLayouts));
      localStorage.setItem('dashboard_responsive_mode', JSON.stringify(true));
      localStorage.removeItem('dashboard_custom_breakpoints');
      
      setSavedLayouts(defaultLayouts);
      setSavedUseResponsiveLayout(true);
    } catch (error) {
      console.error('Failed to reset layout data:', error);
    }
  };

  /**
   * Reset a specific breakpoint to default layout
   */
  const resetBreakpoint = (breakpoint: string) => {
    try {
      const defaultLayouts = getDefaultLayouts();
      setLayouts(prev => ({
        ...prev,
        [breakpoint]: defaultLayouts[breakpoint],
      }));
      
      // Remove from custom breakpoints
      setCustomBreakpoints(prev => {
        const newSet = new Set(prev);
        newSet.delete(breakpoint);
        return newSet;
      });
    } catch (error) {
      console.error(`Failed to reset breakpoint ${breakpoint}:`, error);
    }
  };

  /**
   * Mark a breakpoint as having custom layout
   */
  const markBreakpointAsCustom = useCallback((breakpoint: string) => {
    setCustomBreakpoints(prev => new Set(prev).add(breakpoint));
  }, []);

  /**
   * Clean up layout data for a removed tile
   * Called when a tile is deleted to prevent memory leaks
   */
  const cleanupTileData = useCallback((tileId: string) => {
    try {
      // Remove from all layout breakpoints
      setLayouts(prev => {
        const updatedLayouts: Layouts = {};
        BREAKPOINT_ORDER.forEach(bp => {
          if (prev[bp]) {
            updatedLayouts[bp] = prev[bp].filter(layout => layout.i !== `tile-${tileId}`);
          }
        });
        return updatedLayouts;
      });

      // Update saved states if not in edit mode
      if (!isEditMode) {
        setSavedLayouts(prev => {
          const updatedLayouts: Layouts = {};
          BREAKPOINT_ORDER.forEach(bp => {
            if (prev[bp]) {
              updatedLayouts[bp] = prev[bp].filter(layout => layout.i !== `tile-${tileId}`);
            }
          });
          return updatedLayouts;
        });
      }

      console.log(`Cleaned up layout data for tile ${tileId}`);
    } catch (error) {
      console.error(`Failed to cleanup tile data for ${tileId}:`, error);
    }
  }, [isEditMode]);

  const value: LayoutContextType = {
    isEditMode,
    setEditMode,
    layouts,
    setLayouts,
    currentBreakpoint,
    setCurrentBreakpoint,
    editingBreakpoint,
    setEditingBreakpoint,
    useResponsiveLayout,
    setUseResponsiveLayout,
    customBreakpoints,
    markBreakpointAsCustom,
    editAllBreakpoints,
    setEditAllBreakpoints,
    simulatedViewport,
    setSimulatedViewport,
    getBreakpointLayout,
    scaleLayout,
    saveLayouts,
    cancelEdit,
    resetToDefault,
    resetBreakpoint,
    cleanupTileData,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}