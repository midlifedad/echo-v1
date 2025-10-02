'use client';

import React, { useState } from 'react';
import Highcharts from 'highcharts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TileData } from '@/lib/types';
import LayoutTileHeader from './LayoutTileHeader';
import LayoutTileContent from './LayoutTileContent';
import LayoutTileContextMenu from './LayoutTileContextMenu';
import { useLayout } from '@/contexts/LayoutContext';
import { useTiles } from '@/contexts/TileContext';
import { GripHorizontal, Lock } from 'lucide-react';
import { TileContentEditor } from '@/components/tiles/TileContentEditor';

interface TileProps {
  tile: TileData;
  className?: string;
  onExpand?: () => void;
}

export default function LayoutTile({ 
  tile, 
  className,
  onExpand 
}: TileProps) {
  const [chartInstance, setChartInstance] = useState<Highcharts.Chart | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { isEditMode, cleanupTileData } = useLayout();
  const { updateTile, removeTile } = useTiles();

  const handleChartReady = (chart: Highcharts.Chart | null) => {
    setChartInstance(chart);
  };

  const handleLockToggle = () => {
    updateTile(tile.id, { isLocked: !tile.isLocked });
  };

  // Context menu handlers
  const handleRefresh = () => {
    console.log('Refreshing tile:', tile.id);
  };

  const handleMaximize = () => {
    if (onExpand) {
      onExpand();
    }
  };

  const handleEdit = () => {
    setShowEditor(true);
  };

  const handleDuplicate = () => {
    console.log('Duplicate tile:', tile.id);
  };

  const handleRemove = async () => {
    await removeTile(tile.id, cleanupTileData);
  };

  const handleDisplayConfig = (config: any) => {
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
      console.log('Export data:', type);
    }
  };

  const handleCopy = () => {
    console.log('Copy to clipboard');
  };

  const handleShare = () => {
    console.log('Share tile:', tile.id);
  };

  const handleViewDetails = () => {
    console.log('View details:', tile.id);
  };

  const handleSaveEdit = async (updatedTile: any) => {
    await updateTile(tile.id, updatedTile);
    setShowEditor(false);
  };

  // Apply display settings
  const showTitle = tile.displaySettings?.showTitle !== false;
  const titlePosition = tile.displaySettings?.titlePosition || 'top';
  const borderStyle = tile.displaySettings?.border || 'default';

  return (
    <>
      <Card 
        className={cn(
          'py-0 gap-0', // Override Card's default py-6 and gap-6
          'overflow-hidden',
          'transition-all duration-200',
          'hover:shadow-md',
          'animate-tile-appear',
          'flex flex-col',
          'h-full w-full', // Ensure it fills the grid item
          '!relative', // Important: ensure relative positioning for handles
          isEditMode && 'border border-gray-400/50', // Subtle grey edit mode indicator
          isEditMode && tile.isLocked && 'opacity-95', // Subtle locked indicator
          borderStyle === 'none' && 'border-0 shadow-none',
          titlePosition === 'bottom' && 'flex-col-reverse',
          className
        )}
      >
        {showTitle ? (
          // Normal structure with header
          <>
            <LayoutTileHeader 
              tile={tile} 
              onExpand={onExpand} 
              chartInstance={chartInstance} 
              tileId={tile.id}
              isLocked={tile.isLocked}
              onLockToggle={handleLockToggle}
              hideTitle={false}
              onEdit={handleEdit}
            />
            <LayoutTileContent tile={tile} onChartReady={handleChartReady} />
          </>
        ) : (
          // Overlay structure - content fills entire space
          <>
            <LayoutTileContent tile={tile} onChartReady={handleChartReady} />
            {/* Floating controls - absolute to this tile */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2 z-10">
              {/* Left side - drag handle and lock */}
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <>
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground/70 transition-colors">
                      <GripHorizontal size={16} />
                    </div>
                    {tile.isLocked && (
                      <Lock size={12} className="text-muted-foreground/50" />
                    )}
                  </>
                )}
              </div>
              {/* Right side - context menu */}
              <LayoutTileContextMenu
                tile={tile}
                isEditMode={isEditMode}
                isLocked={tile.isLocked}
                chartInstance={chartInstance}
                onMaximize={handleMaximize}
                onRefresh={handleRefresh}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onRemove={handleRemove}
                onLockToggle={handleLockToggle}
                onDisplayConfig={handleDisplayConfig}
                onExport={handleExport}
                onCopy={handleCopy}
                onShare={handleShare}
                onViewDetails={handleViewDetails}
              />
            </div>
          </>
        )}
      </Card>

      {/* Tile Content Editor Modal */}
      {showEditor && (
        <TileContentEditor
          open={showEditor}
          onOpenChange={setShowEditor}
          tile={tile}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}