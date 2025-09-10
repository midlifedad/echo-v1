'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BreakpointSelectorProps {
  currentBreakpoint: string;
  editingBreakpoint: string;
  onBreakpointChange: (breakpoint: string) => void;
  customBreakpoints: Set<string>;
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
  customBreakpoints,
  className,
}: BreakpointSelectorProps) {
  return (
    <div className={cn('p-4 bg-card rounded-lg border', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium mb-3">Select Screen Size to Edit</h3>
          
          <div className="flex gap-2">
            {breakpoints.map((bp) => {
              const Icon = bp.icon;
              const isEditing = editingBreakpoint === bp.key;
              const hasCustomLayout = customBreakpoints.has(bp.key);
              
              return (
                <div key={bp.key} className="flex flex-col items-center gap-1">
                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onBreakpointChange(bp.key)}
                    className={cn(
                      'gap-2 min-w-[100px]',
                      isEditing && 'ring-2 ring-primary ring-offset-2'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{bp.label}</span>
                  </Button>
                  
                  {hasCustomLayout && (
                    <span className="text-[10px] text-muted-foreground">
                      Custom Layout
                    </span>
                  )}
                  {!hasCustomLayout && (
                    <span className="text-[10px] text-muted-foreground">
                      Auto-scales
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Currently editing:</div>
          <div className="text-lg font-semibold">
            {breakpoints.find(bp => bp.key === editingBreakpoint)?.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {breakpoints.find(bp => bp.key === editingBreakpoint)?.range}
          </div>
        </div>
      </div>
    </div>
  );
}