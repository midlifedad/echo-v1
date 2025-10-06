'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CHART_TYPES } from '@/lib/constants';
import { ChartType } from '@/lib/types';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAddTile?: (type: ChartType) => void;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, onAddTile, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {actions}
        {onAddTile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-primary-500 hover:bg-primary-600 text-text-inverse gap-2"
              size="sm"
            >
              <Plus size={16} />
              Add Tile
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            {CHART_TYPES.map((chartType) => (
              <DropdownMenuItem
                key={chartType.id}
                onClick={() => onAddTile(chartType.id as ChartType)}
                className="flex items-center gap-2 px-3 py-2"
              >
                <span className="text-sm">{chartType.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        )}
      </div>
    </div>
  );
}