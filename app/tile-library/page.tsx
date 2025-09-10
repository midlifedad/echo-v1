'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3X3, List } from 'lucide-react';
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
import PageHeader from '@/components/layout/PageHeader';
import TileCard from '@/components/tiles/TileCard';
import TileEditorV2 from '@/components/tiles/TileEditorV2';
import { Tile } from '@/lib/db/schema';

export default function TileLibraryPage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [filteredTiles, setFilteredTiles] = useState<Tile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Fetch tiles
  useEffect(() => {
    fetchTiles();
    fetchCategories();
  }, []);

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
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const filterTiles = () => {
    let filtered = [...tiles];

    // Tab filtering
    switch (activeTab) {
      case 'templates':
        filtered = filtered.filter(t => t.isTemplate);
        break;
      case 'favorites':
        // This would need user context in production
        filtered = filtered.filter(t => t.isPublic);
        break;
      case 'my-tiles':
        filtered = filtered.filter(t => t.ownerId === 'default-user' || t.ownerId === 'system');
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

  const handleCreateTile = () => {
    setSelectedTile(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleEditTile = (tile: Tile) => {
    setSelectedTile(tile);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleDuplicateTile = async (tile: Tile) => {
    try {
      const response = await fetch(`/api/templates/${tile.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${tile.name} (Copy)` }),
      });

      if (response.ok) {
        await fetchTiles();
      }
    } catch (error) {
      console.error('Failed to duplicate tile:', error);
    }
  };

  const handleDeleteTile = async (tile: Tile) => {
    if (!confirm('Are you sure you want to delete this tile?')) return;

    try {
      const response = await fetch(`/api/templates/${tile.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTiles();
      }
    } catch (error) {
      console.error('Failed to delete tile:', error);
    }
  };

  const handleToggleFavorite = async (tile: Tile) => {
    try {
      const response = await fetch(`/api/templates/${tile.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default-user' }),
      });

      if (response.ok) {
        // In a real app, update the UI to reflect favorite status
        console.log('Favorite toggled');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleSaveTile = async (tileData: any) => {
    // The TileEditorV2 component already handles the API call
    // This callback is just for refreshing the list after save
    await fetchTiles();
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tile Library"
        subtitle="Manage and organize your dashboard tiles"
        actions={
          <Button onClick={handleCreateTile}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tile
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tiles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="my-tiles">My Tiles</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
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
                {categories.filter(category => category).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1 border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tiles Grid/List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-muted-foreground">Loading tiles...</div>
            </div>
          ) : filteredTiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-muted-foreground mb-4">No tiles found</div>
              <Button onClick={handleCreateTile} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create your first tile
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
            }>
              {filteredTiles.map(tile => (
                <TileCard
                  key={tile.id}
                  tile={tile}
                  viewMode={viewMode}
                  onEdit={() => handleEditTile(tile)}
                  onDuplicate={() => handleDuplicateTile(tile)}
                  onDelete={() => handleDeleteTile(tile)}
                  onToggleFavorite={() => handleToggleFavorite(tile)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tile Editor Dialog */}
      {isEditorOpen && (
        <TileEditorV2
          tile={selectedTile}
          mode={editorMode}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveTile}
        />
      )}
    </div>
  );
}