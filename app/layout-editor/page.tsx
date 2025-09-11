'use client';

import React, { useState, useEffect } from 'react';
import LayoutEditorHeaderV2 from '@/components/layout/LayoutEditorHeaderV2';
import GridLayoutWrapper from '@/components/layout-tiles/GridLayoutWrapper';
import { LayoutList } from '@/components/layouts/LayoutList';
import { LayoutForm } from '@/components/layouts/LayoutForm';
import TileEditorV2 from '@/components/tiles/TileEditorV2';
import TileSelector from '@/components/tiles/TileSelector';
import { useTiles } from '@/contexts/TileContext';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { GRID_CONFIG } from '@/lib/constants';
import type { Layout, CreateLayoutRequest, UpdateLayoutRequest, TileWithPositions, Tile } from '@/lib/types/database';

function LayoutEditorContent() {
  const { addTile, reorderTiles } = useTiles();
  const { 
    isEditMode, 
    setEditMode, 
    saveLayouts,
    setLayouts,
    layouts, 
    cancelEdit, 
    resetToDefault,
    resetBreakpoint,
    currentBreakpoint,
    editingBreakpoint,
    setEditingBreakpoint,
    customBreakpoints,
    editAllBreakpoints,
    setEditAllBreakpoints,
    simulatedViewport,
    setSimulatedViewport,
  } = useLayout();
  
  const [viewportWidth, setViewportWidth] = useState(0);
  const [showLayoutList, setShowLayoutList] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [showLayoutForm, setShowLayoutForm] = useState(false);
  const [editingLayout, setEditingLayout] = useState<Layout | null>(null);
  const [layoutTiles, setLayoutTiles] = useState<TileWithPositions[]>([]);
  const [showTileEditor, setShowTileEditor] = useState(false);
  const [editingTile, setEditingTile] = useState<Tile | null>(null);
  const [showTileSelector, setShowTileSelector] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (selectedLayout) {
      fetchLayoutTiles(selectedLayout.id);
    }
  }, [selectedLayout]);

  const fetchLayoutTiles = async (layoutId: string) => {
    try {
      const response = await fetch(`/api/layouts/${layoutId}/tiles`);
      if (!response.ok) throw new Error('Failed to fetch layout tiles');
      const tiles = await response.json();
      setLayoutTiles(tiles);
      
      // Update the TileContext with the new tiles
      const formattedTiles = tiles.map((tile: TileWithPositions) => ({
        id: tile.id,
        type: tile.type,
        title: tile.title,
        position: 0, // Will be determined by grid position
        config: tile.config,
        data: tile.data,
      }));
      reorderTiles(formattedTiles);
      
      // Convert tile positions to grid layout format and apply to LayoutContext
      const gridLayouts: { [key: string]: any[] } = {
        lg: [],
        md: [],
        sm: [],
        xs: []
      };
      
      tiles.forEach((tile: TileWithPositions) => {
        if (tile.positions) {
          Object.entries(tile.positions).forEach(([breakpoint, positionData]) => {
            if (gridLayouts[breakpoint] && positionData) {
              // Ensure we have the position object with the nested structure
              const position = positionData.position || positionData;
              gridLayouts[breakpoint].push({
                i: `tile-${tile.id}`,
                x: position.x || 0,
                y: position.y || 0,
                w: position.w || 4,
                h: position.h || 3,
                minW: position.minW || GRID_CONFIG.MIN_WIDTH,
                minH: position.minH || GRID_CONFIG.MIN_HEIGHT,
                static: position.static || false
              });
            }
          });
        }
      });
      
      // Only set layouts if we have valid positions
      if (gridLayouts.lg.length > 0 || gridLayouts.md.length > 0 || 
          gridLayouts.sm.length > 0 || gridLayouts.xs.length > 0) {
        setLayouts(gridLayouts);
      }
    } catch (error) {
      console.error('Error fetching layout tiles:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      cancelEdit();
    } else {
      // Get the actual current breakpoint based on window width
      const actualBreakpoint = window.innerWidth >= 1200 ? 'lg' :
                              window.innerWidth >= 996 ? 'md' :
                              window.innerWidth >= 768 ? 'sm' : 'xs';
      setEditMode(true);
      setEditingBreakpoint(actualBreakpoint);
    }
  };

  const handleSelectLayout = async (layout: Layout) => {
    setSelectedLayout(layout);
    setShowLayoutList(false);
  };

  const handleCreateLayout = () => {
    setEditingLayout(null);
    setShowLayoutForm(true);
  };

  const handleEditLayout = (layout: Layout) => {
    setEditingLayout(layout);
    setShowLayoutForm(true);
  };

  const handleDeleteLayout = async (layout?: Layout) => {
    const layoutToDelete = layout || selectedLayout;
    if (!layoutToDelete) return;
    
    if (!confirm(`Are you sure you want to delete "${layoutToDelete.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/layouts/${layoutToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete layout');
      
      if (selectedLayout?.id === layoutToDelete.id) {
        setSelectedLayout(null);
        setLayoutTiles([]);
      }
      
      // Refresh the layout list
      setShowLayoutList(true);
    } catch (error) {
      console.error('Error deleting layout:', error);
    }
  };

  const handleDuplicateLayout = async (layout?: Layout) => {
    const layoutToDuplicate = layout || selectedLayout;
    if (!layoutToDuplicate) return;
    try {
      const response = await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${layoutToDuplicate.name} (Copy)`,
          description: layoutToDuplicate.description,
          config: layoutToDuplicate.config,
          isShared: layoutToDuplicate.isShared,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to duplicate layout');
      
      const newLayout = await response.json();
      
      // Copy tiles to new layout
      if (layoutToDuplicate.id) {
        const tilesResponse = await fetch(`/api/layouts/${layoutToDuplicate.id}/tiles`);
        const tiles = await tilesResponse.json();
        
        for (const tile of tiles) {
          await fetch(`/api/layouts/${newLayout.id}/tiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tileId: tile.id,
              positions: tile.positions,
            }),
          });
        }
      }
      
      // Refresh the layout list
      setShowLayoutList(true);
    } catch (error) {
      console.error('Error duplicating layout:', error);
    }
  };

  const handleSubmitLayout = async (data: CreateLayoutRequest | UpdateLayoutRequest) => {
    try {
      const url = editingLayout 
        ? `/api/layouts/${editingLayout.id}`
        : '/api/layouts';
      
      const response = await fetch(url, {
        method: editingLayout ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to save layout');
      
      const layout = await response.json();
      setSelectedLayout(layout);
      setShowLayoutForm(false);
      
      // Refresh the layout list if it's visible
      if (showLayoutList) {
        setShowLayoutList(false);
        setShowLayoutList(true);
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      throw error;
    }
  };

  const handleCreateTile = () => {
    // Show tile selector instead of directly creating
    setShowTileSelector(true);
  };
  
  const handleSelectTile = async (tile: Tile) => {
    if (!selectedLayout) return;
    
    try {
      // Add the selected tile to the layout
      const positions = {
        lg: { x: 0, y: 0, w: 4, h: 3 },
        md: { x: 0, y: 0, w: 4, h: 3 },
        sm: { x: 0, y: 0, w: 3, h: 3 },
        xs: { x: 0, y: 0, w: 2, h: 3 },
      };
      
      // Map positions to array format for the API
      const positionsArray = Object.entries(positions).map(([breakpoint, position]) => ({
        breakpoint,
        position
      }));
      
      const response = await fetch(`/api/layouts/${selectedLayout.id}/tiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tileId: tile.id,
          positions: positionsArray,
          isTemplate: true, // Tiles from the selector are templates
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add tile to layout');
      
      // Refresh the layout tiles
      await fetchLayoutTiles(selectedLayout.id);
      setShowTileSelector(false);
    } catch (error) {
      console.error('Error adding tile to layout:', error);
    }
  };
  
  const handleCreateNewTile = () => {
    setShowTileSelector(false);
    setEditingTile(null);
    setShowTileEditor(true);
  };

  const handleSaveTile = async (tileData: any, layoutId?: string) => {
    // If a new tile was created, it should be added to the layout
    if (selectedLayout && tileData && tileData.id) {
      // Add the newly created tile to the layout
      const positions = {
        lg: { x: 0, y: 0, w: 4, h: 3 },
        md: { x: 0, y: 0, w: 4, h: 3 },
        sm: { x: 0, y: 0, w: 3, h: 3 },
        xs: { x: 0, y: 0, w: 2, h: 3 },
      };
      
      const positionsArray = Object.entries(positions).map(([breakpoint, position]) => ({
        breakpoint,
        position
      }));
      
      try {
        const response = await fetch(`/api/layouts/${selectedLayout.id}/tiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tileId: tileData.id,
            positions: positionsArray,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to add tile to layout');
        }
      } catch (error) {
        console.error('Error adding tile to layout:', error);
      }
      
      // Refresh the layout tiles
      await fetchLayoutTiles(selectedLayout.id);
    }
    setShowTileEditor(false);
  };

  const handleSaveLayout = async () => {
    if (!selectedLayout) return;
    
    try {
      // Save positions to database for each tile and breakpoint
      const savePromises: Promise<any>[] = [];
      const breakpoints = ['lg', 'md', 'sm', 'xs'];
      
      breakpoints.forEach(breakpoint => {
        const breakpointLayouts = layouts[breakpoint] || [];
        
        breakpointLayouts.forEach(layoutItem => {
          // Extract tile ID from layout item ID (format: "tile-{id}")
          const tileId = layoutItem.i.replace('tile-', '');
          
          // Prepare position data
          const position = {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
            minW: layoutItem.minW,
            minH: layoutItem.minH,
            static: layoutItem.static || false
          };
          
          // Create promise to save this position
          const savePromise = fetch(`/api/layouts/${selectedLayout.id}/tiles`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tileId,
              breakpoint,
              position,
              isVisible: true,
              inheritanceMode: 'custom'
            })
          });
          
          savePromises.push(savePromise);
        });
      });
      
      // Wait for all saves to complete
      await Promise.all(savePromises);
      
      // Also save to localStorage for quick access
      saveLayouts();
      
      console.log('Layout saved successfully to database');
    } catch (error) {
      console.error('Error saving layout to database:', error);
      // Still save to localStorage even if database save fails
      saveLayouts();
    }
  };

  const handleLayoutSettings = () => {
    if (selectedLayout) {
      setEditingLayout(selectedLayout);
      setShowLayoutForm(true);
    }
  };

  const handleManageLayouts = () => {
    setShowLayoutList(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <LayoutEditorHeaderV2
        selectedLayout={selectedLayout}
        isEditMode={isEditMode}
        editingBreakpoint={editingBreakpoint}
        customBreakpoints={customBreakpoints}
        editAllBreakpoints={editAllBreakpoints}
        viewportWidth={viewportWidth}
        onSelectLayout={handleSelectLayout}
        onCreateLayout={handleCreateLayout}
        onManageLayouts={handleManageLayouts}
        onAddTile={handleCreateTile}
        onEditToggle={handleEditToggle}
        onResetAll={resetToDefault}
        onCancel={cancelEdit}
        onSave={handleSaveLayout}
        onBreakpointChange={setEditingBreakpoint}
        onEditAllBreakpointsChange={setEditAllBreakpoints}
        onResetBreakpoint={resetBreakpoint}
        onDuplicateLayout={() => handleDuplicateLayout()}
        onDeleteLayout={() => handleDeleteLayout()}
        onLayoutSettings={handleLayoutSettings}
      />
      
      {showLayoutList && !selectedLayout ? (
        <LayoutList
          onSelectLayout={handleSelectLayout}
          onCreateLayout={handleCreateLayout}
          onEditLayout={handleEditLayout}
          onDeleteLayout={handleDeleteLayout}
          onDuplicateLayout={handleDuplicateLayout}
          selectedLayoutId={selectedLayout?.id}
        />
      ) : selectedLayout ? (
        <GridLayoutWrapper />
      ) : (
        <LayoutList
          onSelectLayout={handleSelectLayout}
          onCreateLayout={handleCreateLayout}
          onEditLayout={handleEditLayout}
          onDeleteLayout={handleDeleteLayout}
          onDuplicateLayout={handleDuplicateLayout}
          selectedLayoutId={selectedLayout?.id}
        />
      )}
      
      <LayoutForm
        open={showLayoutForm}
        onOpenChange={setShowLayoutForm}
        layout={editingLayout}
        onSubmit={handleSubmitLayout}
      />
      
      <TileEditorV2
        open={showTileEditor}
        onOpenChange={setShowTileEditor}
        tile={editingTile}
        mode={editingTile ? 'edit' : 'create'}
        layoutId={selectedLayout?.id}
        onSave={handleSaveTile}
      />
      
      <TileSelector
        isOpen={showTileSelector}
        onClose={() => setShowTileSelector(false)}
        onSelectTile={handleSelectTile}
        onCreateNew={handleCreateNewTile}
      />
    </div>
  );
}

export default function LayoutEditorPage() {
  return (
    <LayoutProvider>
      <LayoutEditorContent />
    </LayoutProvider>
  );
}