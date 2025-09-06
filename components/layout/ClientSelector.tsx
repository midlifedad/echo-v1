'use client';

import React from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { CLIENTS } from '@/lib/constants';

export default function ClientSelector() {
  const { isCollapsed, isHovered, selectedClient, setSelectedClient } = useSidebar();
  
  const showText = !isCollapsed || isHovered;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start gap-3 h-12 px-3',
            'border-border/40 hover:border-primary/30',
            'bg-muted/50 hover:bg-primary/5',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Client icon/logo placeholder */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: selectedClient.color }}
            >
              <Building2 size={14} />
            </div>
            
            {/* Client name */}
            {showText && (
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {selectedClient.name}
                </span>
                <span className="text-xs text-muted-foreground">Client</span>
              </div>
            )}
          </div>
          
          {showText && (
            <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-56 p-2"
        side={isCollapsed && !isHovered ? 'right' : 'bottom'}
      >
        {CLIENTS.map((client) => (
          <DropdownMenuItem
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
              'hover:bg-primary/5 transition-colors',
              selectedClient.id === client.id && 'bg-primary/10'
            )}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: client.color }}
            >
              <Building2 size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {client.name}
              </span>
              <span className="text-xs text-muted-foreground">Client Account</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}