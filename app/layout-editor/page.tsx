'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import GridLayoutWrapper from '@/components/layout-tiles/GridLayoutWrapper';
import BreakpointSelector from '@/components/layout-tiles/BreakpointSelector';
import ViewportIndicator from '@/components/layout-tiles/ViewportIndicator';
import { useTiles } from '@/contexts/TileContext';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, RotateCcw } from 'lucide-react';

function LayoutEditorContent() {
  const { addTile } = useTiles();
  const { 
    isEditMode, 
    setEditMode, 
    saveLayouts, 
    cancelEdit, 
    resetToDefault,
    currentBreakpoint,
    editingBreakpoint,
    setEditingBreakpoint,
    customLayouts,
    simulatedViewport,
    setSimulatedViewport,
  } = useLayout();
  
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
    };
    
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Layout"
        subtitle="Advanced layout and positioning for dashboard tiles"
        onAddTile={addTile}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  onClick={resetToDefault}
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset All</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={saveLayouts}
                  size="sm"
                  className="gap-1 sm:gap-2 bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEditToggle}
                size="sm"
                className="gap-1 sm:gap-2"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Layout</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
          </div>
        }
      />
      
      {isEditMode && (
        <div className="flex flex-col gap-3">
          <BreakpointSelector
            currentBreakpoint={currentBreakpoint}
            editingBreakpoint={editingBreakpoint}
            onBreakpointChange={setEditingBreakpoint}
            customLayouts={customLayouts}
          />
          
          <ViewportIndicator
            currentViewport={viewportWidth}
            simulatedViewport={simulatedViewport}
            onSimulatedViewportChange={setSimulatedViewport}
          />
        </div>
      )}
      
      <GridLayoutWrapper />
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