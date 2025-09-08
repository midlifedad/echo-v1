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
import type { ChartType } from '@/lib/types';

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
        dataSource: tile.dataSource,
      });
    } else {
      setFormData({
        type: 'line',
        title: '',
        config: {
          type: 'line',
          title: '',
          options: {}
        },
        data: null,
        dataSource: null,
      });
    }
    setActiveTab('basic');
  }, [tile, open]);

  const handleBasicUpdate = (updates: Partial<CreateTileRequest>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
      config: {
        ...prev.config,
        type: updates.type || prev.type || 'line',
        title: updates.title || prev.title || '',
        subtitle: updates.config?.subtitle,
      }
    }));
    setPreviewKey(prev => prev + 1);
  };

  const handleDataUpdate = (data: any) => {
    setFormData(prev => ({
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
    setFormData(prev => ({
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
        const response = await fetch(`/api/tiles/${tile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) throw new Error('Failed to update tile');
        savedTile = await response.json();
      } else {
        // Create new tile
        const response = await fetch('/api/tiles', {
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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Configure your tile's data and appearance
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-auto mt-4">
                <TabsContent value="basic" className="m-0">
                  <TileForm
                    type={formData.type as ChartType}
                    title={formData.title || ''}
                    subtitle={formData.config?.subtitle}
                    onUpdate={handleBasicUpdate}
                  />
                </TabsContent>
                
                <TabsContent value="data" className="m-0">
                  <ChartDataEditor
                    type={formData.type as ChartType}
                    data={formData.config?.options || {}}
                    onUpdate={handleDataUpdate}
                  />
                </TabsContent>
                
                <TabsContent value="options" className="m-0">
                  <ChartOptionsEditor
                    type={formData.type as ChartType}
                    options={formData.config?.options || {}}
                    onUpdate={handleOptionsUpdate}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="flex-1 border rounded-lg p-4 bg-muted/10">
              {formData.title && formData.config?.options?.series ? (
                <HighchartsWrapper
                  key={previewKey}
                  type={formData.type as ChartType}
                  config={formData.config}
                  data={formData.data || {}}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Configure your tile to see a preview
                </div>
              )}
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