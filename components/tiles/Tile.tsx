'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TileData } from '@/lib/types';
import TileHeader from './TileHeader';
import TileContent from './TileContent';

interface TileProps {
  tile: TileData;
  className?: string;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function Tile({ 
  tile, 
  className,
  isDragging = false,
  onDragStart,
  onDragEnd 
}: TileProps) {
  return (
    <Card 
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'py-0 gap-0', // Override Card's default py-6 and gap-6
        'overflow-hidden',
        'aspect-[4/3]', // 4:3 aspect ratio like vanilla JS
        'transition-all duration-200',
        'hover:shadow-md',
        'animate-tile-appear',
        'flex flex-col',
        isDragging && 'opacity-50 cursor-grabbing',
        !isDragging && 'cursor-grab',
        className
      )}
    >
      <TileHeader tile={tile} />
      <TileContent tile={tile} />
    </Card>
  );
}