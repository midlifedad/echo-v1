'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TileForm } from './TileForm';
import { ChartDataEditor } from './ChartDataEditor';
import { ChartOptionsEditor } from './ChartOptionsEditor';
import HighchartsWrapper from '@/components/charts/HighchartsWrapper';
import type { Tile, CreateTileRequest, UpdateTileRequest } from '@/lib/types/database';
import type { TileType } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TextTileContent from './TextTileContent';
import ImageTileContent from './ImageTileContent';
import SmartTileContent from './SmartTileContent';
import { ImageUpload } from './ImageUpload';

interface TileEditorProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  tile?: Tile | null;
  mode?: 'create' | 'edit' | 'duplicate';
  layoutId?: string;
  onSave?: (tile: any, layoutId?: string) => void;
}

// Helper functions
const isChartType = (type: string): boolean => {
  const chartTypes = ['line', 'area', 'column', 'bar', 'pie', 'donut', 'scatter', 'bubble', 'heatmap', 'treemap', 'funnel', 'gauge', 'waterfall', 'spline', 'areaspline'];
  return chartTypes.includes(type);
};

const getTabCount = (type: string): number => {
  if (type === 'text' || type === 'image' || type === 'smart') return 2;
  if (isChartType(type)) return 3;
  return 1;
};

