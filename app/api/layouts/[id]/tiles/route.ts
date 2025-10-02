import { NextRequest, NextResponse } from 'next/server';
import { addCompatibilityFields } from '@/lib/db/compatibility';
import { LayoutService } from '@/lib/services/layoutService';
import { TileInstanceService } from '@/lib/services/tileInstanceService';

// GET /api/layouts/[id]/tiles - Get all tiles for a layout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get tile instances with their positions for this layout
    const instancesWithPositions = await TileInstanceService.getInstancesForLayout(id);
    
    // Transform to the format expected by the frontend
    const tilesWithPositions = instancesWithPositions.map(instance => {
      // Format positions for compatibility
      const positions: Record<string, { position: unknown; isVisible: boolean; inheritanceMode: string }> = {};
      if (instance.positions) {
        Object.entries(instance.positions).forEach(([breakpoint, position]) => {
          positions[breakpoint] = {
            position: position,
            isVisible: true,
            inheritanceMode: 'inherit'
          };
        });
      }
      
      return addCompatibilityFields({
        id: instance.id,
        type: instance.type,
        title: instance.title,
        config: instance.config,
        data: instance.data,
        content: instance.content,
        dataSource: instance.dataSource,
        positions
      });
    });
    
    return NextResponse.json(tilesWithPositions);
  } catch (error) {
    console.error('Failed to fetch layout tiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout tiles' },
      { status: 500 }
    );
  }
}

// POST /api/layouts/[id]/tiles - Add a tile to a layout
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tileId, positions, isTemplate } = body;
    
    if (!tileId || !positions) {
      return NextResponse.json(
        { error: 'tileId and positions are required' },
        { status: 400 }
      );
    }
    
    let instanceId = tileId;
    
    // If tileId refers to a template, create an instance first
    if (isTemplate) {
      const instance = await TileInstanceService.createInstanceFromTemplate(tileId, id, positions);
      instanceId = instance.id;
    } else {
      // For non-template tiles (like imported tiles), we need to get the tile details first
      const tileService = await import('@/lib/services/tileService').then(m => m.TileService);
      const tile = await tileService.getTile(tileId);
      
      if (!tile) {
        return NextResponse.json(
          { error: 'Tile not found' },
          { status: 404 }
        );
      }
      
      // Create an instance directly from the tile data
      const instance = await TileInstanceService.createCustomInstance({
        layoutId: id,
        templateId: null, // No template for imported tiles
        type: tile.type,
        title: tile.title,
        config: tile.config || {},
        data: tile.data || null,
        content: tile.content || null,
        dataSource: tile.dataSource || null,
        displaySettings: null,
      });
      instanceId = instance.id;
    }
    
    await LayoutService.addTileToLayout(id, instanceId, positions);
    
    return NextResponse.json({ success: true, instanceId });
  } catch (error) {
    console.error('Failed to add tile to layout:', error);
    return NextResponse.json(
      { error: 'Failed to add tile to layout' },
      { status: 500 }
    );
  }
}

// PUT /api/layouts/[id]/tiles - Update tile positions in a layout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tileId, breakpoint, position, isVisible, inheritanceMode } = body;
    
    if (!tileId || !breakpoint || !position) {
      return NextResponse.json(
        { error: 'tileId, breakpoint, and position are required' },
        { status: 400 }
      );
    }
    
    await LayoutService.setTilePosition(
      id,
      tileId,
      breakpoint,
      position,
      isVisible ?? true,
      inheritanceMode ?? 'inherit'
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tile position:', error);
    return NextResponse.json(
      { error: 'Failed to update tile position' },
      { status: 500 }
    );
  }
}

// DELETE /api/layouts/[id]/tiles/[tileId] - Remove a tile from a layout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const tileId = searchParams.get('tileId');
    
    if (!tileId) {
      return NextResponse.json(
        { error: 'tileId is required' },
        { status: 400 }
      );
    }
    
    await LayoutService.removeTileFromLayout(id, tileId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove tile from layout:', error);
    return NextResponse.json(
      { error: 'Failed to remove tile from layout' },
      { status: 500 }
    );
  }
}