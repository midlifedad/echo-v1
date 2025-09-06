'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  Map, 
  GitBranch, 
  Database, 
  BarChart3, 
  Zap, 
  Edit3 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';

const iconMap = {
  Map,
  GitBranch,
  Database,
  BarChart3,
  Zap,
  Edit3,
};

export default function SidebarNav() {
  const { isCollapsed, isHovered, activeSection, setActiveSection } = useSidebar();
  const pathname = usePathname();
  
  const showText = !isCollapsed || isHovered;

  return (
    <nav className="px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = pathname === item.href || activeSection === item.id;
        
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-sm font-medium transition-all duration-200',
              'hover:bg-primary/5 group',
              isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-primary hover:text-primary/80'
            )}
          >
            <Icon 
              size={18} 
              className={cn(
                'flex-shrink-0 transition-colors',
                'text-primary'
              )} 
            />
            
            {showText && (
              <span className="truncate transition-opacity duration-200">
                {item.label}
              </span>
            )}
            
            {/* Active indicator dot when collapsed */}
            {isActive && (isCollapsed && !isHovered) && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full ml-auto" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}