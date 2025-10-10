'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export default function SidebarHeader() {
  const { isCollapsed, isHovered, toggleSidebar } = useSidebar();
  
  const showText = !isCollapsed || isHovered;

  return (
    <div className="flex items-center justify-between p-4 pb-2">
      {/* Logo and brand */}
      <div className={cn(
        'flex items-center gap-3',
        'transition-opacity duration-300',
        showText ? 'opacity-100' : 'opacity-0'
      )}>
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">E</span>
        </div>
        {showText && (
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-black">Echo</h1>
            <span className="text-xs text-black/70 -mt-1">Marketing OS</span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          'h-8 w-8 text-black hover:text-black',
          'hover:bg-black/10 transition-colors',
          !showText && 'ml-0'
        )}
      >
        <Menu size={18} />
      </Button>
    </div>
  );
}