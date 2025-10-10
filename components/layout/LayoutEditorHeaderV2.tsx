'use client';

import React from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Plus, 
  Save, 
  X, 
  RotateCcw, 
  Eye,
  Edit,
  Layers,
  MoreVertical,
  Copy,
  Trash2,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutSelector } from '@/components/layouts/LayoutSelector';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LayoutEditorHeaderV2Props {
  // Layout state
  selectedLayout: { id: string; name: string } | null;
  isEditMode: boolean;

  // Edit mode props
  editingBreakpoint?: string;
  customBreakpoints?: Set<string>;
  editAllBreakpoints?: boolean;
  viewportWidth?: number;

  // Handlers
  onSelectLayout: (layout: { id: string; name: string } | null) => void;
  onCreateLayout: () => void;
  onManageLayouts: () => void;
  onAddTile: () => void;
  onEditToggle: () => void;
  onResetAll?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onBreakpointChange?: (breakpoint: string) => void;
  onEditAllBreakpointsChange?: (enabled: boolean) => void;
  onResetBreakpoint?: (breakpoint: string) => void;
  
  // Layout actions
  onDuplicateLayout?: () => void;
  onDeleteLayout?: () => void;
  onLayoutSettings?: () => void;
}

const breakpoints = [
  {
    key: 'lg',
    label: 'Desktop',
    icon: Monitor,
    range: '≥1200px',
    width: 1200,
  },
  {
    key: 'md',
    label: 'Tablet', 
    icon: Tablet,
    range: '996-1199px',
    width: 996,
  },
  {
    key: 'sm',
    label: 'Mobile',
    icon: Smartphone,
    range: '<996px',
    width: 768,
  },
];

export default function LayoutEditorHeaderV2({
  selectedLayout,
  isEditMode,
  editingBreakpoint,
  customBreakpoints,
  editAllBreakpoints = false,
  viewportWidth = 1313,
  onSelectLayout,
  onCreateLayout,
  onManageLayouts,
  onAddTile,
  onEditToggle,
  onResetAll,
  onCancel,
  onSave,
  onBreakpointChange,
  onEditAllBreakpointsChange,
  onResetBreakpoint,
  onDuplicateLayout,
  onDeleteLayout,
  onLayoutSettings,
}: LayoutEditorHeaderV2Props) {
  
  const getBreakpointForWidth = (width: number) => {
    if (width >= 1200) return 'lg';
    if (width >= 996) return 'md';
    return 'sm';
  };

  const currentBreakpoint = getBreakpointForWidth(viewportWidth);
  
  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          {/* Left: Layout selector and title */}
          <div className="flex items-center gap-4">
            <LayoutSelector
              selectedLayout={selectedLayout}
              onSelectLayout={onSelectLayout}
              onCreateLayout={onCreateLayout}
              onManageLayouts={onManageLayouts}
            />
            
            {selectedLayout && (
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">
                  {isEditMode ? 'Editing' : 'Viewing'}
                </span>
              </div>
            )}
          </div>
          
          {/* Right: Actions */}
          {selectedLayout && (
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              <Tabs 
                value={isEditMode ? 'edit' : 'view'} 
                onValueChange={(value) => value === 'edit' ? onEditToggle() : onCancel?.()}
                className="h-9"
              >
                <TabsList className="h-9">
                  <TabsTrigger value="view" className="h-7">
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="h-7">
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Add Tile Button */}
              <Button
                onClick={onAddTile}
                size="sm"
                variant={isEditMode ? "default" : "outline"}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Tile
              </Button>
              
              {/* Layout Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDuplicateLayout}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Layout
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLayoutSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Layout Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDeleteLayout}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Layout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {/* Edit mode controls - only show when in edit mode */}
        {isEditMode && selectedLayout && (
          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
            {/* Breakpoint selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Editing for:</span>
              
              {/* All breakpoints toggle */}
              <Button
                variant={editAllBreakpoints ? 'default' : 'outline'}
                size="sm"
                onClick={() => onEditAllBreakpointsChange?.(!editAllBreakpoints)}
                className="h-7"
              >
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                All Sizes
              </Button>
              
              <div className="h-5 w-px bg-border" />
              
              {/* Individual breakpoints */}
              <div className="flex gap-1">
                {breakpoints.map((bp) => {
                  const Icon = bp.icon;
                  const isActive = !editAllBreakpoints && editingBreakpoint === bp.key;
                  const hasCustom = customBreakpoints?.has(bp.key);
                  
                  return (
                    <div key={bp.key} className="relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => !editAllBreakpoints && onBreakpointChange?.(bp.key)}
                            disabled={editAllBreakpoints}
                            className={cn(
                              'h-7 px-2',
                              editAllBreakpoints && 'opacity-50'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="ml-1.5 hidden sm:inline text-xs">{bp.label}</span>
                            {hasCustom && (
                              <span className="ml-1 text-[9px] opacity-70">●</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">{bp.label}</div>
                            <div className="text-muted-foreground">{bp.range}</div>
                            {hasCustom && !editAllBreakpoints && (
                              <div className="text-primary mt-1">Has custom layout</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Clear button for custom layouts */}
                      {hasCustom && !editAllBreakpoints && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetBreakpoint?.(bp.key);
                          }}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Current viewport indicator */}
              <div className="hidden lg:flex items-center gap-2 ml-4">
                <span className="text-xs text-muted-foreground">Viewport:</span>
                <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded">
                  {viewportWidth}px
                </span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  currentBreakpoint === 'sm' && 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
                  currentBreakpoint === 'md' && 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
                  currentBreakpoint === 'lg' && 'bg-green-500/20 text-green-700 dark:text-green-400'
                )}>
                  {breakpoints.find(bp => bp.key === currentBreakpoint)?.label}
                </span>
              </div>
            </div>
            
            {/* Edit mode actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onResetAll}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset All
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                size="sm"
                className="h-7 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}