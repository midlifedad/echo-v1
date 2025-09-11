'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ImageUpload } from '../ImageUpload';
import { Image, Palette, Type, Maximize, Minimize } from 'lucide-react';

interface ImageTileEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function ImageTileEditor({ content, onChange }: ImageTileEditorProps) {
  const handleContentChange = (key: string, value: any) => {
    onChange({
      ...content,
      [key]: value
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

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content" className="gap-2">
          <Image className="h-4 w-4" />
          Image
        </TabsTrigger>
        <TabsTrigger value="text" className="gap-2">
          <Type className="h-4 w-4" />
          Text
        </TabsTrigger>
        <TabsTrigger value="style" className="gap-2">
          <Palette className="h-4 w-4" />
          Style
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label>Image Source</Label>
          <ImageUpload
            value={content?.imageUrl || ''}
            onChange={(imageUrl) => handleContentChange('imageUrl', imageUrl)}
          />
        </div>

        <div className="space-y-2">
          <Label>Image Link (optional)</Label>
          <Input
            value={content?.link || ''}
            onChange={(e) => handleContentChange('link', e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-xs text-muted-foreground">
            Make the image clickable by adding a link
          </p>
        </div>
      </TabsContent>

      <TabsContent value="text" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label>Caption</Label>
          <Textarea
            value={content?.caption || ''}
            onChange={(e) => handleContentChange('caption', e.target.value)}
            placeholder="Image caption (optional)"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Alt Text</Label>
          <Input
            value={content?.alt || ''}
            onChange={(e) => handleContentChange('alt', e.target.value)}
            placeholder="Describe the image for accessibility"
          />
          <p className="text-xs text-muted-foreground">
            Important for screen readers and SEO
          </p>
        </div>

        <div className="space-y-2">
          <Label>Caption Position</Label>
          <Select 
            value={style.captionPosition || 'below'}
            onValueChange={(value) => handleStyleChange('captionPosition', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="above">Above Image</SelectItem>
              <SelectItem value="below">Below Image</SelectItem>
              <SelectItem value="overlay-top">Overlay Top</SelectItem>
              <SelectItem value="overlay-bottom">Overlay Bottom</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="style" className="mt-4 space-y-4">
        {/* Object Fit */}
        <div className="space-y-2">
          <Label>Image Fit</Label>
          <Select 
            value={style.objectFit || 'cover'}
            onValueChange={(value) => handleStyleChange('objectFit', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contain">Contain (fit within)</SelectItem>
              <SelectItem value="cover">Cover (fill space)</SelectItem>
              <SelectItem value="fill">Fill (stretch)</SelectItem>
              <SelectItem value="none">None (original size)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Position */}
        <div className="space-y-2">
          <Label>Image Position</Label>
          <Select 
            value={style.objectPosition || 'center'}
            onValueChange={(value) => handleStyleChange('objectPosition', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <Label>Border Radius</Label>
          <Select 
            value={style.borderRadius || 'none'}
            onValueChange={(value) => handleStyleChange('borderRadius', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="full">Full (Circle/Pill)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shadow */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Shadow</Label>
            <Switch
              checked={style.hasShadow || false}
              onCheckedChange={(checked) => handleStyleChange('hasShadow', checked)}
            />
          </div>
          {style.hasShadow && (
            <Select 
              value={style.shadowSize || 'medium'}
              onValueChange={(value) => handleStyleChange('shadowSize', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <Label>Image Opacity</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[style.opacity || 100]}
              onValueChange={([value]) => handleStyleChange('opacity', value)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {style.opacity || 100}%
            </span>
          </div>
        </div>

        {/* Hover Effects */}
        <div className="space-y-2">
          <Label>Hover Effect</Label>
          <Select 
            value={style.hoverEffect || 'none'}
            onValueChange={(value) => handleStyleChange('hoverEffect', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="zoom">Zoom In</SelectItem>
              <SelectItem value="brighten">Brighten</SelectItem>
              <SelectItem value="darken">Darken</SelectItem>
              <SelectItem value="grayscale">Grayscale to Color</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <Select 
            value={style.aspectRatio || 'auto'}
            onValueChange={(value) => handleStyleChange('aspectRatio', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Original)</SelectItem>
              <SelectItem value="1/1">Square (1:1)</SelectItem>
              <SelectItem value="16/9">Wide (16:9)</SelectItem>
              <SelectItem value="4/3">Standard (4:3)</SelectItem>
              <SelectItem value="3/2">Classic (3:2)</SelectItem>
              <SelectItem value="21/9">Ultrawide (21:9)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>
    </Tabs>
  );
}