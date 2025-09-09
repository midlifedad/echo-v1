'use client';

import React from 'react';
import { SmartTileContent as SmartContent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface SmartTileContentProps {
  content?: SmartContent;
  className?: string;
}

export default function SmartTileContent({ content, className }: SmartTileContentProps) {
  // Placeholder component for smart tiles - to be implemented
  return (
    <div className={cn('flex-1 p-4 flex flex-col items-center justify-center', className)}>
      <Sparkles className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-semibold mb-2">Smart Tile</h3>
      <p className="text-muted-foreground text-center text-sm">
        Smart tiles with AI-powered insights coming soon
      </p>
    </div>
  );
}