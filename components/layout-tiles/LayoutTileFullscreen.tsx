'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TileData } from '@/lib/types';
import LayoutTileContent from './LayoutTileContent';
import { cn } from '@/lib/utils';

interface TileFullscreenProps {
  tile: TileData;
  isOpen: boolean;
  onClose: () => void;
}

export default function LayoutTileFullscreen({ tile, isOpen, onClose }: TileFullscreenProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in-0">
      <div className="fixed inset-4 z-50 flex flex-col bg-card rounded-lg shadow-xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{tile.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-destructive/10"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="h-full">
            <LayoutTileContent tile={tile} />
          </div>
        </div>
      </div>
    </div>
  );
}