'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Layout, CreateLayoutRequest, UpdateLayoutRequest } from '@/lib/types/database';

interface LayoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout?: Layout | null;
  onSubmit: (data: CreateLayoutRequest | UpdateLayoutRequest) => Promise<void>;
}

export function LayoutForm({ open, onOpenChange, layout, onSubmit }: LayoutFormProps) {
  const [formData, setFormData] = useState<CreateLayoutRequest | UpdateLayoutRequest>({
    name: layout?.name || '',
    description: layout?.description || '',
    isShared: layout?.isShared || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      setFormData({ name: '', description: '', isShared: false });
    } catch (error) {
      console.error('Error submitting layout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{layout ? 'Edit Layout' : 'Create New Layout'}</DialogTitle>
          <DialogDescription>
            {layout 
              ? 'Update the layout details below.' 
              : 'Create a new layout to organize your dashboard tiles.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Dashboard"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of this layout..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="shared"
                checked={formData.isShared}
                onCheckedChange={(checked) => setFormData({ ...formData, isShared: checked })}
              />
              <Label htmlFor="shared" className="cursor-pointer">
                Share this layout with others
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? 'Saving...' : layout ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}