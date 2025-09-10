import { MoreVertical, Edit, Copy, Trash, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tile } from '@/lib/db/schema';
import ChartPreview from '@/components/charts/ChartPreview';

interface TileCardProps {
  tile: Tile;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export default function TileCard({
  tile,
  viewMode,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: TileCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-md flex overflow-hidden">
            <ChartPreview
              type={tile.type}
              config={tile.defaultConfig || tile.config}
              data={tile.defaultData || tile.data || undefined}
              className="flex-1 [&_.highcharts-legend]:hidden [&_.highcharts-credits]:hidden"
              fallback={
                tile.thumbnail ? (
                  <img src={tile.thumbnail} alt={tile.name || tile.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs border border-border rounded-md">No preview</div>
                )
              }
            />
          </div>
          <div>
            <h3 className="font-medium">{tile.name || tile.title}</h3>
            {tile.description && (
              <p className="text-sm text-muted-foreground">{tile.description}</p>
            )}
            <div className="flex gap-2 mt-2">
              {tile.category && <Badge variant="secondary">{tile.category}</Badge>}
              {tile.isTemplate && <Badge variant="outline">Template</Badge>}
              {tile.isPublic && <Badge variant="outline">Public</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleFavorite}>
            <Heart className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow !gap-0 !py-0 flex flex-col min-h-[320px]">
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {tile.name || tile.title}
            </CardTitle>
            {tile.description && (
              <CardDescription className="text-xs line-clamp-2">
                {tile.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-3 overflow-hidden min-h-0 flex">
        <div className="flex-1 flex">
          <ChartPreview
            type={tile.type}
            config={tile.defaultConfig || tile.config}
            data={tile.defaultData || tile.data || undefined}
            className="flex-1"
            fallback={
              tile.thumbnail ? (
                <img 
                  src={tile.thumbnail} 
                  alt={tile.name || tile.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No preview</div>
              )
            }
          />
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-3 pt-0">
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
          {tile.usageCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              {tile.usageCount}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}