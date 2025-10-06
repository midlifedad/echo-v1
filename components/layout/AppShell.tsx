'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { isCollapsed, isHovered } = useSidebar();
  
  // Calculate margins based on sidebar state
  const marginLeft = isCollapsed && !isHovered 
    ? '120px'  // Better spacing for collapsed sidebar
    : '250px'; // Perfect spacing for expanded sidebar
  
  return (
    <div className="min-h-screen bg-background-default">
      <Sidebar />

      <main
        className={cn(
          'transition-all duration-400 ease-smooth',
          'py-6 pr-6'
        )}
        style={{ marginLeft }}
      >
        {children}
      </main>
    </div>
  );
}