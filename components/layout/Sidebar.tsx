'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/contexts/SidebarContext';
import SidebarHeader from './SidebarHeader';
import ClientSelector from './ClientSelector';
import SidebarNav from './SidebarNav';

export default function Sidebar() {
  const { isCollapsed, isHovered, setHovered } = useSidebar();

  const sidebarWidth = isCollapsed ? (isHovered ? 'w-sidebar-expanded' : 'w-sidebar-collapsed') : 'w-sidebar-expanded';

  return (
    <div
      className={cn(
        'fixed left-3 top-3 bottom-3 z-50',
        'bg-background-sidebar rounded-xl',
        'transition-all duration-400 ease-smooth',
        'border border-text-onSidebar',
        sidebarWidth
      )}
      style={{ boxShadow: '0 0 30px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header with logo and toggle */}
        <SidebarHeader />
        
        {/* Client Selector */}
        <div className="px-3 pb-4">
          <ClientSelector />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </div>
    </div>
  );
}