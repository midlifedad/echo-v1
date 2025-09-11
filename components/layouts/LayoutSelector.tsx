'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Layout } from '@/lib/types/database';

interface LayoutSelectorProps {
  selectedLayout: Layout | null;
  onSelectLayout: (layout: Layout) => void;
  onCreateLayout: () => void;
  onManageLayouts: () => void;
  className?: string;
}

export function LayoutSelector({
  selectedLayout,
  onSelectLayout,
  onCreateLayout,
  onManageLayouts,
  className,
}: LayoutSelectorProps) {
  const [open, setOpen] = useState(false);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[280px] justify-between', className)}
        >
          <span className="truncate">
            {selectedLayout 
              ? selectedLayout.name 
              : 'Select a layout...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search layouts..." />
          <CommandList>
            {loading ? (
              <CommandEmpty>Loading layouts...</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>No layout found.</CommandEmpty>
                <CommandGroup heading="Layouts">
                  {layouts.map((layout) => (
                    <CommandItem
                      key={layout.id}
                      value={layout.name}
                      onSelect={() => {
                        onSelectLayout(layout);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedLayout?.id === layout.id 
                            ? 'opacity-100' 
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{layout.name}</div>
                        {layout.description && (
                          <div className="text-xs text-muted-foreground">
                            {layout.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onCreateLayout();
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new layout
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onManageLayouts();
                      setOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage all layouts
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}