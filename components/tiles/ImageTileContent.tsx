'use client';

import React, { useState } from 'react';
import { ImageTileContent as ImageContent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface ImageTileContentProps {
  content?: ImageContent;
  className?: string;
}

export default function ImageTileContent({ content, className }: ImageTileContentProps) {
  const [imageError, setImageError] = useState(false);

  if (!content?.imageUrl) {
    return (
      <div className={cn('flex-1 p-4 flex flex-col items-center justify-center', className)}>
        <ImageOff className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-center">No image</p>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className={cn('flex-1 p-4 flex flex-col items-center justify-center', className)}>
        <ImageOff className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-center">Failed to load image</p>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 p-3 overflow-hidden flex flex-col', className)}>
      <div className="flex-1 min-h-0 relative">
        <img
          src={content.imageUrl}
          alt={content.alt || content.caption || 'Image'}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
      {content.caption && (
        <div className="pt-2 mt-2 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {content.caption}
          </p>
        </div>
      )}
    </div>
  );
}