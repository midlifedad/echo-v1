import { 
  Layouts, 
  LayoutItem, 
  Breakpoint, 
  InheritanceMode,
  TileInheritance,
  LockedPosition
} from '@/lib/types';
import { BREAKPOINT_ORDER, STORAGE_KEYS } from '@/lib/constants';

// Action types
export type LayoutAction =
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_LAYOUTS'; payload: Layouts }
  | { type: 'UPDATE_LAYOUT'; breakpoint: string; layout: LayoutItem[] }
  | { type: 'SET_CURRENT_BREAKPOINT'; payload: string }
  | { type: 'SET_EDITING_BREAKPOINT'; payload: string }
  | { type: 'UPDATE_TILE_INHERITANCE'; tileId: string; breakpoint: string; mode: InheritanceMode }
  | { type: 'SET_TILE_LOCKED'; tileId: string; locked: boolean; layout?: LayoutItem; sourceBreakpoint?: string }
  | { type: 'SAVE_LAYOUTS' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'RESET_BREAKPOINT'; breakpoint: string }
  | { type: 'CLEANUP_TILE'; tileId: string }
  | { type: 'LOAD_FROM_STORAGE'; layouts?: Layouts; inheritance?: any; locked?: string[]; positions?: any }
  | { type: 'SET_SIMULATED_VIEWPORT'; width?: number };

// State shape
export interface LayoutState {
  isEditMode: boolean;
  layouts: Layouts;
  savedLayouts: Layouts;
  currentBreakpoint: string;
  editingBreakpoint: string;
  layoutInheritance: { [tileId: string]: TileInheritance };
  savedInheritance: { [tileId: string]: TileInheritance };
  lockedTiles: Set<string>;
  savedLockedTiles: Set<string>;
  lockedPositions: { [tileId: string]: LockedPosition };
  savedLockedPositions: { [tileId: string]: LockedPosition };
  customLayouts: { [breakpoint: string]: string[] };
  simulatedViewport?: number;
}

// Default layouts generator
const getDefaultLayouts = (): Layouts => {
  // Import from existing implementation or generate algorithmically
  const layouts: Layouts = {
    lg: [],
    md: [],
    sm: [],
    xs: [],
  };
  
  // This would be populated with actual default layouts
  return layouts;
};

// Initial state
export const getInitialState = (): LayoutState => ({
  isEditMode: false,
  layouts: getDefaultLayouts(),
  savedLayouts: getDefaultLayouts(),
  currentBreakpoint: 'lg',
  editingBreakpoint: 'lg',
  layoutInheritance: {},
  savedInheritance: {},
  lockedTiles: new Set(),
  savedLockedTiles: new Set(),
  lockedPositions: {},
  savedLockedPositions: {},
  customLayouts: { lg: [], md: [], sm: [], xs: [] },
  simulatedViewport: undefined,
});

/**
 * Layout reducer for managing complex state transitions
 * Ensures consistency and predictability in state updates
 */
