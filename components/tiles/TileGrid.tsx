'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTiles } from '@/contexts/TileContext';
import { TileData } from '@/lib/types';
import Tile from './Tile';

interface TileGridProps {
  className?: string;
}

export default function TileGrid({ className }: TileGridProps) {
  const { tiles, reorderTiles } = useTiles();
  const [draggedTile, setDraggedTile] = useState<TileData | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (tile: TileData) => {
    setDraggedTile(tile);
  };

  const handleDragEnd = () => {
    setDraggedTile(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Allow drop
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedTile) return;
    
    const draggedIndex = tiles.findIndex(t => t.id === draggedTile.id);
    if (draggedIndex === dropIndex) return; // No change needed
    
    // Reorder tiles array
    const newTiles = [...tiles];
    newTiles.splice(draggedIndex, 1); // Remove dragged tile
    newTiles.splice(dropIndex, 0, draggedTile); // Insert at new position
    
    reorderTiles(newTiles);
    setDragOverIndex(null);
  };

  const sortedTiles = tiles.sort((a, b) => a.position - b.position);

  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
      'auto-rows-fr', // Equal height rows
      className
    )}>
      {sortedTiles.map((tile, index) => (
        <div
          key={tile.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          className={cn(
            'transition-all duration-200',
            dragOverIndex === index && draggedTile?.id !== tile.id && 'scale-105'
          )}
        >
          <Tile 
            tile={tile} 
            isDragging={draggedTile?.id === tile.id}
            onDragStart={() => handleDragStart(tile)}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}