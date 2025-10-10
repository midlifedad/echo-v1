'use client';

import React from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export default function SidebarHeader() {
  const { isCollapsed, isHovered, toggleSidebar } = useSidebar();

  const showText = !isCollapsed || isHovered;

  return (
    <div className="flex items-center justify-between p-4 pb-2">
      {/* Logo */}
      <div className={cn(
        'flex items-center',
        'transition-opacity duration-300',
        showText ? 'opacity-100' : 'opacity-0'
      )}>
        {showText && (
          <Image
            src="/echo_v3_sm.png"
            alt="Echo Logo"
            width={180}
            height={60}
            className="object-contain pb-4"
          />
        )}
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          'h-8 w-8 text-text-onSidebar hover:text-text-onSidebar',
          'hover:bg-text-onSidebar/10 transition-colors',
          !showText && 'ml-0'
        )}
      >
        <Menu size={18} />
      </Button>
    </div>
  );
}