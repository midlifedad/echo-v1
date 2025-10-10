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
            'border-2 border-text-onSidebar hover:border-text-onSidebar',
            'bg-text-onSidebar/10 hover:bg-text-onSidebar/20',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Client logo */}
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              <img
                src={selectedClient.logo}
                alt={selectedClient.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Client name */}
            {showText && (
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium text-text-onSidebar truncate">
                  {selectedClient.name}
                </span>
                <span className="text-xs text-text-onSidebar/70">Client</span>
              </div>
            )}
          </div>

          {showText && (
            <ChevronDown size={16} className="text-text-onSidebar flex-shrink-0" />
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
              'hover:bg-black/5 transition-colors',
              selectedClient.id === client.id && 'bg-black/10'
            )}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              <img
                src={client.logo}
                alt={client.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-black">
                {client.name}
              </span>
              <span className="text-xs text-black/70">Client Account</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}