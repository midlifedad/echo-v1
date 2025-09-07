'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BreakpointSelectorProps {
  currentBreakpoint: string;
  editingBreakpoint: string;
  onBreakpointChange: (breakpoint: string) => void;
  customLayouts: { [key: string]: string[] };
  className?: string;
}

const breakpoints = [
  {
    key: 'lg',
    label: 'Desktop',
    icon: Monitor,
    range: '1200px+',
    cols: 12,
  },
  {
    key: 'md',
    label: 'Tablet',
    icon: Tablet,
    range: '996-1199px',
    cols: 10,
  },
  {
    key: 'sm',
    label: 'Mobile',
    icon: Smartphone,
    range: '768-995px',
    cols: 6,
  },
  {
    key: 'xs',
    label: 'Phone',
    icon: Phone,
    range: '<768px',
    cols: 4,
  },
];

export default function BreakpointSelector({
  currentBreakpoint,
  editingBreakpoint,
  onBreakpointChange,
  customLayouts,
  className,
}: BreakpointSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2 p-3 bg-card rounded-lg border', className)}>
      <span className="text-sm text-muted-foreground mr-2">Edit Layout:</span>
      
      <div className="flex gap-1">
        {breakpoints.map((bp) => {
          const Icon = bp.icon;
          const isEditing = editingBreakpoint === bp.key;
          const isCurrent = currentBreakpoint === bp.key;
          const hasCustomLayout = customLayouts[bp.key]?.length > 0;
          
          return (
            <Button
              key={bp.key}
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => onBreakpointChange(bp.key)}
              className={cn(
                'relative gap-2',
                isEditing && 'bg-primary hover:bg-primary/90',
                isCurrent && !isEditing && 'border-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{bp.label}</span>
              <span className="text-xs text-muted-foreground hidden lg:inline">
                ({bp.range})
              </span>
              
              {hasCustomLayout && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                >
                  ✓
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2 text-sm">
        {editingBreakpoint !== currentBreakpoint && (
          <Badge variant="outline" className="gap-1 text-xs">
            <span>Actual Viewport:</span>
            <span className="font-medium">{breakpoints.find(bp => bp.key === currentBreakpoint)?.label}</span>
          </Badge>
        )}
        
        <span className="text-muted-foreground hidden md:inline">
          Editing: <span className="font-medium">{breakpoints.find(bp => bp.key === editingBreakpoint)?.cols} columns</span>
        </span>
      </div>
    </div>
  );
}