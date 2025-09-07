'use client';

import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Link2, Edit3, Lock } from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';

interface TileInheritanceMenuProps {
  tileId: string;
  className?: string;
}

export default function TileInheritanceMenu({ tileId, className }: TileInheritanceMenuProps) {
  const { 
    editingBreakpoint, 
    layoutInheritance, 
    updateTileInheritance,
    isTileLocked,
    setTileLocked,
    layouts
  } = useLayout();
  
  const isLocked = isTileLocked(tileId);
  const currentMode = isLocked ? 'locked' : (layoutInheritance[tileId]?.[editingBreakpoint as 'lg' | 'md' | 'sm' | 'xs'] || 'inherit');
  
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'inherit':
        return <Link2 className="h-3 w-3" />;
      case 'custom':
        return <Edit3 className="h-3 w-3" />;
      case 'locked':
        return <Lock className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'inherit':
        return 'Inherited';
      case 'custom':
        return 'Custom';
      case 'locked':
        return 'Locked';
      default:
        return mode;
    }
  };
  
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'inherit':
        return 'secondary';
      case 'custom':
        return 'default';
      case 'locked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className={className}>
      <Badge 
        variant={getModeColor(currentMode) as 'secondary' | 'default' | 'destructive' | 'outline'}
        className="gap-1 text-xs"
      >
        {getModeIcon(currentMode)}
        {getModeLabel(currentMode)}
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tile Configuration</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {!isLocked && (
            <>
              <DropdownMenuRadioGroup 
                value={currentMode}
                onValueChange={(value) => {
                  if (value === 'inherit' || value === 'custom') {
                    updateTileInheritance(tileId, editingBreakpoint, value);
                  }
                }}
              >
                <DropdownMenuRadioItem value="inherit" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Inherit from larger</span>
                    <span className="text-xs text-muted-foreground">
                      Auto-scale from bigger screens
                    </span>
                  </div>
                </DropdownMenuRadioItem>
                
                <DropdownMenuRadioItem value="custom" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Custom layout</span>
                    <span className="text-xs text-muted-foreground">
                      Unique position for this size
                    </span>
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem 
            onClick={() => {
              if (!isLocked) {
                // When locking, capture ALL breakpoint layouts
                const allBreakpointLayouts: { [breakpoint: string]: any } = {};
                ['lg', 'md', 'sm', 'xs'].forEach(bp => {
                  const layoutForBreakpoint = layouts[bp]?.find(l => l.i === `tile-${tileId}`);
                  if (layoutForBreakpoint) {
                    allBreakpointLayouts[bp] = layoutForBreakpoint;
                  }
                });
                setTileLocked(tileId, true, allBreakpointLayouts);
              } else {
                // When unlocking, just clear the lock
                setTileLocked(tileId, false);
              }
            }} 
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{isLocked ? 'Unlock position' : 'Lock position globally'}</span>
              <span className="text-xs text-muted-foreground">
                {isLocked ? 'Allow position changes' : 'Keep same position on all screen sizes'}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}