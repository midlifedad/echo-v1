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
import type { TileType } from '@/lib/types';
import { RichTextEditor } from './RichTextEditor';

const TILE_TYPES: { value: TileType; label: string; description: string; category: 'content' | 'chart' }[] = [
  // Content tiles
  { value: 'text', label: 'Text', description: 'Rich formatted text content', category: 'content' },
  { value: 'image', label: 'Image', description: 'Display an image with optional caption', category: 'content' },
  { value: 'smart', label: 'Smart Tile', description: 'AI-powered insights (coming soon)', category: 'content' },
  // Chart tiles
  { value: 'line', label: 'Line Chart', description: 'Show trends over time', category: 'chart' },
  { value: 'area', label: 'Area Chart', description: 'Show cumulative values over time', category: 'chart' },
  { value: 'column', label: 'Column Chart', description: 'Compare values across categories', category: 'chart' },
  { value: 'bar', label: 'Bar Chart', description: 'Horizontal comparison of values', category: 'chart' },
  { value: 'pie', label: 'Pie Chart', description: 'Show parts of a whole', category: 'chart' },
  { value: 'scatter', label: 'Scatter Plot', description: 'Show correlation between variables', category: 'chart' },
  { value: 'gauge', label: 'Gauge Chart', description: 'Display a single metric', category: 'chart' },
  { value: 'spline', label: 'Spline Chart', description: 'Smooth line chart', category: 'chart' },
  { value: 'areaspline', label: 'Area Spline', description: 'Smooth area chart', category: 'chart' },
];

interface TileFormProps {
  type: TileType;
  title: string;
  subtitle?: string;
  content?: any;
  onUpdate: (updates: {
    type?: TileType;
    title?: string;
    config?: {
      subtitle?: string;
    };
    content?: any;
  }) => void;
}

export function TileForm({ type, title, subtitle, content, onUpdate }: TileFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="type">Tile Type</Label>
        <Select value={type} onValueChange={(value) => onUpdate({ type: value as TileType })}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="font-semibold text-xs text-muted-foreground px-2 py-1">Content Tiles</div>
            {TILE_TYPES.filter(t => t.category === 'content').map((tileType) => (
              <SelectItem key={tileType.value} value={tileType.value}>
                <div>
                  <div className="font-medium">{tileType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {tileType.description}
                  </div>
                </div>
              </SelectItem>
            ))}
            <div className="font-semibold text-xs text-muted-foreground px-2 py-1 mt-2">Chart Tiles</div>
            {TILE_TYPES.filter(t => t.category === 'chart').map((tileType) => (
              <SelectItem key={tileType.value} value={tileType.value}>
                <div>
                  <div className="font-medium">{tileType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {tileType.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      {/* Only show subtitle for chart types */}
      {TILE_TYPES.find(t => t.value === type)?.category === 'chart' && (
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
      )}

      <div className="p-3 bg-muted/50 rounded-lg text-sm">
        <p className="font-medium mb-1">Selected: {TILE_TYPES.find(ct => ct.value === type)?.label}</p>
        <p className="text-muted-foreground">
          {TILE_TYPES.find(ct => ct.value === type)?.description}
        </p>
      </div>
    </div>
  );
}