export function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'SET_EDIT_MODE':
      return {
        ...state,
        isEditMode: action.payload,
      };

    case 'SET_LAYOUTS':
      return {
        ...state,
        layouts: action.payload,
      };

    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layouts: {
          ...state.layouts,
          [action.breakpoint]: action.layout,
        },
      };

    case 'SET_CURRENT_BREAKPOINT':
      return {
        ...state,
        currentBreakpoint: action.payload,
        // Update editing breakpoint when not in edit mode
        editingBreakpoint: state.isEditMode ? state.editingBreakpoint : action.payload,
      };

    case 'SET_EDITING_BREAKPOINT':
      return {
        ...state,
        editingBreakpoint: action.payload,
      };

    case 'UPDATE_TILE_INHERITANCE': {
      const { tileId, breakpoint, mode } = action;
      const updatedInheritance = {
        ...state.layoutInheritance,
        [tileId]: {
          ...state.layoutInheritance[tileId],
          [breakpoint]: mode,
        },
      };

      // Update custom layouts tracking
      let updatedCustom = { ...state.customLayouts };
      if (mode === 'custom') {
        updatedCustom[breakpoint] = [...new Set([...(updatedCustom[breakpoint] || []), tileId])];
      } else {
        updatedCustom[breakpoint] = (updatedCustom[breakpoint] || []).filter(id => id !== tileId);
      }

      return {
        ...state,
        layoutInheritance: updatedInheritance,
        customLayouts: updatedCustom,
      };
    }

    case 'SET_TILE_LOCKED': {
      const { tileId, locked, layout, sourceBreakpoint } = action;
      const newLockedTiles = new Set(state.lockedTiles);
      let newLockedPositions = { ...state.lockedPositions };

      if (locked) {
        newLockedTiles.add(tileId);
        if (layout && sourceBreakpoint) {
          newLockedPositions[tileId] = { layout, sourceBreakpoint };
        }
      } else {
        newLockedTiles.delete(tileId);
        delete newLockedPositions[tileId];
      }

      return {
        ...state,
        lockedTiles: newLockedTiles,
        lockedPositions: newLockedPositions,
      };
    }

    case 'SAVE_LAYOUTS': {
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(state.layouts));
        localStorage.setItem(STORAGE_KEYS.INHERITANCE, JSON.stringify(state.layoutInheritance));
        localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(state.customLayouts));
        localStorage.setItem(STORAGE_KEYS.LOCKED_TILES, JSON.stringify(Array.from(state.lockedTiles)));
        localStorage.setItem(STORAGE_KEYS.LOCKED_POSITIONS, JSON.stringify(state.lockedPositions));
      } catch (error) {
        console.error('Failed to save layout data:', error);
      }

      return {
        ...state,
        savedLayouts: state.layouts,
        savedInheritance: state.layoutInheritance,
        savedLockedTiles: new Set(state.lockedTiles),
        savedLockedPositions: { ...state.lockedPositions },
        isEditMode: false,
      };
    }

    case 'CANCEL_EDIT':
      return {
        ...state,
        layouts: state.savedLayouts,
        layoutInheritance: state.savedInheritance,
        lockedTiles: new Set(state.savedLockedTiles),
        lockedPositions: { ...state.savedLockedPositions },
        isEditMode: false,
      };

    case 'RESET_TO_DEFAULT': {
      const defaultLayouts = getDefaultLayouts();
      
      try {
        localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(defaultLayouts));
        localStorage.removeItem(STORAGE_KEYS.INHERITANCE);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_LAYOUTS);
        localStorage.removeItem(STORAGE_KEYS.LOCKED_TILES);
        localStorage.removeItem(STORAGE_KEYS.LOCKED_POSITIONS);
      } catch (error) {
        console.error('Failed to reset layout data:', error);
      }

      return {
        ...state,
        layouts: defaultLayouts,
        savedLayouts: defaultLayouts,
        layoutInheritance: {},
        savedInheritance: {},
        lockedTiles: new Set(),
        savedLockedTiles: new Set(),
        lockedPositions: {},
        savedLockedPositions: {},
        customLayouts: { lg: [], md: [], sm: [], xs: [] },
      };
    }

    case 'RESET_BREAKPOINT': {
      const defaultLayouts = getDefaultLayouts();
      const newLayouts = {
        ...state.layouts,
        [action.breakpoint]: defaultLayouts[action.breakpoint],
      };

      // Clear inheritance for this breakpoint
      const newInheritance = { ...state.layoutInheritance };
      Object.keys(newInheritance).forEach(tileId => {
        if (newInheritance[tileId]) {
          delete newInheritance[tileId][action.breakpoint as Breakpoint];
        }
      });

      return {
        ...state,
        layouts: newLayouts,
        layoutInheritance: newInheritance,
        customLayouts: {
          ...state.customLayouts,
          [action.breakpoint]: [],
        },
      };
    }

    case 'CLEANUP_TILE': {
      const { tileId } = action;
      const tileKey = `tile-${tileId}`;

      // Clean up layouts
      const newLayouts: Layouts = {};
      BREAKPOINT_ORDER.forEach(bp => {
        if (state.layouts[bp]) {
          newLayouts[bp] = state.layouts[bp].filter(layout => layout.i !== tileKey);
        }
      });

      // Clean up inheritance
      const newInheritance = { ...state.layoutInheritance };
      delete newInheritance[tileId];

      // Clean up custom layouts
      const newCustom: { [breakpoint: string]: string[] } = {};
      Object.keys(state.customLayouts).forEach(bp => {
        newCustom[bp] = state.customLayouts[bp].filter(id => id !== tileId);
      });

      // Clean up locked state
      const newLockedTiles = new Set(state.lockedTiles);
      newLockedTiles.delete(tileId);
      
      const newLockedPositions = { ...state.lockedPositions };
      delete newLockedPositions[tileId];

      return {
        ...state,
        layouts: newLayouts,
        layoutInheritance: newInheritance,
        customLayouts: newCustom,
        lockedTiles: newLockedTiles,
        lockedPositions: newLockedPositions,
      };
    }

    case 'LOAD_FROM_STORAGE': {
      const { layouts, inheritance, locked, positions } = action;
      
      return {
        ...state,
        layouts: layouts || state.layouts,
        savedLayouts: layouts || state.savedLayouts,
        layoutInheritance: inheritance || state.layoutInheritance,
        savedInheritance: inheritance || state.savedInheritance,
        lockedTiles: new Set(locked || []),
        savedLockedTiles: new Set(locked || []),
        lockedPositions: positions || state.lockedPositions,
        savedLockedPositions: positions || state.savedLockedPositions,
      };
    }

    case 'SET_SIMULATED_VIEWPORT':
      return {
        ...state,
        simulatedViewport: action.width,
      };

    default:
      return state;
  }
}