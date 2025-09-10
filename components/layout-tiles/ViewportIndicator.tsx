'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ViewportIndicatorProps {
  currentViewport: number;
  simulatedViewport?: number;
  onSimulatedViewportChange?: (width: number) => void;
  className?: string;
}

const breakpointThresholds = [
  { name: 'sm', max: 768, color: 'bg-yellow-500' },
  { name: 'md', min: 768, max: 996, color: 'bg-blue-500' },
  { name: 'lg', min: 996, color: 'bg-green-500' },
];

export default function ViewportIndicator({
  currentViewport,
  simulatedViewport,
  onSimulatedViewportChange,
  className,
}: ViewportIndicatorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localSimulated, setLocalSimulated] = useState(simulatedViewport || currentViewport);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const maxWidth = 1920;
  const minWidth = 320;
  
  useEffect(() => {
    if (!isDragging) {
      setLocalSimulated(simulatedViewport || currentViewport);
    }
  }, [simulatedViewport, currentViewport, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const width = Math.round(minWidth + (maxWidth - minWidth) * percentage);
      
      setLocalSimulated(width);
      onSimulatedViewportChange?.(width);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getBreakpointName = (width: number) => {
    if (width < 768) return 'Mobile (sm)';
    if (width < 996) return 'Tablet (md)';
    return 'Desktop (lg)';
  };

  const getPosition = (width: number) => {
    return ((width - minWidth) / (maxWidth - minWidth)) * 100;
  };

  const displayWidth = simulatedViewport || localSimulated;
  const position = getPosition(displayWidth);

  return (
    <div className={cn('p-3 bg-card rounded-lg border', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Viewport Width</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-medium">
            {displayWidth}px
          </span>
          <span className="text-sm text-muted-foreground">
            {getBreakpointName(displayWidth)}
          </span>
        </div>
      </div>

      <div className="relative" ref={containerRef}>
        {/* Gradient background showing breakpoint ranges */}
        <div className="h-8 rounded-md overflow-hidden flex">
          <div className="bg-yellow-500/20 flex-none" style={{ width: '40%' }} />
          <div className="bg-blue-500/20 flex-none" style={{ width: '12%' }} />
          <div className="bg-green-500/20 flex-1" />
        </div>

        {/* Breakpoint markers */}
        <div className="absolute inset-0 pointer-events-none">
          {[768, 996].map((threshold) => {
            const pos = getPosition(threshold);
            return (
              <div
                key={threshold}
                className="absolute top-0 h-full flex flex-col items-center"
                style={{ left: `${pos}%` }}
              >
                <div className="h-full w-px bg-border" />
                <span className="absolute -bottom-5 text-xs text-muted-foreground">
                  {threshold}
                </span>
              </div>
            );
          })}
        </div>

        {/* Draggable slider */}
        <div
          className="absolute top-0 h-8 flex items-center"
          style={{ left: `${position}%` }}
        >
          <div
            className={cn(
              'w-4 h-6 bg-primary rounded-sm cursor-ew-resize shadow-lg',
              'hover:bg-primary/80 transition-colors',
              isDragging && 'bg-primary/80'
            )}
            onMouseDown={handleMouseDown}
          >
            <div className="flex flex-col items-center justify-center h-full gap-0.5">
              <div className="w-2 h-px bg-white/60" />
              <div className="w-2 h-px bg-white/60" />
              <div className="w-2 h-px bg-white/60" />
            </div>
          </div>
        </div>

        {/* Current actual viewport indicator */}
        {currentViewport !== displayWidth && (
          <div
            className="absolute top-0 h-8 pointer-events-none"
            style={{ left: `${getPosition(currentViewport)}%` }}
          >
            <div className="w-px h-full bg-blue-500 opacity-50" />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-blue-500 whitespace-nowrap">
              Actual: {currentViewport}px
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>{minWidth}px</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500/20 rounded" />
            sm
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500/20 rounded" />
            md
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500/20 rounded" />
            lg
          </span>
        </div>
        <span>{maxWidth}px</span>
      </div>
    </div>
  );
}