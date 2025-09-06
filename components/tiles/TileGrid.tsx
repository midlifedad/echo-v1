'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTiles } from '@/contexts/TileContext';
import Tile from './Tile';

interface TileGridProps {
  className?: string;
}

export default function TileGrid({ className }: TileGridProps) {
  const { tiles } = useTiles();

  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
      'auto-rows-fr', // Equal height rows
      className
    )}>
      {tiles
        .sort((a, b) => a.position - b.position)
        .map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
    </div>
  );
}