export function TileEditor({ 
  open, 
  isOpen,
  onOpenChange,
  onClose, 
  tile,
  mode = 'create',
  layoutId,
  onSave 
}: TileEditorProps) {
  const dialogOpen = open ?? isOpen ?? false;
  const handleOpenChange = onOpenChange ?? onClose ?? (() => {});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state - include new fields and handle duplicate mode
  const getInitialFormData = () => {
    if (mode === 'duplicate' && tile) {
      return {
        type: tile.type,
        title: `${tile.title} (Copy)`,
        name: tile.name ? `${tile.name} (Copy)` : `${tile.title} (Copy)`,
        description: tile.description,
        category: tile.category,
        tags: tile.tags,
        isTemplate: false,
        isPublic: false,
        config: tile.config,
        data: tile.data,
        dataSource: tile.dataSource,
      };
    }
    
    if (tile && mode === 'edit') {
      return {
        type: tile.type,
        title: tile.title,
        name: tile.name,
        description: tile.description,
        category: tile.category,
        tags: tile.tags,
        isTemplate: tile.isTemplate,
        isPublic: tile.isPublic,
        config: tile.config,
        data: tile.data,
        dataSource: tile.dataSource,
      };
    }
    
    return {
      type: 'line',
      title: '',
      name: '',
      description: '',
      category: '',
      tags: [],
      isTemplate: false,
      isPublic: false,
      config: {
        type: 'line',
        title: '',
        options: {}
      },
      data: null,
      content: null,
      dataSource: null,
    };
  };
  
  const [formData, setFormData] = useState<any>(getInitialFormData());

  // Preview state
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (tile) {
      setFormData({
        type: tile.type,
        title: tile.title,
        config: tile.config,
        data: tile.data,
        content: tile.content,
        dataSource: tile.dataSource,
      });
    } else {
      setFormData({
        type: 'text',
        title: '',
        config: {
          type: 'text',
          title: '',
          options: {}
        },
        data: null,
        content: null,
        dataSource: null,
      });
    }
    setActiveTab('basic');
  }, [tile, open]);

  const handleBasicUpdate = (updates: Partial<CreateTileRequest>) => {
    setFormData((prev: Partial<CreateTileRequest>) => ({
      ...prev,
      ...updates,
      config: {
        ...prev.config,
        type: updates.type || prev.type || 'line',
        title: updates.title || prev.title || '',
        subtitle: updates.config?.subtitle,
      },
      content: updates.content || prev.content
    }));
    setPreviewKey(prev => prev + 1);
  };

  const handleDataUpdate = (data: any) => {
    setFormData((prev: Partial<CreateTileRequest>) => ({
      ...prev,
      config: {
        ...prev.config,
        options: {
          ...prev.config?.options,
          ...data
        }
      }
    }));
    setPreviewKey(prev => prev + 1);
  };

  const handleOptionsUpdate = (options: any) => {
    setFormData((prev: Partial<CreateTileRequest>) => ({
      ...prev,
      config: {
        ...prev.config,
        options: {
          ...prev.config?.options,
          ...options
        }
      }
    }));
    setPreviewKey(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let savedTile: Tile;
      
      if (tile) {
        // Update existing tile
        const response = await fetch(`/api/templates/${tile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to update tile');
        savedTile = await response.json();
      } else {
        // Create new tile
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to create tile');
        savedTile = await response.json();
        
        // If layoutId is provided, add tile to layout
        if (layoutId) {
          const positions = {
            lg: { x: 0, y: 0, w: 4, h: 3 },
            md: { x: 0, y: 0, w: 4, h: 3 },
            sm: { x: 0, y: 0, w: 3, h: 3 },
            xs: { x: 0, y: 0, w: 2, h: 3 },
          };
          
          await fetch(`/api/layouts/${layoutId}/tiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tileId: savedTile.id,
              positions,
            }),
          });
        }
      }
      
      if (onSave) {
        onSave(savedTile, layoutId);
      }
      
      handleOpenChange(false);
    } catch (error) {
      console.error('Error saving tile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Tile';
      case 'duplicate':
        return 'Duplicate Tile';
      default:
        return 'Create New Tile';
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-6xl h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Configure your tile's data and appearance
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${getTabCount(formData.type)}, 1fr)` }}>
                <TabsTrigger value="basic">Basic</TabsTrigger>
                {formData.type === 'text' && <TabsTrigger value="content">Content</TabsTrigger>}
                {formData.type === 'image' && <TabsTrigger value="image">Image</TabsTrigger>}
                {formData.type === 'smart' && <TabsTrigger value="smart">Smart (Soon)</TabsTrigger>}
                {isChartType(formData.type) && <TabsTrigger value="data">Data</TabsTrigger>}
                {isChartType(formData.type) && <TabsTrigger value="options">Options</TabsTrigger>}
              </TabsList>
              
              <div className="flex-1 overflow-auto mt-4">
                <TabsContent value="basic" className="m-0">
                  <TileForm
                    type={formData.type as TileType}
                    title={formData.title || ''}
                    subtitle={formData.config?.subtitle}
                    content={formData.content}
                    onUpdate={handleBasicUpdate}
                  />
                </TabsContent>
                
                {/* Text tile content */}
                {formData.type === 'text' && (
                  <TabsContent value="content" className="m-0">
                    <div className="space-y-4">
                      <div>
                        <Label>Content</Label>
                        <RichTextEditor
                          content={formData.content?.richText || ''}
                          onChange={(richText) => handleBasicUpdate({
                            content: { richText, format: 'html' }
                          })}
                          placeholder="Enter your formatted text here..."
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}
                
                {/* Image tile content */}
                {formData.type === 'image' && (
                  <TabsContent value="image" className="m-0">
                    <div className="space-y-4">
                      <div>
                        <Label>Image Source</Label>
                        <div className="space-y-3">
                          <ImageUpload
                            value={formData.content?.imageUrl || ''}
                            onChange={(imageUrl) => handleBasicUpdate({
                              content: { 
                                ...formData.content,
                                imageUrl 
                              }
                            })}
                          />
                          <div className="text-center text-sm text-muted-foreground">
                            — OR —
                          </div>
                          <Input
                            value={formData.content?.imageUrl?.startsWith('data:') ? '' : formData.content?.imageUrl || ''}
                            onChange={(e) => handleBasicUpdate({
                              content: { 
                                ...formData.content,
                                imageUrl: e.target.value 
                              }
                            })}
                            placeholder="Enter image URL (https://example.com/image.png)"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="caption">Caption (Optional)</Label>
                        <Input
                          id="caption"
                          value={formData.content?.caption || ''}
                          onChange={(e) => handleBasicUpdate({
                            content: { 
                              ...formData.content,
                              caption: e.target.value 
                            }
                          })}
                          placeholder="Image caption"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alt">Alt Text (Optional)</Label>
                        <Input
                          id="alt"
                          value={formData.content?.alt || ''}
                          onChange={(e) => handleBasicUpdate({
                            content: { 
                              ...formData.content,
                              alt: e.target.value 
                            }
                          })}
                          placeholder="Alternative text for accessibility"
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}
                
                {/* Smart tile placeholder */}
                {formData.type === 'smart' && (
                  <TabsContent value="smart" className="m-0">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Smart tiles with AI-powered insights are coming soon!</p>
                    </div>
                  </TabsContent>
                )}
                
                {/* Chart data and options */}
                {isChartType(formData.type) && (
                  <>
                    <TabsContent value="data" className="m-0">
                      <ChartDataEditor
                        type={formData.type as any}
                        data={formData.config?.options || {}}
                        onUpdate={handleDataUpdate}
                      />
                    </TabsContent>
                    
                    <TabsContent value="options" className="m-0">
                      <ChartOptionsEditor
                        type={formData.type as any}
                        options={formData.config?.options || {}}
                        onUpdate={handleOptionsUpdate}
                      />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="flex-1 border rounded-lg p-4 bg-muted/10">
              {(() => {
                // Preview for text tiles
                if (formData.type === 'text') {
                  return formData.content?.richText ? (
                    <TextTileContent content={formData.content} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Add content to see a preview
                    </div>
                  );
                }
                
                // Preview for image tiles
                if (formData.type === 'image') {
                  return formData.content?.imageUrl ? (
                    <ImageTileContent content={formData.content} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Add an image URL to see a preview
                    </div>
                  );
                }
                
                // Preview for smart tiles
                if (formData.type === 'smart') {
                  return <SmartTileContent content={formData.content} />;
                }
                
                // Preview for chart tiles
                if (isChartType(formData.type)) {
                  return formData.title && formData.config?.options?.series ? (
                    <HighchartsWrapper
                      key={previewKey}
                      type={formData.type as any}
                      config={formData.config}
                      data={formData.data || {}}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Configure your chart to see a preview
                    </div>
                  );
                }
                
                return (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a tile type
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading || !formData.title}
          >
            {loading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TileEditor;