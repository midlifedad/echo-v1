import { useState, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tile } from '@/lib/db/schema';
import ChartPreview from '@/components/charts/ChartPreview';

interface TileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTile: (tile: Tile) => void;
  onCreateNew: () => void;
}

export default function TileSelector({
  isOpen,
  onClose,
  onSelectTile,
  onCreateNew,
}: TileSelectorProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [filteredTiles, setFilteredTiles] = useState<Tile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);

  // Fetch tiles when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchTiles();
      fetchCategories();
    }
  }, [isOpen]);

  // Filter tiles when search or category changes
  useEffect(() => {
    filterTiles();
  }, [tiles, searchTerm, selectedCategory, activeTab]);

  const fetchTiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTiles(data);
    } catch (error) {
      console.error('Failed to fetch tiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/templates/categories');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Categories API returned non-array data:', data);
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const filterTiles = () => {
    let filtered = [...tiles];

    // Tab filtering
    switch (activeTab) {
      case 'templates':
        filtered = filtered.filter(t => t.isTemplate);
        break;
      case 'recent':
        // Sort by created date and take first 10
        filtered = filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 10);
        break;
      case 'popular':
        filtered = filtered.filter(t => t.usageCount > 0)
          .sort((a, b) => b.usageCount - a.usageCount);
        break;
    }

    // Category filtering
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    setFilteredTiles(filtered);
  };

  const handleSelectTile = (tile: Tile) => {
    setSelectedTile(tile);
  };

  const handleConfirmSelection = () => {
    if (selectedTile) {
      onSelectTile(selectedTile);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Tile</DialogTitle>
          <DialogDescription>
            Choose a tile from your library to add to the layout
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Tiles</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 flex-1">
              {/* Filters and Search */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tiles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tiles Grid */}
              <ScrollArea className="flex-1 h-[400px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Loading tiles...</div>
                  </div>
                ) : filteredTiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-muted-foreground mb-4">No tiles found</div>
                    <Button onClick={onCreateNew} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create a new tile
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 p-1">
                    {filteredTiles.map(tile => (
                      <div
                        key={tile.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedTile?.id === tile.id 
                            ? 'border-primary bg-accent' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectTile(tile)}
                      >
                        {/* Tile Preview */}
                        <div className="h-24 rounded-md mb-2 overflow-hidden border border-border">
                          <div className="w-full h-full pointer-events-none">
                            <ChartPreview
                              type={tile.type}
                              config={tile.defaultConfig || tile.config}
                              data={tile.defaultData || tile.data || undefined}
                              className="w-full h-full [&_.highcharts-legend]:hidden [&_.highcharts-credits]:hidden [&_.highcharts-title]:hidden"
                              fallback={
                                tile.thumbnail ? (
                                  <img 
                                    src={tile.thumbnail} 
                                    alt={tile.name || tile.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No preview
                                  </div>
                                )
                              }
                            />
                          </div>
                        </div>
                        
                        {/* Tile Info */}
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {tile.name || tile.title}
                          </h4>
                          {tile.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {tile.description}
                            </p>
                          )}
                          <div className="flex gap-1 flex-wrap">
                            {tile.category && (
                              <Badge variant="secondary" className="text-xs">
                                {tile.category}
                              </Badge>
                            )}
                            {tile.isTemplate && (
                              <Badge variant="outline" className="text-xs">
                                Template
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Tile
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={!selectedTile}
            >
              Add Selected Tile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}