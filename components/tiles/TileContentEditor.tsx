'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TextTileEditor, ImageTileEditor, ChartTileEditor } from './editors';
import type { TileData, TileType } from '@/lib/types';

interface TileContentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tile: TileData;
  onSave: (updatedTile: TileData) => void;
}

const isChartType = (type: string): boolean => {
  const chartTypes = ['line', 'area', 'column', 'bar', 'pie', 'gauge', 'scatter', 'spline', 
                      'bubble', 'heatmap', 'treemap', 'funnel', 'waterfall', 'areaspline'];
  return chartTypes.includes(type);
};

export function TileContentEditor({ 
  open, 
  onOpenChange,
  tile,
  onSave 
}: TileContentEditorProps) {
  const [formData, setFormData] = useState<TileData>({
    ...tile
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    try {
      onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving tile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(tile); // Reset to original
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-6xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>Edit {tile.title}</DialogTitle>
          <DialogDescription>
            Modify the content and settings for this tile
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter tile title"
                />
              </div>
            </div>
            
            <Separator className="mb-6" />
            
            {/* Type-specific Editor */}
            <div className="min-h-[300px]">
              {formData.type === 'text' && (
                <TextTileEditor
                  content={formData.content || {}}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              )}
              
              {formData.type === 'image' && (
                <ImageTileEditor
                  content={formData.content || {}}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              )}
              
              {formData.type === 'smart' && (
                <div className="text-center py-8 text-muted-foreground">
                  Smart tile editing coming soon!
                </div>
              )}
              
              {isChartType(formData.type) && (
                <ChartTileEditor
                  type={formData.type}
                  config={formData.config || {}}
                  onChange={(config) => setFormData({ ...formData, config })}
                />
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.title}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}