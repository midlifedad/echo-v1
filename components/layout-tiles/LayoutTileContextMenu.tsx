'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Maximize2,
  RefreshCw,
  Download,
  Copy,
  Info,
  Share2,
  Edit,
  CopyPlus,
  Settings,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  AlignTop,
  AlignBottom,
  Square,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TileData } from '@/lib/types';

interface LayoutTileContextMenuProps {
  tile: TileData;
  isEditMode: boolean;
  isLocked?: boolean;
  chartInstance?: Highcharts.Chart | null;
  onMaximize?: () => void;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  onLockToggle?: () => void;
  onDisplayConfig?: (config: any) => void;
  onExport?: (type: string) => void;
  onCopy?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
}

export default function LayoutTileContextMenu({
  tile,
  isEditMode,
  isLocked = false,
  chartInstance,
  onMaximize,
  onRefresh,
  onEdit,
  onDuplicate,
  onRemove,
  onLockToggle,
  onDisplayConfig,
  onExport,
  onCopy,
  onShare,
  onViewDetails,
}: LayoutTileContextMenuProps) {
  const isChartTile = !['text', 'image', 'smart'].includes(tile.type);

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const handleExport = (type: string) => {
    if (onExport) {
      onExport(type);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    }
  };

  return (
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
      
      <DropdownMenuContent align="end" className="w-56">
        {!isEditMode ? (
          // View Mode Menu Items
          <>
            <DropdownMenuItem onClick={onMaximize}>
              <Maximize2 className="mr-2 h-4 w-4" />
              <span>Maximize</span>
            </DropdownMenuItem>
            
            {isChartTile && (
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Refresh</span>
              </DropdownMenuItem>
            )}
            
            {isChartTile && chartInstance && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('image/png')}>
                      <span>Export as PNG</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('image/jpeg')}>
                      <span>Export as JPEG</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('image/svg+xml')}>
                      <span>Export as SVG</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('application/pdf')}>
                      <span>Export as PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport('text/csv')}>
                      <span>Export data as CSV</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('application/json')}>
                      <span>Export data as JSON</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}
            
            {tile.type === 'text' && (
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy to Clipboard</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={onViewDetails}>
              <Info className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
          </>
        ) : (
          // Edit Mode Menu Items
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Content</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onDuplicate}>
              <CopyPlus className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configure Display</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Title Bar</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ showTitle: true })}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Show Title</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ showTitle: false })}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  <span>Hide Title</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Title Position</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ titlePosition: 'top' })}>
                  <AlignTop className="mr-2 h-4 w-4" />
                  <span>Top</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ titlePosition: 'bottom' })}>
                  <AlignBottom className="mr-2 h-4 w-4" />
                  <span>Bottom</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Border</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ border: 'none' })}>
                  <Square className="mr-2 h-4 w-4" />
                  <span>No Border</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ border: 'default' })}>
                  <Square className="mr-2 h-4 w-4" />
                  <span>Default Border</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Padding</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ padding: 'none' })}>
                  <Layers className="mr-2 h-4 w-4" />
                  <span>No Padding</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ padding: 'small' })}>
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Small</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ padding: 'medium' })}>
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Medium</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDisplayConfig?.({ padding: 'large' })}>
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Large</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuItem onClick={onLockToggle}>
              {isLocked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  <span>Unlock</span>
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Lock Position</span>
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleRemove}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Remove</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}