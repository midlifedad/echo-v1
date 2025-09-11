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
  Sparkles,
} from 'lucide-react';
import { AIChartEditor } from './AIChartEditor';
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

const isAIGenerated = (type: string): boolean => {
  return type === 'ai-generated';
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
  const [aiMetadata, setAiMetadata] = useState<any>(null);
  const [showAIEditor, setShowAIEditor] = useState(false);
  
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
    
    if (isAIGenerated(type)) {
      setShowAIEditor(true);
      setActiveTab('content');
    } else {
      setFormData((prev: any) => ({
        ...prev,
        type,
        config: {
          ...prev.config,
          type,
        }
      }));
      setActiveTab(isChartType(type) ? 'data' : 'content');
    }
  };

  const handleAIChartComplete = (chartConfig: any, metadata: any) => {
    // Extract chart type from the config
    const chartType = chartConfig.chart?.type || 'line';
    const title = chartConfig.title?.text || metadata.prompt || 'AI Generated Chart';
    
    // Extract series data and categories from the Highcharts config
    const series = chartConfig.series || [];
    const categories = chartConfig.xAxis?.categories || [];
    
    // Build the data structure for the Data tab
    const chartData: any = {
      categories: categories,
      series: series.map((s: any) => ({
        name: s.name || 'Series',
        data: s.data || [],
        type: s.type || chartType,
      })),
    };
    
    // Update form data with AI-generated config and extracted data
    setFormData((prev: any) => ({
      ...prev,
      type: chartType,
      title: title,
      description: `AI generated from: ${metadata.prompt}`,
      config: {
        type: chartType,
        title: title,
        subtitle: chartConfig.subtitle?.text,
        options: chartConfig,
      },
      data: chartData,
      aiMetadata: metadata,
    }));
    
    setAiMetadata(metadata);
    setShowAIEditor(false);
    setSelectedType(chartType as TileType);
    setActiveTab('data');
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
          
          // Map positions to array format for the API
          const positionsArray = Object.entries(positions).map(([breakpoint, position]) => ({
            breakpoint,
            position
          }));
          
          await fetch(`/api/layouts/${layoutId}/tiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tileId: savedTile.id,
              positions: positionsArray,
              isTemplate: true, // New tiles created here are templates
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
      <DialogContent 
        className="w-full max-w-4xl h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden sm:max-w-4xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription className="sr-only">
            Create or edit a tile for your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-hidden">
          {showAIEditor ? (
            /* AI Generation Interface */
            <div className="px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI Chart Generator</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAIEditor(false);
                    setSelectedType('text');
                  }}
                >
                  Cancel
                </Button>
              </div>
              <AIChartEditor
                onComplete={handleAIChartComplete}
                onCancel={() => {
                  setShowAIEditor(false);
                  setSelectedType('text');
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Type Selector */}
              <div className="px-6 py-3 border-b bg-muted/30">
                <div className="space-y-3">
                  {/* AI Powered Section */}
                  <div>
                    <Label className="text-xs text-primary mb-2 block flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI POWERED
                    </Label>
                    <button
                      onClick={() => handleTypeSelect('ai-generated')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all group"
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div className="text-left flex-1">
                        <div className="font-medium">Generate with AI</div>
                        <div className="text-xs text-muted-foreground">Describe your chart in natural language</div>
                      </div>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-muted/30 px-2 text-muted-foreground">or choose manually</span>
                    </div>
                  </div>
                  
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
                {/* AI Generated Indicator */}
                {aiMetadata && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Generated Content</span>
                  </div>
                )}
                
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
              
              {/* Type-specific content */}
              <div className="min-h-[300px]">
                {selectedType === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={formData.content?.text || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          content: { ...formData.content, text: e.target.value }
                        })}
                        placeholder="Enter your text content here..."
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>
                )}
                
                {selectedType === 'image' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={formData.content?.url || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          content: { ...formData.content, url: e.target.value }
                        })}
                        placeholder="Enter image URL..."
                      />
                    </div>
                    <div>
                      <Label>Alt Text</Label>
                      <Input
                        value={formData.content?.alt || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          content: { ...formData.content, alt: e.target.value }
                        })}
                        placeholder="Image description..."
                      />
                    </div>
                  </div>
                )}
                
                {selectedType === 'smart' && (
                  <div className="text-center py-8 text-muted-foreground">
                    Smart tiles with AI insights coming soon!
                  </div>
                )}
                
                {isChartType(selectedType) && (
                  <Tabs defaultValue="data" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="data">
                        <Database className="w-4 h-4 mr-2" />
                        Data
                      </TabsTrigger>
                      <TabsTrigger value="style">
                        <Palette className="w-4 h-4 mr-2" />
                        Style
                      </TabsTrigger>
                      <TabsTrigger value="settings">
                        <FileText className="w-4 h-4 mr-2" />
                        Settings
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="data" className="mt-4">
                      <ChartDataEditor
                        data={formData.config?.series || []}
                        categories={formData.config?.categories || []}
                        onDataChange={(series, categories) => {
                          setFormData({
                            ...formData,
                            config: {
                              ...formData.config,
                              series,
                              categories
                            }
                          });
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="style" className="mt-4">
                      <ChartOptionsEditorV2
                        type={selectedType}
                        options={formData.config || {}}
                        onOptionsChange={(config) => setFormData({ ...formData, config })}
                      />
                    </TabsContent>
                    
                    <TabsContent value="settings" className="mt-4">
                      <div className="text-center py-8 text-muted-foreground">
                        Advanced settings coming soon!
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
              </div>
            </div>
          )}
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