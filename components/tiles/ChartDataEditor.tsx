'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Shuffle } from 'lucide-react';
import type { ChartType } from '@/lib/types';
import { generateSampleData } from '@/lib/sampleDataGenerators';

interface ChartDataEditorProps {
  type: ChartType;
  data: any;
  onUpdate: (data: any) => void;
}

export function ChartDataEditor({ type, data, onUpdate }: ChartDataEditorProps) {
  const [series, setSeries] = useState<any[]>(data?.series || []);
  const [categories, setCategories] = useState<string[]>(data?.xAxis?.categories || []);

  useEffect(() => {
    setSeries(data?.series || []);
    setCategories(data?.xAxis?.categories || []);
  }, [data]);

  const handleSeriesUpdate = (index: number, field: string, value: any) => {
    const newSeries = [...series];
    newSeries[index] = { ...newSeries[index], [field]: value };
    setSeries(newSeries);
    updateData(newSeries, categories);
  };

  const handleDataPointUpdate = (seriesIndex: number, pointIndex: number, value: number) => {
    const newSeries = [...series];
    if (!newSeries[seriesIndex].data) {
      newSeries[seriesIndex].data = [];
    }
    newSeries[seriesIndex].data[pointIndex] = value;
    setSeries(newSeries);
    updateData(newSeries, categories);
  };

  const handleCategoryUpdate = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
    updateData(series, newCategories);
  };

  const updateData = (newSeries: any[], newCategories: string[]) => {
    const updates: any = { series: newSeries };
    
    if (needsCategories(type)) {
      updates.xAxis = { categories: newCategories };
    }
    
    onUpdate(updates);
  };

  const addSeries = () => {
    const newSeries = {
      name: `Series ${series.length + 1}`,
      data: needsCategories(type) ? new Array(categories.length || 5).fill(0) : []
    };
    setSeries([...series, newSeries]);
    updateData([...series, newSeries], categories);
  };

  const removeSeries = (index: number) => {
    const newSeries = series.filter((_, i) => i !== index);
    setSeries(newSeries);
    updateData(newSeries, categories);
  };

  const addCategory = () => {
    const newCategories = [...categories, `Category ${categories.length + 1}`];
    const newSeries = series.map(s => ({
      ...s,
      data: [...(s.data || []), 0]
    }));
    setCategories(newCategories);
    setSeries(newSeries);
    updateData(newSeries, newCategories);
  };

  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    const newSeries = series.map(s => ({
      ...s,
      data: s.data?.filter((_: any, i: number) => i !== index) || []
    }));
    setCategories(newCategories);
    setSeries(newSeries);
    updateData(newSeries, newCategories);
  };

  const loadSampleData = () => {
    const sampleData = generateSampleData(type);
    setSeries(sampleData.series);
    setCategories(sampleData.xAxis?.categories || []);
    onUpdate(sampleData);
  };

  const needsCategories = (chartType: ChartType) => {
    return ['line', 'area', 'column', 'bar', 'spline', 'areaspline'].includes(chartType);
  };

  const isPieChart = type === 'pie' || type === 'donut';
  const isGaugeChart = type === 'gauge';

  if (isGaugeChart) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Gauge Value</Label>
          <Button
            type="button"
            onClick={loadSampleData}
            size="sm"
            variant="outline"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Sample Data
          </Button>
        </div>
        
        <div className="grid gap-2">
          <Input
            type="number"
            value={series[0]?.data?.[0] || 0}
            onChange={(e) => handleDataPointUpdate(0, 0, parseFloat(e.target.value) || 0)}
            placeholder="Enter value (0-100)"
            min="0"
            max="100"
          />
          <div className="text-sm text-muted-foreground">
            Enter a value between 0 and 100
          </div>
        </div>
      </div>
    );
  }

  if (isPieChart) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Pie Slices</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={loadSampleData}
              size="sm"
              variant="outline"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Sample
            </Button>
            <Button
              type="button"
              onClick={() => {
                const newData = [...(series[0]?.data || []), { name: `Slice ${(series[0]?.data?.length || 0) + 1}`, y: 10 }];
                handleSeriesUpdate(0, 'data', newData);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slice
            </Button>
          </div>
        </div>
        
        {series[0]?.data?.map((point: any, index: number) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={point.name || ''}
              onChange={(e) => {
                const newData = [...series[0].data];
                newData[index] = { ...newData[index], name: e.target.value };
                handleSeriesUpdate(0, 'data', newData);
              }}
              placeholder="Label"
              className="flex-1"
            />
            <Input
              type="number"
              value={point.y || 0}
              onChange={(e) => {
                const newData = [...series[0].data];
                newData[index] = { ...newData[index], y: parseFloat(e.target.value) || 0 };
                handleSeriesUpdate(0, 'data', newData);
              }}
              placeholder="Value"
              className="w-24"
            />
            <Button
              type="button"
              onClick={() => {
                const newData = series[0].data.filter((_: any, i: number) => i !== index);
                handleSeriesUpdate(0, 'data', newData);
              }}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Data Series</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={loadSampleData}
            size="sm"
            variant="outline"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Sample
          </Button>
          <Button
            type="button"
            onClick={addSeries}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Series
          </Button>
        </div>
      </div>

      {needsCategories(type) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Categories</Label>
            <Button
              type="button"
              onClick={addCategory}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat, index) => (
              <div key={index} className="flex gap-1 items-center">
                <Input
                  value={cat}
                  onChange={(e) => handleCategoryUpdate(index, e.target.value)}
                  className="w-24 h-8 text-xs"
                />
                <Button
                  type="button"
                  onClick={() => removeCategory(index)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {series.map((s, seriesIndex) => (
        <div key={seriesIndex} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Input
              value={s.name || ''}
              onChange={(e) => handleSeriesUpdate(seriesIndex, 'name', e.target.value)}
              placeholder="Series name"
              className="flex-1 mr-2"
            />
            <Button
              type="button"
              onClick={() => removeSeries(seriesIndex)}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {needsCategories(type) ? (
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat, pointIndex) => (
                <div key={pointIndex} className="text-xs">
                  <div className="text-muted-foreground mb-1">{cat}</div>
                  <Input
                    type="number"
                    value={s.data?.[pointIndex] || 0}
                    onChange={(e) => handleDataPointUpdate(seriesIndex, pointIndex, parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Textarea
              value={JSON.stringify(s.data || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleSeriesUpdate(seriesIndex, 'data', parsed);
                } catch {}
              }}
              placeholder="Enter data as JSON array"
              rows={4}
              className="font-mono text-xs"
            />
          )}
        </div>
      ))}
    </div>
  );
}