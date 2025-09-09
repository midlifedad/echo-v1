import { useState, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, Plus, FileText, Image, Brain, BarChart3 } from 'lucide-react';
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
import { TileTemplate } from '@/lib/types/database';
import ChartPreview from '@/components/charts/ChartPreview';
import { cn } from '@/lib/utils';

interface TileTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TileTemplate) => void;
  onCreateNew: () => void;
  layoutId: string;
}

const TileTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'text':
      return <FileText className="h-12 w-12 text-muted-foreground" />;
    case 'image':
      return <Image className="h-12 w-12 text-muted-foreground" />;
    case 'smart':
      return <Brain className="h-12 w-12 text-muted-foreground" />;
    default:
      return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
  }
};

export default function TileTemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateNew,
  layoutId,
}: TileTemplateSelectorProps) {
  const [templates, setTemplates] = useState<TileTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TileTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate | null>(null);

  // Fetch templates when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchCategories();
    }
  }, [isOpen]);

  // Filter templates when search or category changes
  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, activeTab]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
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

  const filterTemplates = () => {
    let filtered = [...templates];

    // Tab filtering
    switch (activeTab) {
      case 'charts':
        filtered = filtered.filter(t => t.type === 'chart');
        break;
      case 'text':
        filtered = filtered.filter(t => t.type === 'text');
        break;
      case 'image':
        filtered = filtered.filter(t => t.type === 'image');
        break;
      case 'smart':
        filtered = filtered.filter(t => t.type === 'smart');
        break;
      case 'favorites':
        filtered = filtered.filter(t => t.isFavorite);
        break;
      case 'recent':
        // Sort by created date and take first 10
        filtered = filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 10);
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
        t.name.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = (template: TileTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = async () => {
    if (selectedTemplate) {
      try {
        // Create an instance from the template
        const response = await fetch('/api/instances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            layoutId,
            title: selectedTemplate.name,
          }),
        });

        if (response.ok) {
          const instance = await response.json();
          onSelectTemplate(selectedTemplate);
          onClose();
        }
      } catch (error) {
        console.error('Failed to create instance:', error);
      }
    }
  };

  const renderTemplatePreview = (template: TileTemplate) => {
    if (template.type === 'chart') {
      return (
        <ChartPreview
          type={template.defaultConfig?.chartType as string || 'line'}
          config={template.defaultConfig}
          data={template.defaultData}
          className="w-full h-full [&_.highcharts-legend]:hidden [&_.highcharts-credits]:hidden [&_.highcharts-title]:hidden"
          fallback={
            template.thumbnail ? (
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TileTypeIcon type={template.type} />
              </div>
            )
          }
        />
      );
    }

    if (template.type === 'text' && template.content) {
      const content = template.content as { html?: string; plainText?: string };
      return (
        <div className="p-2 text-xs line-clamp-4">
          {content.plainText || 'Text content'}
        </div>
      );
    }

    if (template.type === 'image' && template.content) {
      const content = template.content as { url?: string; caption?: string };
      if (content.url) {
        return (
          <img 
            src={content.url} 
            alt={content.caption || template.name}
            className="w-full h-full object-cover"
          />
        );
      }
    }

    // Default icon preview
    return (
      <div className="w-full h-full flex items-center justify-center">
        <TileTypeIcon type={template.type} />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Tile Template</DialogTitle>
          <DialogDescription>
            Choose a template to create a new tile instance in your layout
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="smart">Smart</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 flex-1 overflow-hidden">
              {/* Filters and Search */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
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

              {/* Templates Grid */}
              <ScrollArea className="flex-1 h-[calc(100%-80px)]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Loading templates...</div>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-muted-foreground mb-4">No templates found</div>
                    <Button onClick={onCreateNew} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create a new template
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 p-1">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className={cn(
                          "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                          selectedTemplate?.id === template.id 
                            ? "border-primary bg-accent" 
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        {/* Template Preview */}
                        <div className="h-32 rounded-md mb-2 overflow-hidden border border-border bg-background">
                          <div className="w-full h-full pointer-events-none">
                            {renderTemplatePreview(template)}
                          </div>
                        </div>
                        
                        {/* Template Info */}
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {template.name}
                          </h4>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {template.type}
                            </Badge>
                            {template.category && (
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            )}
                            {template.isFavorite && (
                              <Badge variant="default" className="text-xs">
                                ★
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
            Create New Template
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={!selectedTemplate}
            >
              Add to Layout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}