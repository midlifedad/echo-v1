'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ChartType } from '@/lib/types';

interface ChartOptionsEditorV2Props {
  type: ChartType;
  options: any;
  onUpdate: (options: any) => void;
}

export function ChartOptionsEditorV2({ type, options, onUpdate }: ChartOptionsEditorV2Props) {
  const handleUpdate = (path: string, value: any) => {
    const keys = path.split('.');
    const newOptions = { ...options };
    let current = newOptions;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onUpdate(newOptions);
  };

  const isGaugeChart = type === 'gauge';
  const isPieChart = type === 'pie' || type === 'donut';
  const hasAxes = ['line', 'area', 'column', 'bar', 'spline', 'areaspline', 'scatter'].includes(type);

  return (
    <Tabs defaultValue="display" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="display">Display</TabsTrigger>
        <TabsTrigger value="behavior">Behavior</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      
      <TabsContent value="display" className="space-y-4 mt-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Title & Labels</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTitle">Show Title in Chart</Label>
              <Switch
                id="showTitle"
                checked={options?.title?.text !== undefined}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    handleUpdate('title', null);
                  } else {
                    handleUpdate('title.text', '');
                  }
                }}
              />
            </div>
            
            {options?.title?.text !== undefined && (
              <div className="ml-6 space-y-2">
                <Select
                  value={options?.title?.align || 'center'}
                  onValueChange={(value) => handleUpdate('title.align', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Legend</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="legend">Show Legend</Label>
              <Switch
                id="legend"
                checked={options?.legend?.enabled !== false}
                onCheckedChange={(checked) => handleUpdate('legend.enabled', checked)}
              />
            </div>
            
            {options?.legend?.enabled !== false && (
              <div className="ml-6 space-y-3">
                <div>
                  <Label htmlFor="legendPosition">Position</Label>
                  <Select
                    value={options?.legend?.align || 'center'}
                    onValueChange={(value) => handleUpdate('legend.align', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="legendLayout">Layout</Label>
                  <Select
                    value={options?.legend?.layout || 'horizontal'}
                    onValueChange={(value) => handleUpdate('legend.layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
          {!isPieChart && !isGaugeChart && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Data Labels</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataLabels">Show Values on Chart</Label>
                  <Switch
                    id="dataLabels"
                    checked={options?.plotOptions?.series?.dataLabels?.enabled === true}
                    onCheckedChange={(checked) => handleUpdate('plotOptions.series.dataLabels.enabled', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="behavior" className="space-y-4 mt-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Interactivity</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="tooltip">Show Tooltip on Hover</Label>
            <Switch
              id="tooltip"
              checked={options?.tooltip?.enabled !== false}
              onCheckedChange={(checked) => handleUpdate('tooltip.enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="animation">Enable Animations</Label>
            <Switch
              id="animation"
              checked={options?.chart?.animation !== false}
              onCheckedChange={(checked) => handleUpdate('chart.animation', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="exporting">Allow Export/Download</Label>
            <Switch
              id="exporting"
              checked={options?.exporting?.enabled !== false}
              onCheckedChange={(checked) => handleUpdate('exporting.enabled', checked)}
            />
          </div>
          
          {hasAxes && (
            <>
              <Separator />
              
              <h3 className="text-sm font-medium">Zoom & Pan</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="zoomType">Enable Zoom</Label>
                <Select
                  value={options?.chart?.zoomType || 'none'}
                  onValueChange={(value) => handleUpdate('chart.zoomType', value === 'none' ? null : value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="x">Horizontal</SelectItem>
                    <SelectItem value="y">Vertical</SelectItem>
                    <SelectItem value="xy">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-4 mt-4">
        {hasAxes && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">X-Axis</h3>
            
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="xAxisTitle">Axis Title</Label>
                <Input
                  id="xAxisTitle"
                  value={options?.xAxis?.title?.text || ''}
                  onChange={(e) => handleUpdate('xAxis.title.text', e.target.value)}
                  placeholder="X-Axis Title"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="xAxisLabels">Show Labels</Label>
                <Switch
                  id="xAxisLabels"
                  checked={options?.xAxis?.labels?.enabled !== false}
                  onCheckedChange={(checked) => handleUpdate('xAxis.labels.enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="xAxisGrid">Show Grid Lines</Label>
                <Switch
                  id="xAxisGrid"
                  checked={options?.xAxis?.gridLineWidth !== 0}
                  onCheckedChange={(checked) => handleUpdate('xAxis.gridLineWidth', checked ? 1 : 0)}
                />
              </div>
            </div>
            
            <Separator />
            
            <h3 className="text-sm font-medium">Y-Axis</h3>
            
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="yAxisTitle">Axis Title</Label>
                <Input
                  id="yAxisTitle"
                  value={options?.yAxis?.title?.text || ''}
                  onChange={(e) => handleUpdate('yAxis.title.text', e.target.value)}
                  placeholder="Y-Axis Title"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="yAxisLabels">Show Labels</Label>
                <Switch
                  id="yAxisLabels"
                  checked={options?.yAxis?.labels?.enabled !== false}
                  onCheckedChange={(checked) => handleUpdate('yAxis.labels.enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="yAxisGrid">Show Grid Lines</Label>
                <Switch
                  id="yAxisGrid"
                  checked={options?.yAxis?.gridLineWidth !== 0}
                  onCheckedChange={(checked) => handleUpdate('yAxis.gridLineWidth', checked ? 1 : 0)}
                />
              </div>
            </div>
          </div>
        )}
        
        {isPieChart && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Pie Chart Options</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="innerSize">Inner Size (Donut)</Label>
              <Input
                id="innerSize"
                type="number"
                value={options?.plotOptions?.pie?.innerSize || 0}
                onChange={(e) => handleUpdate('plotOptions.pie.innerSize', `${e.target.value}%`)}
                placeholder="0"
                min="0"
                max="90"
              />
              <span className="text-xs text-muted-foreground">
                Set to 0 for pie chart, &gt;0 for donut chart
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showInLegend">Show in Legend</Label>
              <Switch
                id="showInLegend"
                checked={options?.plotOptions?.pie?.showInLegend !== false}
                onCheckedChange={(checked) => handleUpdate('plotOptions.pie.showInLegend', checked)}
              />
            </div>
          </div>
        )}
        
        {isGaugeChart && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Gauge Options</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="gaugeMin">Minimum Value</Label>
              <Input
                id="gaugeMin"
                type="number"
                value={options?.yAxis?.min || 0}
                onChange={(e) => handleUpdate('yAxis.min', parseFloat(e.target.value))}
                placeholder="0"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="gaugeMax">Maximum Value</Label>
              <Input
                id="gaugeMax"
                type="number"
                value={options?.yAxis?.max || 100}
                onChange={(e) => handleUpdate('yAxis.max', parseFloat(e.target.value))}
                placeholder="100"
              />
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Colors</h3>
          
          <div>
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select
              value={options?.colors ? 'custom' : 'default'}
              onValueChange={(value) => {
                if (value === 'default') {
                  handleUpdate('colors', null);
                } else if (value === 'blue') {
                  handleUpdate('colors', ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']);
                } else if (value === 'green') {
                  handleUpdate('colors', ['#10b981', '#34d399', '#6ee7b7', '#d1fae5']);
                } else if (value === 'purple') {
                  handleUpdate('colors', ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe']);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="blue">Blue Theme</SelectItem>
                <SelectItem value="green">Green Theme</SelectItem>
                <SelectItem value="purple">Purple Theme</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}