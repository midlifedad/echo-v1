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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Type,
  Image,
  LineChart,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  BarChart,
  Gauge,
  ScatterChart,
  Brain,
  MoreHorizontal,
  Palette,
  Database,
  FileText,
  Check,
} from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ImageUpload } from './ImageUpload';
import { ChartDataEditor } from './ChartDataEditor';
import { ChartOptionsEditorV2 } from './ChartOptionsEditorV2';
import type { Tile, CreateTileRequest, UpdateTileRequest } from '@/lib/types/database';
import type { TileType } from '@/lib/types';

interface TileEditorV2Props {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  tile?: Tile | null;
  mode?: 'create' | 'edit' | 'duplicate';
  layoutId?: string;
  onSave?: (tile: any, layoutId?: string) => void;
}

const TILE_TYPES = {
  content: [
    { value: 'text' as TileType, label: 'Text', icon: Type, description: 'Rich formatted text' },
    { value: 'image' as TileType, label: 'Image', icon: Image, description: 'Images with captions' },
    { value: 'smart' as TileType, label: 'Smart', icon: Brain, description: 'AI insights (soon)', disabled: true },
  ],
  charts: [
    { value: 'line' as TileType, label: 'Line', icon: Activity, description: 'Trends over time' },
    { value: 'area' as TileType, label: 'Area', icon: TrendingUp, description: 'Cumulative values' },
    { value: 'column' as TileType, label: 'Column', icon: BarChart3, description: 'Compare categories' },
    { value: 'bar' as TileType, label: 'Bar', icon: BarChart, description: 'Horizontal comparison' },
    { value: 'pie' as TileType, label: 'Pie', icon: PieChart, description: 'Parts of a whole' },
    { value: 'gauge' as TileType, label: 'Gauge', icon: Gauge, description: 'Single metric' },
    { value: 'scatter' as TileType, label: 'Scatter', icon: ScatterChart, description: 'Correlations' },
    { value: 'spline' as TileType, label: 'Spline', icon: Activity, description: 'Smooth trends' },
  ],
};

const isChartType = (type: string): boolean => {
  return TILE_TYPES.charts.some(t => t.value === type);
};

export function TileEditorV2({ 
  open, 
  isOpen,
  onOpenChange,
  onClose, 
  tile,
  mode = 'create',
  layoutId,
  onSave 
}: TileEditorV2Props) {
  const dialogOpen = open ?? isOpen ?? false;
  const handleOpenChange = onOpenChange ?? onClose ?? (() => {});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TileType>('text');
  const [activeTab, setActiveTab] = useState('content');
  
  // Form state
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
        content: tile.content,
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
        content: tile.content,
        dataSource: tile.dataSource,
      };
    }
    
    return {
      type: 'text',
      title: '',
      name: '',
      description: '',
      category: '',
      tags: [],
      isTemplate: false,
      isPublic: false,
      config: {
        type: 'text',
        title: '',
        options: {}
      },
      data: null,
      content: null,
      dataSource: null,
    };
  };
  
  const [formData, setFormData] = useState<any>(getInitialFormData());

  useEffect(() => {
    if (tile) {
      const data = getInitialFormData();
      setFormData(data);
      setSelectedType(data.type);
      setActiveTab(isChartType(data.type) ? 'data' : 'content');
    } else {
      setFormData(getInitialFormData());
      setSelectedType('text');
      setActiveTab('content');
    }
  }, [tile, dialogOpen]);

  const handleTypeSelect = (type: TileType) => {
    setSelectedType(type);
    setFormData((prev: any) => ({
      ...prev,
      type,
      config: {
        ...prev.config,
        type,
      }
    }));
    setActiveTab(isChartType(type) ? 'data' : 'content');
  };

  const handleDataUpdate = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      config: {
        ...prev.config,
        options: {
          ...prev.config?.options,
          ...data
        }
      }
    }));
  };

  const handleOptionsUpdate = (options: any) => {
    setFormData((prev: any) => ({
      ...prev,
      config: {
        ...prev.config,
        options: {
          ...prev.config?.options,
          ...options
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    setLoading(true);
    try {
      let savedTile: Tile;
      
      if (tile) {
        const response = await fetch(`/api/templates/${tile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to update tile');
        savedTile = await response.json();
      } else {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to create tile');
        savedTile = await response.json();
        
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
      case 'edit': return 'Edit Tile';
      case 'duplicate': return 'Duplicate Tile';
      default: return 'Create New Tile';
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-4xl h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden sm:max-w-4xl">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription className="sr-only">
            Create or edit a tile for your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="flex flex-col">
            {/* Type Selector */}
            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="space-y-3">
                {/* Content Types */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">CONTENT TILES</Label>
                  <div className="flex gap-2 flex-wrap">
                    {TILE_TYPES.content.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => !type.disabled && handleTypeSelect(type.value)}
                          disabled={type.disabled}
                          className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all",
                            selectedType === type.value 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-background hover:bg-muted border-input",
                            type.disabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Chart Types */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">CHART TILES</Label>
                  <div className="flex gap-2 flex-wrap">
                    {TILE_TYPES.charts.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => !type.disabled && handleTypeSelect(type.value)}
                          disabled={type.disabled}
                          className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all",
                            selectedType === type.value 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-background hover:bg-muted border-input",
                            type.disabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Configuration */}
            <div className="px-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4 mb-6">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter tile title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this tile"
                    rows={2}
                  />
                </div>
              </div>
              
              <Separator className="mb-4" />
              
              {/* Content/Data/Style Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="data" disabled={!isChartType(selectedType)} className="gap-2">
                    <Database className="h-4 w-4" />
                    Data
                  </TabsTrigger>
                  <TabsTrigger value="style" className="gap-2">
                    <Palette className="h-4 w-4" />
                    Style
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-4 min-h-[300px]">
                  <TabsContent value="content" className="m-0">
                    {selectedType === 'text' && (
                      <RichTextEditor
                        content={formData.content?.richText || ''}
                        onChange={(richText) => setFormData({
                          ...formData,
                          content: { richText, format: 'html' }
                        })}
                        placeholder="Start typing your content..."
                      />
                    )}
                    
                    {selectedType === 'image' && (
                      <div className="space-y-4">
                        <ImageUpload
                          value={formData.content?.imageUrl || ''}
                          onChange={(imageUrl) => setFormData({
                            ...formData,
                            content: { ...formData.content, imageUrl }
                          })}
                        />
                        
                        <Input
                          value={formData.content?.caption || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            content: { ...formData.content, caption: e.target.value }
                          })}
                          placeholder="Image caption (optional)"
                        />
                        
                        <Input
                          value={formData.content?.alt || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            content: { ...formData.content, alt: e.target.value }
                          })}
                          placeholder="Alt text for accessibility (optional)"
                        />
                      </div>
                    )}
                    
                    {selectedType === 'smart' && (
                      <div className="text-center py-8 text-muted-foreground">
                        Smart tiles with AI insights coming soon!
                      </div>
                    )}
                    
                    {isChartType(selectedType) && (
                      <div className="text-muted-foreground">
                        Switch to the Data tab to configure chart content
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="data" className="m-0">
                    {isChartType(selectedType) && (
                      <ChartDataEditor
                        type={selectedType as any}
                        data={formData.config?.options || {}}
                        onUpdate={handleDataUpdate}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="style" className="m-0">
                    {isChartType(selectedType) ? (
                      <ChartOptionsEditorV2
                        type={selectedType as any}
                        options={formData.config?.options || {}}
                        onUpdate={handleOptionsUpdate}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Style options for {selectedType} tiles coming soon
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
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

export default TileEditorV2;