'use client';

import React from 'react';
import { TextTileContent as TextContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TextTileContentProps {
  content?: TextContent;
  className?: string;
}

export default function TextTileContent({ content, className }: TextTileContentProps) {
  const style = content?.style || {};
  
  // Get vertical alignment
  const getVerticalAlignClass = () => {
    switch (style.verticalAlign) {
      case 'top': return 'justify-start';
      case 'bottom': return 'justify-end';
      case 'middle':
      default: return 'justify-center';
    }
  };

  // Get text alignment
  const getTextAlignClass = () => {
    switch (style.textAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      case 'left':
      default: return 'text-left';
    }
  };

  // Get font size classes
  const getFontSizeClass = () => {
    switch (style.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      case 'medium':
      default: return 'text-base';
    }
  };

  // Get text color classes
  const getTextColorClass = () => {
    switch (style.textColor) {
      case 'muted': return 'text-muted-foreground';
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-secondary';
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'danger': return 'text-red-600 dark:text-red-400';
      case 'default':
      default: return 'text-foreground';
    }
  };

  // Get background color classes
  const getBackgroundClass = () => {
    if (!style.hasBackground) return '';
    
    switch (style.backgroundColor) {
      case 'primary-light': return 'bg-primary/10';
      case 'secondary-light': return 'bg-secondary/10';
      case 'accent': return 'bg-accent';
      case 'muted':
      default: return 'bg-muted';
    }
  };

  // Get padding classes
  const getPaddingClass = () => {
    switch (style.padding) {
      case 'none': return 'p-0';
      case 'small': return 'p-2';
      case 'large': return 'p-6';
      case 'medium':
      default: return 'p-4';
    }
  };

  // Build inline styles for properties that don't have Tailwind classes
  const inlineStyles: React.CSSProperties = {
    lineHeight: style.lineHeight || 1.5,
  };

  if (!content?.richText) {
    return (
      <div className={cn('flex-1 overflow-auto flex items-center', getVerticalAlignClass(), className)}>
        <p className="text-muted-foreground text-center w-full">No content</p>
      </div>
    );
  }

  // Container for the content with all styles applied
  const containerClasses = cn(
    'flex-1 overflow-auto flex flex-col',
    getVerticalAlignClass(),
    getBackgroundClass(),
    getPaddingClass(),
    className
  );

  // Prose container with text styles
  const proseClasses = cn(
    'prose prose-sm max-w-none',
    'prose-headings:font-semibold prose-headings:text-foreground',
    'prose-p:text-foreground prose-p:leading-relaxed',
    'prose-ul:text-foreground prose-ol:text-foreground',
    'prose-li:text-foreground',
    'prose-strong:text-foreground prose-strong:font-semibold',
    'prose-em:text-foreground',
    'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded',
    'prose-blockquote:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4',
    getTextAlignClass(),
    getFontSizeClass(),
    getTextColorClass()
  );

  // Render HTML content directly
  if (content.format === 'html') {
    return (
      <div className={containerClasses}>
        <div 
          className={proseClasses}
          style={inlineStyles}
          dangerouslySetInnerHTML={{ __html: content.richText }}
        />
      </div>
    );
  }

  // For markdown format (future implementation)
  return (
    <div className={containerClasses}>
      <pre className={cn('whitespace-pre-wrap font-sans', getTextAlignClass(), getFontSizeClass(), getTextColorClass())} style={inlineStyles}>
        {content.richText}
      </pre>
    </div>
  );
}