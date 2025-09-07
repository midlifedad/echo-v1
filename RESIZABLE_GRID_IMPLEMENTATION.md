# Resizable Grid Layout Implementation Plan

## Overview
Implement individually resizable tiles using react-grid-layout with a toggle for edit mode and snap-to-grid functionality.

## Core Requirements
- ✅ Individual tile resizing
- ✅ Grid snap system
- ✅ Edit mode toggle in header
- ✅ Responsive to window resizing
- ✅ Persistent layout state

## Technical Solution

### 1. Library Choice: react-grid-layout
**Why:** Industry standard, mature, responsive breakpoints, built-in drag/resize

### 2. Grid Configuration
```javascript
{
  rowHeight: 80,
  cols: { lg: 12, md: 10, sm: 6, xs: 4 },
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
  margin: [10, 10],
  containerPadding: [10, 10],
  isDraggable: editMode,
  isResizable: editMode,
  compactType: 'vertical'
}
```

### 3. Data Structure Updates
```typescript
interface TileData {
  // existing...
  gridLayout?: {
    x: number;      // Grid column position
    y: number;      // Grid row position
    w: number;      // Width in grid units (1-12)
    h: number;      // Height in grid units
    minW?: number;  // Min width (default: 2)
    minH?: number;  // Min height (default: 2)
    maxW?: number;  // Max width (default: 12)
    maxH?: number;  // Max height
    static?: boolean; // Prevent move/resize
  }
}
```

### 4. Component Architecture

```
LayoutEditorPage
├── PageHeader (with Edit Toggle)
├── LayoutContext.Provider
│   └── GridLayoutWrapper
│       ├── ReactGridLayout (edit mode)
│       │   └── LayoutTile components
│       └── CSS Grid (view mode)
│           └── LayoutTile components
```

### 5. Responsive Strategy
- **Breakpoint-based layouts**: Store separate layouts per breakpoint
- **Auto-interpolation**: Missing breakpoints calculated automatically
- **Percentage columns**: Maintain proportions on resize

### 6. Edit Mode Features
- **Visual indicators**: Resize handles, grid lines
- **Snap to grid**: Large grid units for clean alignment
- **Real-time preview**: See changes immediately
- **Save/Cancel**: Confirm or revert changes

## Implementation Steps

### Phase 1: Setup (15 min)
1. Install `react-grid-layout` and CSS
2. Update TileData type with gridLayout
3. Create default grid layouts for existing tiles

### Phase 2: Context & State (30 min)
1. Create LayoutContext for edit mode state
2. Add layout persistence to localStorage
3. Implement layout update handlers

### Phase 3: Grid Components (45 min)
1. Create GridLayoutWrapper component
2. Implement dual-mode rendering (edit/view)
3. Add resize/drag event handlers
4. Configure responsive breakpoints

### Phase 4: UI Controls (20 min)
1. Add Edit toggle button to PageHeader
2. Style edit mode indicators
3. Add save/cancel controls
4. Implement keyboard shortcuts (ESC to cancel)

### Phase 5: Testing & Polish (20 min)
1. Test responsive behavior
2. Verify persistence
3. Add animations/transitions
4. Handle edge cases

## File Changes

### New Files
- `/contexts/LayoutContext.tsx`
- `/components/layout-tiles/GridLayoutWrapper.tsx`
- `/styles/react-grid-layout.css`

### Modified Files
- `/lib/types.ts` - Add gridLayout to TileData
- `/app/layout-editor/page.tsx` - Add edit toggle
- `/components/layout-tiles/LayoutTileGrid.tsx` - Replace with GridLayoutWrapper
- `/components/layout-tiles/LayoutTile.tsx` - Remove drag logic (handled by library)
- `/components/layout/PageHeader.tsx` - Add edit toggle prop
- `/contexts/TileContext.tsx` - Store grid layouts

## Default Grid Layouts

### Initial tile positions (12-column grid):
```javascript
[
  { i: 'tile-1', x: 0, y: 0, w: 6, h: 4 },  // Half width
  { i: 'tile-2', x: 6, y: 0, w: 6, h: 4 },  // Half width
  { i: 'tile-3', x: 0, y: 4, w: 4, h: 3 },  // Third width
  { i: 'tile-4', x: 4, y: 4, w: 4, h: 3 },  // Third width
  { i: 'tile-5', x: 8, y: 4, w: 4, h: 3 },  // Third width
]
```

## Window Resize Handling

### Approach: Responsive Breakpoints
1. **Detection**: Library monitors window.innerWidth
2. **Breakpoint match**: Finds appropriate layout (lg/md/sm/xs)
3. **Layout application**: Uses stored or interpolated layout
4. **Smooth transition**: CSS transforms maintain fluidity
5. **State preservation**: Changes saved per breakpoint

### Benefits
- No manual recalculation needed
- Predictable behavior across devices
- Users can customize per screen size
- Automatic mobile optimization

## Performance Optimizations
1. **Dual rendering**: CSS Grid for view, react-grid-layout for edit
2. **Lazy loading**: Load grid library only when needed
3. **Debounced saves**: Batch layout updates
4. **Virtual scrolling**: For many tiles (future)

## User Experience
1. **Clear mode indication**: Visual difference between view/edit
2. **Undo/Redo**: Track layout history (future)
3. **Reset to default**: One-click restore
4. **Grid preview**: Show grid lines in edit mode
5. **Constraints**: Min/max sizes prevent unusable layouts

## Success Metrics
- ✅ Tiles resize smoothly
- ✅ Layouts persist across sessions
- ✅ Responsive on all screen sizes
- ✅ Edit mode clearly indicated
- ✅ Performance remains smooth

## Future Enhancements
- Preset layouts (templates)
- Export/import layouts
- Collaborative editing
- Animation preferences
- Custom grid sizes per user