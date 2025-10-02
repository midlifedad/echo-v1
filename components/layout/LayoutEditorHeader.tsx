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
  List, 
  Grid3X3,
  Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LayoutEditorHeaderProps {
  title: string;
  subtitle?: string;
  isEditMode: boolean;
  showLayoutList: boolean;
  selectedLayout: { id: string; name: string } | null;
  
  // Edit mode props
  editingBreakpoint?: string;
  customBreakpoints?: Set<string>;
  editAllBreakpoints?: boolean;
  viewportWidth?: number;
  
  // Handlers
  onToggleLayoutList: () => void;
  onAddTile: () => void;
  onEditToggle: () => void;
  onResetAll?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onBreakpointChange?: (breakpoint: string) => void;
  onEditAllBreakpointsChange?: (enabled: boolean) => void;
  onResetBreakpoint?: (breakpoint: string) => void;
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

export default function LayoutEditorHeader({
  title,
  subtitle,
  isEditMode,
  showLayoutList,
  selectedLayout,
  editingBreakpoint,
  customBreakpoints,
  editAllBreakpoints = false,
  viewportWidth = 1313,
  onToggleLayoutList,
  onAddTile,
  onEditToggle,
  onResetAll,
  onCancel,
  onSave,
  onBreakpointChange,
  onEditAllBreakpointsChange,
  onResetBreakpoint,
}: LayoutEditorHeaderProps) {
  
  const getBreakpointForWidth = (width: number) => {
    if (width >= 1200) return 'lg';
    if (width >= 996) return 'md';
    return 'sm';
  };

  const currentBreakpoint = getBreakpointForWidth(viewportWidth);
  
  return (
    <TooltipProvider>
      <div className="mb-4">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && !isEditMode && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleLayoutList}
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2"
            >
              {showLayoutList ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
              <span className="hidden sm:inline">{showLayoutList ? 'Hide Layouts' : 'Manage Layouts'}</span>
              <span className="sm:hidden">{showLayoutList ? 'Hide' : 'Layouts'}</span>
            </Button>
            
            {selectedLayout && !showLayoutList && (
              <>
                <Button
                  onClick={onAddTile}
                  size="sm"
                  variant="default"
                  className="gap-1 sm:gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Tile</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                
                {isEditMode ? (
                  <>
                    <Button
                      onClick={onResetAll}
                      variant="outline"
                      size="sm"
                      className="gap-1 sm:gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">Reset All</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      size="sm"
                      className="gap-1 sm:gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={onSave}
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
                    onClick={onEditToggle}
                    size="sm"
                    className="gap-1 sm:gap-2"
                  >
                    <span className="hidden sm:inline">Edit Layout</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Edit mode controls row - integrated into header */}
        {isEditMode && selectedLayout && !showLayoutList && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            {/* Screen size selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Edit for:</span>
              
              {/* All breakpoints toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editAllBreakpoints ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onEditAllBreakpointsChange?.(!editAllBreakpoints)}
                    className={cn(
                      'px-2 h-8 mr-2',
                      editAllBreakpoints && 'ring-1 ring-primary ring-offset-1'
                    )}
                  >
                    <Layers className="h-4 w-4" />
                    <span className="ml-1.5">All</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div className="font-medium">Edit All Sizes</div>
                    <div className="text-muted-foreground">Apply changes to all breakpoints</div>
                  </div>
                </TooltipContent>
              </Tooltip>
              
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
                              'px-2 h-8',
                              isActive && 'ring-1 ring-primary ring-offset-1',
                              editAllBreakpoints && 'opacity-50'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="ml-1.5 hidden lg:inline">{bp.label}</span>
                            {hasCustom && (
                              <span className="ml-1 text-[10px] opacity-70">●</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">{bp.label}</div>
                            <div className="text-muted-foreground">{bp.range}</div>
                            {hasCustom && (
                              <div className="text-primary mt-1">Custom layout</div>
                            )}
                            {editAllBreakpoints && (
                              <div className="text-muted-foreground mt-1">All mode active</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Clear button for custom layouts */}
                      {hasCustom && !editAllBreakpoints && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onResetBreakpoint?.(bp.key);
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">Clear {bp.label} custom layout</div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Viewport indicator - compact */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Viewport:</span>
                <span className="text-sm font-mono font-medium">{viewportWidth}px</span>
              </div>
              
              {/* Mini viewport range indicator */}
              <div className="hidden md:flex items-center gap-2 h-6">
                <span className="text-xs text-muted-foreground">320</span>
                <div className="relative w-32 h-1 bg-muted rounded-full overflow-hidden">
                  {/* Breakpoint regions */}
                  <div className="absolute inset-0 flex">
                    <div className="bg-yellow-500/30" style={{ width: '35.4%' }} />
                    <div className="bg-blue-500/30" style={{ width: '11.5%' }} />
                    <div className="bg-green-500/30 flex-1" />
                  </div>
                  {/* Current position indicator */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
                    style={{ 
                      left: `${Math.min(100, Math.max(0, ((viewportWidth - 320) / (1920 - 320)) * 100))}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">1920</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <span className={cn(
                  'px-1.5 py-0.5 rounded',
                  currentBreakpoint === 'sm' && 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
                  currentBreakpoint === 'md' && 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
                  currentBreakpoint === 'lg' && 'bg-green-500/20 text-green-700 dark:text-green-400'
                )}>
                  {breakpoints.find(bp => bp.key === currentBreakpoint)?.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}