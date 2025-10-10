'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/db/compatibility';
import { Plus, Edit2, Trash2, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Layout } from '@/lib/types/database';

interface LayoutListProps {
  onSelectLayout: (layout: Layout) => void;
  onCreateLayout: () => void;
  onEditLayout: (layout: Layout) => void;
  onDeleteLayout: (layout: Layout) => void;
  onDuplicateLayout: (layout: Layout) => void;
  selectedLayoutId?: string;
}

export function LayoutList({
  onSelectLayout,
  onCreateLayout,
  onEditLayout,
  onDeleteLayout,
  onDuplicateLayout,
  selectedLayoutId,
}: LayoutListProps) {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const response = await fetch('/api/layouts');
      if (!response.ok) throw new Error('Failed to fetch layouts');
      const data = await response.json();
      setLayouts(data);
    } catch (error) {
      console.error('Error fetching layouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading layouts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Layouts</h2>
        <Button onClick={onCreateLayout}>
          <Plus className="w-4 h-4 mr-2" />
          New Layout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layouts.map((layout) => (
          <Card
            key={layout.id}
            className={`cursor-pointer transition-colors ${
              selectedLayoutId === layout.id
                ? 'border-primary'
                : 'hover:border-muted-foreground'
            }`}
            onClick={() => onSelectLayout(layout)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{layout.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {layout.description || 'No description'}
                  </CardDescription>
                </div>
                {layout.isShared && (
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Created {formatDate(layout.createdAt)}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLayout(layout);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateLayout(layout);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayout(layout);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {layouts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">No layouts yet</p>
            <Button onClick={onCreateLayout}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first layout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}