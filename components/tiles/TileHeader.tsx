'use client';

import React from 'react';
import { GripHorizontal, MoreHorizontal, RefreshCw, Maximize2, X, Download } from 'lucide-react';
import Highcharts from 'highcharts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TileData } from '@/lib/types';
import { useTiles } from '@/contexts/TileContext';

interface TileHeaderProps {
  tile: TileData;
  onExpand?: () => void;
  chartInstance?: Highcharts.Chart | null;
}

export default function TileHeader({ tile, onExpand, chartInstance }: TileHeaderProps) {
  const { removeTile } = useTiles();

  const handleRefresh = () => {
    // Trigger chart refresh
    console.log('Refreshing tile:', tile.id);
  };

  const handleMaximize = () => {
    if (onExpand) {
      onExpand();
    }
  };

  const handleRemove = () => {
    removeTile(tile.id);
  };

  const handleExport = (type: string) => {
    if (!chartInstance) {
      console.warn('Chart is not ready for export');
      return;
    }

    try {
      // @ts-ignore - exportChart is added by the exporting module
      if (chartInstance.exportChart) {
        // @ts-ignore
        chartInstance.exportChart({
          type: type,
          filename: tile.title.replace(/\s+/g, '-').toLowerCase()
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-2">
        {/* Left side - drag handle and title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground/70 transition-colors">
            <GripHorizontal size={16} />
          </div>
          
          <h3 className="text-sm font-medium text-foreground truncate">
            {tile.title}
          </h3>
        </div>

        {/* Right side - action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-6 w-6 text-muted-foreground hover:text-foreground/70 hover:bg-primary/5"
          >
            <RefreshCw size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleMaximize}
            className="h-6 w-6 text-muted-foreground hover:text-foreground/70 hover:bg-primary/5"
          >
            <Maximize2 size={14} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground/70 hover:bg-primary/5"
                disabled={!chartInstance}
              >
                <Download size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('image/png')} className="gap-2">
                <span>Export as PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('image/jpeg')} className="gap-2">
                <span>Export as JPEG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('image/svg+xml')} className="gap-2">
                <span>Export as SVG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('application/pdf')} className="gap-2">
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground/70 hover:bg-primary/5"
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleMaximize} className="gap-2">
                <Maximize2 size={14} />
                <span>Maximize</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefresh} className="gap-2">
                <RefreshCw size={14} />
                <span>Refresh</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleRemove} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <X size={14} />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
    </>
  );
}