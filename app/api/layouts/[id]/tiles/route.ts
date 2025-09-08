import { NextRequest, NextResponse } from 'next/server';
import { LayoutService } from '@/lib/services/layoutService';
import { TileService } from '@/lib/services/tileService';

// GET /api/layouts/[id]/tiles - Get all tiles for a layout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get layout tiles with positions
    const layoutTiles = await LayoutService.getLayoutTiles(id);
    
    // Get actual tile data
    const tiles = await TileService.getTilesForLayout(id);
    
    // Combine tile data with position data
    const tilesWithPositions = tiles.map(tile => {
      const positions: any = {};
      layoutTiles
        .filter(lt => lt.tileId === tile.id)
        .forEach(lt => {
          positions[lt.breakpoint] = {
            position: lt.position,
            isVisible: lt.isVisible,
            inheritanceMode: lt.inheritanceMode
          };
        });
      
      return {
        ...tile,
        positions
      };
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
    const { tileId, positions } = body;
    
    if (!tileId || !positions) {
      return NextResponse.json(
        { error: 'tileId and positions are required' },
        { status: 400 }
      );
    }
    
    await LayoutService.addTileToLayout(id, tileId, positions);
    
    return NextResponse.json({ success: true });
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