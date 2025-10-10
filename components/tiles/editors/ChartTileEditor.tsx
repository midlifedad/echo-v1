'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartDataEditor } from '../ChartDataEditor';
import { ChartOptionsEditorV2 } from '../ChartOptionsEditorV2';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Database, Palette, Settings } from 'lucide-react';
import type { TileType } from '@/lib/types';

interface ChartTileEditorProps {
  type: TileType;
  config: any;
  onChange: (config: any) => void;
}

export function ChartTileEditor({ type, config, onChange }: ChartTileEditorProps) {
  const handleDataUpdate = (data: any) => {
    onChange({
      ...config,
      options: {
        ...config?.options,
        ...data
      }
    });
  };

  const handleOptionsUpdate = (options: any) => {
    onChange({
      ...config,
      options: {
        ...config?.options,
        ...options
      }
    });
  };

  const handleSettingsUpdate = (settings: any) => {
    onChange({
      ...config,
      ...settings
    });
  };

  return (
    <Tabs defaultValue="data" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="data" className="gap-2">
          <Database className="h-4 w-4" />
          Data
        </TabsTrigger>
        <TabsTrigger value="style" className="gap-2">
          <Palette className="h-4 w-4" />
          Style
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="data" className="mt-4">
        <ChartDataEditor
          type={type as any}
          data={config?.options || {}}
          onUpdate={handleDataUpdate}
        />
      </TabsContent>

      <TabsContent value="style" className="mt-4">
        <ChartOptionsEditorV2
          type={type as any}
          options={config?.options || {}}
          onUpdate={handleOptionsUpdate}
        />
      </TabsContent>

      <TabsContent value="settings" className="mt-4 space-y-4">
        {/* Chart Title Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-chart-title">Show Chart Title</Label>
            <Switch
              id="show-chart-title"
              checked={config?.options?.title?.text ? true : false}
              onCheckedChange={(checked) => {
                handleOptionsUpdate({
                  title: checked ? { 
                    text: config?.options?.title?.text || 'Chart Title',
                    align: 'center'
                  } : undefined
                });
              }}
            />
          </div>
          {config?.options?.title?.text && (
            <div className="pl-4">
              <Label htmlFor="chart-title-text" className="text-xs text-muted-foreground">Title Text</Label>
              <Input
                id="chart-title-text"
                value={config?.options?.title?.text || ''}
                onChange={(e) => {
                  handleOptionsUpdate({
                    title: {
                      ...config?.options?.title,
                      text: e.target.value
                    }
                  });
                }}
                placeholder="Enter chart title"
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Legend Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-legend">Show Legend</Label>
            <Switch
              id="show-legend"
              checked={config?.options?.legend?.enabled !== false}
              onCheckedChange={(checked) => {
                handleOptionsUpdate({
                  legend: {
                    ...config?.options?.legend,
                    enabled: checked
                  }
                });
              }}
            />
          </div>
          {config?.options?.legend?.enabled !== false && (
            <div className="pl-4 space-y-3">
              <div>
                <Label htmlFor="legend-position" className="text-xs text-muted-foreground">Legend Position</Label>
                <select
                  id="legend-position"
                  value={config?.options?.legend?.align || 'center'}
                  onChange={(e) => {
                    handleOptionsUpdate({
                      legend: {
                        ...config?.options?.legend,
                        align: e.target.value,
                        verticalAlign: config?.options?.legend?.verticalAlign || 'bottom',
                        layout: 'horizontal'
                      }
                    });
                  }}
                  className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <Label htmlFor="legend-vertical" className="text-xs text-muted-foreground">Vertical Position</Label>
                <select
                  id="legend-vertical"
                  value={config?.options?.legend?.verticalAlign || 'bottom'}
                  onChange={(e) => {
                    handleOptionsUpdate({
                      legend: {
                        ...config?.options?.legend,
                        verticalAlign: e.target.value,
                        align: config?.options?.legend?.align || 'center'
                      }
                    });
                  }}
                  className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Axis Labels */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-axis-labels">Show Axis Labels</Label>
            <Switch
              id="show-axis-labels"
              checked={config?.options?.xAxis?.title?.text || config?.options?.yAxis?.title?.text ? true : false}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleOptionsUpdate({
                    xAxis: {
                      ...config?.options?.xAxis,
                      title: { text: 'X Axis' }
                    },
                    yAxis: {
                      ...config?.options?.yAxis,
                      title: { text: 'Y Axis' }
                    }
                  });
                } else {
                  handleOptionsUpdate({
                    xAxis: {
                      ...config?.options?.xAxis,
                      title: undefined
                    },
                    yAxis: {
                      ...config?.options?.yAxis,
                      title: undefined
                    }
                  });
                }
              }}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}