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
import type { ChartType } from '@/lib/types';

interface ChartOptionsEditorProps {
  type: ChartType;
  options: any;
  onUpdate: (options: any) => void;
}

export function ChartOptionsEditor({ type, options, onUpdate }: ChartOptionsEditorProps) {
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
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">General Options</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="legend">Show Legend</Label>
          <Switch
            id="legend"
            checked={options?.legend?.enabled !== false}
            onCheckedChange={(checked) => handleUpdate('legend.enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="tooltip">Show Tooltip</Label>
          <Switch
            id="tooltip"
            checked={options?.tooltip?.enabled !== false}
            onCheckedChange={(checked) => handleUpdate('tooltip.enabled', checked)}
          />
        </div>

        {!isPieChart && !isGaugeChart && (
          <div className="flex items-center justify-between">
            <Label htmlFor="dataLabels">Show Data Labels</Label>
            <Switch
              id="dataLabels"
              checked={options?.plotOptions?.series?.dataLabels?.enabled === true}
              onCheckedChange={(checked) => handleUpdate('plotOptions.series.dataLabels.enabled', checked)}
            />
          </div>
        )}
      </div>

      {hasAxes && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">X-Axis</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="xAxisTitle">Title</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="xAxisRotation">Label Rotation</Label>
              <Input
                id="xAxisRotation"
                type="number"
                value={options?.xAxis?.labels?.rotation || 0}
                onChange={(e) => handleUpdate('xAxis.labels.rotation', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="-90"
                max="90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Y-Axis</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="yAxisTitle">Title</Label>
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

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="yAxisMin">Min Value</Label>
                <Input
                  id="yAxisMin"
                  type="number"
                  value={options?.yAxis?.min || ''}
                  onChange={(e) => handleUpdate('yAxis.min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Auto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yAxisMax">Max Value</Label>
                <Input
                  id="yAxisMax"
                  type="number"
                  value={options?.yAxis?.max || ''}
                  onChange={(e) => handleUpdate('yAxis.max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Auto"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {(type === 'line' || type === 'spline' || type === 'area' || type === 'areaspline') && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Line Options</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="markers">Show Markers</Label>
            <Switch
              id="markers"
              checked={options?.plotOptions?.series?.marker?.enabled !== false}
              onCheckedChange={(checked) => handleUpdate('plotOptions.series.marker.enabled', checked)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lineWidth">Line Width</Label>
            <Input
              id="lineWidth"
              type="number"
              value={options?.plotOptions?.series?.lineWidth || 2}
              onChange={(e) => handleUpdate('plotOptions.series.lineWidth', parseInt(e.target.value) || 2)}
              placeholder="2"
              min="1"
              max="10"
            />
          </div>
        </div>
      )}

      {(type === 'column' || type === 'bar') && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Bar Options</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="stacking">Stacking</Label>
            <Select
              value={options?.plotOptions?.series?.stacking || 'none'}
              onValueChange={(value) => handleUpdate('plotOptions.series.stacking', value === 'none' ? undefined : value)}
            >
              <SelectTrigger id="stacking" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="percent">Percent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="borderRadius">Border Radius</Label>
            <Input
              id="borderRadius"
              type="number"
              value={options?.plotOptions?.series?.borderRadius || 0}
              onChange={(e) => handleUpdate('plotOptions.series.borderRadius', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              max="20"
            />
          </div>
        </div>
      )}

      {isPieChart && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Pie Options</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="pieDataLabels">Show Data Labels</Label>
            <Switch
              id="pieDataLabels"
              checked={options?.plotOptions?.pie?.dataLabels?.enabled !== false}
              onCheckedChange={(checked) => handleUpdate('plotOptions.pie.dataLabels.enabled', checked)}
            />
          </div>

          {type === 'donut' && (
            <div className="grid gap-2">
              <Label htmlFor="innerSize">Inner Size (%)</Label>
              <Input
                id="innerSize"
                type="number"
                value={parseInt(options?.plotOptions?.pie?.innerSize || '50')}
                onChange={(e) => handleUpdate('plotOptions.pie.innerSize', `${e.target.value}%`)}
                placeholder="50"
                min="0"
                max="90"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="startAngle">Start Angle</Label>
            <Input
              id="startAngle"
              type="number"
              value={options?.plotOptions?.pie?.startAngle || 0}
              onChange={(e) => handleUpdate('plotOptions.pie.startAngle', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="-360"
              max="360"
            />
          </div>
        </div>
      )}

      {isGaugeChart && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Gauge Options</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="gaugeMin">Min Value</Label>
              <Input
                id="gaugeMin"
                type="number"
                value={options?.yAxis?.min || 0}
                onChange={(e) => handleUpdate('yAxis.min', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gaugeMax">Max Value</Label>
              <Input
                id="gaugeMax"
                type="number"
                value={options?.yAxis?.max || 100}
                onChange={(e) => handleUpdate('yAxis.max', parseFloat(e.target.value) || 100)}
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Color Stops</Label>
            <div className="text-xs text-muted-foreground">
              Red (0-33%), Yellow (33-66%), Green (66-100%)
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Animation</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="animation">Enable Animation</Label>
          <Switch
            id="animation"
            checked={options?.chart?.animation !== false}
            onCheckedChange={(checked) => handleUpdate('chart.animation', checked)}
          />
        </div>

        {options?.chart?.animation !== false && (
          <div className="grid gap-2">
            <Label htmlFor="animationDuration">Duration (ms)</Label>
            <Input
              id="animationDuration"
              type="number"
              value={options?.chart?.animation?.duration || 1000}
              onChange={(e) => handleUpdate('chart.animation.duration', parseInt(e.target.value) || 1000)}
              placeholder="1000"
              min="0"
              max="5000"
              step="100"
            />
          </div>
        )}
      </div>
    </div>
  );
}