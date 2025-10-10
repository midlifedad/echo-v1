'use client';

import React, { useState } from 'react';
import { GripHorizontal, Lock } from 'lucide-react';
import Highcharts from 'highcharts';
import { Separator } from '@/components/ui/separator';
import { TileData } from '@/lib/types';
import { useTiles } from '@/contexts/TileContext';
import { useLayout } from '@/contexts/LayoutContext';
import LayoutTileContextMenu from './LayoutTileContextMenu';

interface TileHeaderProps {
  tile: TileData;
  onExpand?: () => void;
  chartInstance?: Highcharts.Chart | null;
  tileId: string;
  isLocked?: boolean;
  onLockToggle?: () => void;
  hideTitle?: boolean;
  onEdit?: () => void;
}

export default function LayoutTileHeader({ 
  tile, 
  onExpand, 
  chartInstance, 
  tileId,
  isLocked = false,
  onLockToggle,
  hideTitle = false,
  onEdit
}: TileHeaderProps) {
  const { removeTile, updateTile } = useTiles();
  const { isEditMode, cleanupTileData } = useLayout();

  const handleRefresh = () => {
    // Trigger chart refresh
    console.log('Refreshing tile:', tile.id);
  };

  const handleMaximize = () => {
    if (onExpand) {
      onExpand();
    }
  };


  const handleDuplicate = () => {
    // TODO: Implement tile duplication
    console.log('Duplicate tile:', tile.id);
  };

  const handleRemove = () => {
    removeTile(tile.id, cleanupTileData);
  };

  const handleDisplayConfig = (config: any) => {
    // Update tile's display settings
    const currentSettings = tile.displaySettings || {};
    const updatedSettings = { ...currentSettings, ...config };
    updateTile(tile.id, { displaySettings: updatedSettings });
  };

  const handleExport = (type: string) => {
    if (type.startsWith('image/') || type === 'application/pdf') {
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
    } else {
      // TODO: Implement data export
      console.log('Export data:', type);
    }
  };

  const handleCopy = () => {
    // TODO: Implement copy to clipboard for text tiles
    console.log('Copy to clipboard');
  };

  const handleShare = () => {
    // TODO: Implement sharing
    console.log('Share tile:', tile.id);
  };

  const handleViewDetails = () => {
    // TODO: Implement view details
    console.log('View details:', tile.id);
  };


  return (
    <>
      <div className="flex items-center justify-between p-2">
        {/* Left side - drag handle and title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditMode && (
            <>
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground/70 transition-colors">
                <GripHorizontal size={16} />
              </div>
              {isLocked && (
                <Lock size={12} className="text-muted-foreground/50" />
              )}
            </>
          )}
          
          {!hideTitle && (
            <h3 className="text-sm font-medium text-foreground truncate">
              {tile.title}
            </h3>
          )}
        </div>

        {/* Right side - context menu only */}
        <LayoutTileContextMenu
          tile={tile}
          isEditMode={isEditMode}
          isLocked={isLocked}
          chartInstance={chartInstance}
          onMaximize={handleMaximize}
          onRefresh={handleRefresh}
          onEdit={onEdit}
          onDuplicate={handleDuplicate}
          onRemove={handleRemove}
          onLockToggle={onLockToggle}
          onDisplayConfig={handleDisplayConfig}
          onExport={handleExport}
          onCopy={handleCopy}
          onShare={handleShare}
          onViewDetails={handleViewDetails}
        />
      </div>
      {!hideTitle && <Separator />}
    </>
  );
}