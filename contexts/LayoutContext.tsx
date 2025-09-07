'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Layout } from 'react-grid-layout';
import { 
  LayoutContextType, 
  InheritanceMode, 
  TileInheritance, 
  Layouts, 
  LayoutItem, 
  Breakpoint,
  LockedPosition
} from '@/lib/types';
import { 
  BREAKPOINTS, 
  BREAKPOINT_COLUMNS, 
  BREAKPOINT_ORDER, 
  GRID_CONFIG,
  STORAGE_KEYS
} from '@/lib/constants';

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Default layouts for different breakpoints - IDs match TileContext
const getDefaultLayouts = (): Layouts => {
  // Large breakpoint (12 columns)
  const lgTiles: LayoutItem[] = [
    { i: 'tile-1', x: 0, y: 0, w: 6, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-2', x: 6, y: 0, w: 6, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-3', x: 0, y: 4, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-4', x: 4, y: 4, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-5', x: 8, y: 4, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
  ];

  // Medium breakpoint (10 columns)
  const mdTiles: LayoutItem[] = [
    { i: 'tile-1', x: 0, y: 0, w: 5, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-2', x: 5, y: 0, w: 5, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-3', x: 0, y: 4, w: 3, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-4', x: 3, y: 4, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-5', x: 7, y: 4, w: 3, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
  ];

  // Small breakpoint (6 columns)
  const smTiles: LayoutItem[] = [
    { i: 'tile-1', x: 0, y: 0, w: 6, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-2', x: 0, y: 4, w: 6, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-3', x: 0, y: 8, w: 3, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-4', x: 3, y: 8, w: 3, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-5', x: 0, y: 11, w: 6, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
  ];

  // Extra small breakpoint (4 columns)
  const xsTiles: LayoutItem[] = [
    { i: 'tile-1', x: 0, y: 0, w: 4, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-2', x: 0, y: 4, w: 4, h: GRID_CONFIG.DEFAULT_HEIGHT, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-3', x: 0, y: 8, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-4', x: 0, y: 11, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
    { i: 'tile-5', x: 0, y: 14, w: 4, h: 3, minW: GRID_CONFIG.MIN_WIDTH, minH: GRID_CONFIG.MIN_HEIGHT },
  ];

  return {
    lg: lgTiles,
    md: mdTiles,
    sm: smTiles,
    xs: xsTiles,
  };
};

// These are now imported from constants

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Layouts>(getDefaultLayouts());
  const [savedLayouts, setSavedLayouts] = useState<Layouts>(layouts);
  
  // Determine initial breakpoint based on viewport width
  const getBreakpointFromWidth = (width: number): Breakpoint => {
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState(() => {
    if (typeof window !== 'undefined') {
      return getBreakpointFromWidth(window.innerWidth);
    }
    return 'lg';
  });
  const [editingBreakpoint, setEditingBreakpoint] = useState(() => {
    if (typeof window !== 'undefined') {
      return getBreakpointFromWidth(window.innerWidth);
    }
    return 'lg';
  });
  const [layoutInheritance, setLayoutInheritance] = useState<{ [tileId: string]: TileInheritance }>({});
  const [savedInheritance, setSavedInheritance] = useState<{ [tileId: string]: TileInheritance }>({});
  const [simulatedViewport, setSimulatedViewport] = useState<number | undefined>();
  const [lockedTiles, setLockedTiles] = useState<Set<string>>(new Set());
  const [savedLockedTiles, setSavedLockedTiles] = useState<Set<string>>(new Set());
  const [lockedPositions, setLockedPositions] = useState<{ [tileId: string]: { layout: Layout; sourceBreakpoint: string } }>({});
  const [savedLockedPositions, setSavedLockedPositions] = useState<{ [tileId: string]: { layout: Layout; sourceBreakpoint: string } }>({});

  // Track which layouts are custom (user-modified)
  const [customLayouts, setCustomLayouts] = useState<{ [breakpoint: string]: string[] }>({
    lg: [],
    md: [],
    sm: [],
    xs: [],
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

  // Load layouts and inheritance from localStorage on mount
  useEffect(() => {
    const savedLayoutData = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
    const savedInheritanceData = localStorage.getItem(STORAGE_KEYS.INHERITANCE);
    const savedCustomData = localStorage.getItem(STORAGE_KEYS.CUSTOM_LAYOUTS);
    const savedLockedData = localStorage.getItem(STORAGE_KEYS.LOCKED_TILES);
    const savedLockedPositionsData = localStorage.getItem(STORAGE_KEYS.LOCKED_POSITIONS);
    
    if (savedLayoutData) {
      try {
        const parsedLayouts = JSON.parse(savedLayoutData);
        setLayouts(parsedLayouts);
        setSavedLayouts(parsedLayouts);
      } catch (error) {
        console.error('Failed to load saved layouts:', error);
      }
    }
    
    if (savedInheritanceData) {
      try {
        const parsedInheritance = JSON.parse(savedInheritanceData);
        setLayoutInheritance(parsedInheritance);
        setSavedInheritance(parsedInheritance);
      } catch (error) {
        console.error('Failed to load saved inheritance:', error);
      }
    }
    
    if (savedCustomData) {
      try {
        const parsedCustom = JSON.parse(savedCustomData);
        setCustomLayouts(parsedCustom);
      } catch (error) {
        console.error('Failed to load custom layouts:', error);
      }
    }

    if (savedLockedData) {
      try {
        const parsedLocked = JSON.parse(savedLockedData);
        const lockedSet = new Set(Array.isArray(parsedLocked) ? parsedLocked : []);
        setLockedTiles(lockedSet);
        setSavedLockedTiles(lockedSet);
      } catch (error) {
        console.error('Failed to load locked tiles:', error);
      }
    }

    if (savedLockedPositionsData) {
      try {
        const parsedLockedPositions = JSON.parse(savedLockedPositionsData);
        // Check if this is the old format and migrate to new format
        const migratedPositions: { [tileId: string]: { layouts: { [breakpoint: string]: LayoutItem } } } = {};
        
        Object.keys(parsedLockedPositions || {}).forEach(tileId => {
          const position = parsedLockedPositions[tileId];
          // Check if it's the old format (has layout and sourceBreakpoint)
          if (position.layout && position.sourceBreakpoint) {
            console.log(`Clearing old locked position format for tile ${tileId}`);
            // Skip migration - let user re-lock tiles with new format
          } else if (position.layouts) {
            // New format - keep it
            migratedPositions[tileId] = position;
          }
        });
        
        setLockedPositions(migratedPositions);
        setSavedLockedPositions(migratedPositions);
      } catch (error) {
        console.error('Failed to load locked positions:', error);
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
   * Get inherited layout for a tile at a specific breakpoint
   * Follows inheritance chain from larger breakpoints
   */
  const getInheritedLayout = useCallback((
    tileId: string,
    breakpoint: string
  ): LayoutItem | undefined => {
    const tileKey = `tile-${tileId}`;
    const inheritance = layoutInheritance[tileId]?.[breakpoint as Breakpoint];
    
    // If custom, use the stored layout
    if (inheritance === 'custom') {
      return layouts[breakpoint]?.find(l => l.i === tileKey);
    }
    
    // If inherit, find the next larger breakpoint with a layout
    const targetIndex = BREAKPOINT_ORDER.indexOf(breakpoint as Breakpoint);
    if (targetIndex === -1) {
      console.warn(`Invalid breakpoint: ${breakpoint}`);
      return layouts[breakpoint]?.find(l => l.i === tileKey);
    }
    
    for (let i = targetIndex - 1; i >= 0; i--) {
      const sourceBreakpoint = BREAKPOINT_ORDER[i];
      const sourceLayout = layouts[sourceBreakpoint]?.find(l => l.i === tileKey);
      
      if (sourceLayout) {
        const sourceInheritance = layoutInheritance[tileId]?.[sourceBreakpoint];
        // Only inherit from custom layouts or if we're at the largest breakpoint
        if (sourceInheritance === 'custom' || i === 0) {
          return scaleLayout(sourceLayout, sourceBreakpoint, breakpoint);
        }
      }
    }
    
    // Fallback to the stored layout if no inheritance found
    return layouts[breakpoint]?.find(l => l.i === tileKey);
  }, [layouts, layoutInheritance, scaleLayout]);

  // Update tile inheritance mode
  const updateTileInheritance = useCallback((
    tileId: string,
    breakpoint: string,
    mode: InheritanceMode
  ) => {
    setLayoutInheritance(prev => ({
      ...prev,
      [tileId]: {
        ...prev[tileId],
        [breakpoint]: mode,
      },
    }));
    
    // Update custom layouts tracking
    if (mode === 'custom') {
      setCustomLayouts(prev => ({
        ...prev,
        [breakpoint]: [...new Set([...(prev[breakpoint] || []), tileId])],
      }));
    } else {
      setCustomLayouts(prev => ({
        ...prev,
        [breakpoint]: (prev[breakpoint] || []).filter(id => id !== tileId),
      }));
    }
  }, []);

  /**
   * Set a tile as locked or unlocked globally
   * When locking, captures all breakpoint layout positions
   */
  const setTileLocked = useCallback((
    tileId: string, 
    locked: boolean, 
    allBreakpointLayouts?: { [breakpoint: string]: LayoutItem }
  ) => {
    setLockedTiles(prev => {
      const newSet = new Set(prev);
      if (locked) {
        newSet.add(tileId);
        
        // Store all breakpoint positions if provided
        if (allBreakpointLayouts) {
          setLockedPositions(prevPos => ({
            ...prevPos,
            [tileId]: {
              layouts: allBreakpointLayouts
            }
          }));
        }
      } else {
        newSet.delete(tileId);
        
        // Remove the locked position
        setLockedPositions(prevPos => {
          const newPos = { ...prevPos };
          delete newPos[tileId];
          return newPos;
        });
      }
      return newSet;
    });
  }, []);

  const isTileLocked = useCallback((tileId: string) => {
    return lockedTiles.has(tileId);
  }, [lockedTiles]);

  /**
   * Save all layout data to localStorage and exit edit mode
   */
  const saveLayouts = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));
      localStorage.setItem(STORAGE_KEYS.INHERITANCE, JSON.stringify(layoutInheritance));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(customLayouts));
      localStorage.setItem(STORAGE_KEYS.LOCKED_TILES, JSON.stringify(Array.from(lockedTiles)));
      localStorage.setItem(STORAGE_KEYS.LOCKED_POSITIONS, JSON.stringify(lockedPositions));
      
      setSavedLayouts(layouts);
      setSavedInheritance(layoutInheritance);
      setSavedLockedTiles(new Set(lockedTiles));
      setSavedLockedPositions({ ...lockedPositions });
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save layout data:', error);
    }
  };

  const cancelEdit = () => {
    setLayouts(savedLayouts);
    setLayoutInheritance(savedInheritance);
    setLockedTiles(savedLockedTiles);
    setLockedPositions(savedLockedPositions);
    setEditMode(false);
  };

  /**
   * Reset all layout data to default values
   */
  const resetToDefault = () => {
    try {
      const defaultLayouts = getDefaultLayouts();
      const emptySet = new Set<string>();
      const emptyPositions = {};
      
      setLayouts(defaultLayouts);
      setLayoutInheritance({});
      setCustomLayouts({ lg: [], md: [], sm: [], xs: [] });
      setLockedTiles(emptySet);
      setLockedPositions(emptyPositions);
      
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(defaultLayouts));
      localStorage.removeItem(STORAGE_KEYS.INHERITANCE);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LAYOUTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKED_TILES);
      localStorage.removeItem(STORAGE_KEYS.LOCKED_POSITIONS);
      
      setSavedLayouts(defaultLayouts);
      setSavedInheritance({});
      setSavedLockedTiles(emptySet);
      setSavedLockedPositions(emptyPositions);
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
      
      // Clear inheritance for this breakpoint
      const newInheritance = { ...layoutInheritance };
      Object.keys(newInheritance).forEach(tileId => {
        if (newInheritance[tileId]) {
          delete newInheritance[tileId][breakpoint as Breakpoint];
        }
      });
      setLayoutInheritance(newInheritance);
      
      // Clear custom layouts for this breakpoint
      setCustomLayouts(prev => ({
        ...prev,
        [breakpoint]: [],
      }));
    } catch (error) {
      console.error(`Failed to reset breakpoint ${breakpoint}:`, error);
    }
  };

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

      // Remove inheritance settings
      setLayoutInheritance(prev => {
        const updated = { ...prev };
        delete updated[tileId];
        return updated;
      });

      // Remove from custom layouts tracking
      setCustomLayouts(prev => {
        const updated: { [breakpoint: string]: string[] } = {};
        Object.keys(prev).forEach(bp => {
          updated[bp] = prev[bp].filter(id => id !== tileId);
        });
        return updated;
      });

      // Remove locked state and position
      if (lockedTiles.has(tileId)) {
        setLockedTiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(tileId);
          return newSet;
        });
      }

      if (lockedPositions[tileId]) {
        setLockedPositions(prev => {
          const updated = { ...prev };
          delete updated[tileId];
          return updated;
        });
      }

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

        setSavedInheritance(prev => {
          const updated = { ...prev };
          delete updated[tileId];
          return updated;
        });

        if (savedLockedTiles.has(tileId)) {
          setSavedLockedTiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(tileId);
            return newSet;
          });
        }

        if (savedLockedPositions[tileId]) {
          setSavedLockedPositions(prev => {
            const updated = { ...prev };
            delete updated[tileId];
            return updated;
          });
        }
      }

      console.log(`Cleaned up layout data for tile ${tileId}`);
    } catch (error) {
      console.error(`Failed to cleanup tile data for ${tileId}:`, error);
    }
  }, [lockedTiles, lockedPositions, isEditMode, savedLockedTiles, savedLockedPositions]);

  const value: LayoutContextType = {
    isEditMode,
    setEditMode,
    layouts,
    setLayouts,
    currentBreakpoint,
    setCurrentBreakpoint,
    editingBreakpoint,
    setEditingBreakpoint,
    layoutInheritance,
    setLayoutInheritance,
    updateTileInheritance,
    customLayouts,
    simulatedViewport,
    setSimulatedViewport,
    getInheritedLayout,
    scaleLayout,
    lockedTiles,
    lockedPositions,
    setTileLocked,
    isTileLocked,
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