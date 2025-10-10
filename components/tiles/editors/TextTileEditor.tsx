'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '../RichTextEditor';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Type,
  Palette,
  Square,
  Space
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TextTileEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function TextTileEditor({ content, onChange }: TextTileEditorProps) {
  const handleContentChange = (richText: string) => {
    onChange({
      ...content,
      richText,
      format: 'html'
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    onChange({
      ...content,
      style: {
        ...content?.style,
        [key]: value
      }
    });
  };

  const style = content?.style || {};

  // Helper functions for preview styles
  const getTextAlignClass = () => {
    switch (style.textAlign) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      case 'left':
      default: return 'text-left';
    }
  };

  const getFontSizeClass = () => {
    switch (style.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      case 'medium':
      default: return 'text-base';
    }
  };

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

  const getPaddingClass = () => {
    switch (style.padding) {
      case 'none': return 'p-0';
      case 'small': return 'p-2';
      case 'large': return 'p-6';
      case 'medium':
      default: return 'p-4';
    }
  };

  const getVerticalAlignClass = () => {
    switch (style.verticalAlign) {
      case 'top': return 'justify-start';
      case 'bottom': return 'justify-end';
      case 'middle':
      default: return 'justify-center';
    }
  };

  // Build preview styles
  const previewContainerClass = cn(
    'border rounded-lg overflow-hidden flex flex-col',
    getVerticalAlignClass(),
    getBackgroundClass(),
    getPaddingClass()
  );

  const previewTextClass = cn(
    getTextAlignClass(),
    getFontSizeClass(),
    getTextColorClass()
  );

  const previewInlineStyles: React.CSSProperties = {
    lineHeight: style.lineHeight || 1.5,
  };

  return (
    <div className="space-y-3">
      <TooltipProvider>
        {/* Compact Style Controls Bar */}
        <div className="border rounded-lg p-2 bg-muted/30">
          <div className="flex flex-wrap items-center gap-3">
            {/* Horizontal Alignment */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Align:</span>
              <div className="flex gap-0.5 border rounded-md p-0.5 bg-background">
                {[
                  { value: 'left', icon: AlignLeft, tooltip: 'Align Left' },
                  { value: 'center', icon: AlignCenter, tooltip: 'Align Center' },
                  { value: 'right', icon: AlignRight, tooltip: 'Align Right' },
                  { value: 'justify', icon: AlignJustify, tooltip: 'Justify' }
                ].map(({ value, icon: Icon, tooltip }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStyleChange('textAlign', value)}
                        className={`p-1.5 rounded transition-colors ${
                          style.textAlign === value || (value === 'left' && !style.textAlign)
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Vertical Alignment */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Vertical:</span>
              <div className="flex gap-0.5 border rounded-md p-0.5 bg-background">
                {[
                  { value: 'top', icon: AlignVerticalJustifyStart, tooltip: 'Top' },
                  { value: 'middle', icon: AlignVerticalJustifyCenter, tooltip: 'Middle' },
                  { value: 'bottom', icon: AlignVerticalJustifyEnd, tooltip: 'Bottom' }
                ].map(({ value, icon: Icon, tooltip }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleStyleChange('verticalAlign', value)}
                        className={`p-1.5 rounded transition-colors ${
                          style.verticalAlign === value || (value === 'middle' && !style.verticalAlign)
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Font Size */}
            <div className="flex items-center gap-1.5">
              <Type className="h-3 w-3 text-muted-foreground" />
              <Select 
                value={style.fontSize || 'medium'}
                onValueChange={(value) => handleStyleChange('fontSize', value)}
              >
                <SelectTrigger className="h-7 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="small" className="text-xs">Small</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="large" className="text-xs">Large</SelectItem>
                  <SelectItem value="xlarge" className="text-xs">X-Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Text Color */}
            <div className="flex items-center gap-1.5">
              <Palette className="h-3 w-3 text-muted-foreground" />
              <Select 
                value={style.textColor || 'default'}
                onValueChange={(value) => handleStyleChange('textColor', value)}
              >
                <SelectTrigger className="h-7 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="default" className="text-xs">Default</SelectItem>
                  <SelectItem value="muted" className="text-xs">Muted</SelectItem>
                  <SelectItem value="primary" className="text-xs">Primary</SelectItem>
                  <SelectItem value="secondary" className="text-xs">Secondary</SelectItem>
                  <SelectItem value="success" className="text-xs">Success</SelectItem>
                  <SelectItem value="warning" className="text-xs">Warning</SelectItem>
                  <SelectItem value="danger" className="text-xs">Danger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Background */}
            <div className="flex items-center gap-1.5">
              <Square className="h-3 w-3 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <Switch
                  checked={style.hasBackground || false}
                  onCheckedChange={(checked) => handleStyleChange('hasBackground', checked)}
                  className="scale-75"
                />
                {style.hasBackground && (
                  <Select 
                    value={style.backgroundColor || 'muted'}
                    onValueChange={(value) => handleStyleChange('backgroundColor', value)}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="muted" className="text-xs">Muted</SelectItem>
                      <SelectItem value="primary-light" className="text-xs">Primary</SelectItem>
                      <SelectItem value="secondary-light" className="text-xs">Secondary</SelectItem>
                      <SelectItem value="accent" className="text-xs">Accent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Line Height */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Line:</span>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.lineHeight || 1.5]}
                  onValueChange={([value]) => handleStyleChange('lineHeight', value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-16"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {style.lineHeight || 1.5}
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Padding */}
            <div className="flex items-center gap-1.5">
              <Space className="h-3 w-3 text-muted-foreground" />
              <Select 
                value={style.padding || 'medium'}
                onValueChange={(value) => handleStyleChange('padding', value)}
              >
                <SelectTrigger className="h-7 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  <SelectItem value="small" className="text-xs">Small</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="large" className="text-xs">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Rich Text Editor with Live Preview */}
      <div className={previewContainerClass}>
        <div className={previewTextClass} style={previewInlineStyles}>
          <RichTextEditor
            content={content?.richText || ''}
            onChange={handleContentChange}
            placeholder="Start typing your content..."
            className="border-0 min-h-[400px]"
          />
        </div>
      </div>
    </div>
  );
}