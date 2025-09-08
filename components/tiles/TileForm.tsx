'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChartType } from '@/lib/types';

const CHART_TYPES: { value: ChartType; label: string; description: string }[] = [
  { value: 'line', label: 'Line Chart', description: 'Show trends over time' },
  { value: 'area', label: 'Area Chart', description: 'Show cumulative values over time' },
  { value: 'column', label: 'Column Chart', description: 'Compare values across categories' },
  { value: 'bar', label: 'Bar Chart', description: 'Horizontal comparison of values' },
  { value: 'pie', label: 'Pie Chart', description: 'Show parts of a whole' },
  { value: 'scatter', label: 'Scatter Plot', description: 'Show correlation between variables' },
  { value: 'gauge', label: 'Gauge Chart', description: 'Display a single metric' },
  { value: 'spline', label: 'Spline Chart', description: 'Smooth line chart' },
  { value: 'areaspline', label: 'Area Spline', description: 'Smooth area chart' },
];

interface TileFormProps {
  type: ChartType;
  title: string;
  subtitle?: string;
  onUpdate: (updates: {
    type?: ChartType;
    title?: string;
    config?: {
      subtitle?: string;
    };
  }) => void;
}

export function TileForm({ type, title, subtitle, onUpdate }: TileFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter tile title"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          value={subtitle || ''}
          onChange={(e) => onUpdate({ 
            config: { subtitle: e.target.value || undefined } 
          })}
          placeholder="Enter subtitle"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="type">Chart Type</Label>
        <Select value={type} onValueChange={(value) => onUpdate({ type: value as ChartType })}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHART_TYPES.map((chartType) => (
              <SelectItem key={chartType.value} value={chartType.value}>
                <div>
                  <div className="font-medium">{chartType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {chartType.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg text-sm">
        <p className="font-medium mb-1">Selected: {CHART_TYPES.find(ct => ct.value === type)?.label}</p>
        <p className="text-muted-foreground">
          {CHART_TYPES.find(ct => ct.value === type)?.description}
        </p>
      </div>
    </div>
  );
}