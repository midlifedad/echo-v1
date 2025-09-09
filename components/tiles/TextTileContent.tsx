'use client';

import React from 'react';
import { TextTileContent as TextContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TextTileContentProps {
  content?: TextContent;
  className?: string;
}

export default function TextTileContent({ content, className }: TextTileContentProps) {
  if (!content?.richText) {
    return (
      <div className={cn('flex-1 p-4 overflow-auto', className)}>
        <p className="text-muted-foreground text-center">No content</p>
      </div>
    );
  }

  // Render HTML content directly
  if (content.format === 'html') {
    return (
      <div className={cn('flex-1 p-4 overflow-auto', className)}>
        <div 
          className={cn(
            'prose prose-sm max-w-none',
            'prose-headings:font-semibold prose-headings:text-foreground',
            'prose-p:text-foreground prose-p:leading-relaxed',
            'prose-ul:text-foreground prose-ol:text-foreground',
            'prose-li:text-foreground',
            'prose-strong:text-foreground prose-strong:font-semibold',
            'prose-em:text-foreground',
            'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded',
            'prose-blockquote:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4',
          )}
          dangerouslySetInnerHTML={{ __html: content.richText }}
        />
      </div>
    );
  }

  // For markdown format (future implementation)
  return (
    <div className={cn('flex-1 p-4 overflow-auto', className)}>
      <pre className="whitespace-pre-wrap font-sans">{content.richText}</pre>
    </div>
  );
}