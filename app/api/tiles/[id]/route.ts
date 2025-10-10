import { NextRequest, NextResponse } from 'next/server';
import { TileService } from '@/lib/services/tileService';

// GET /api/tiles/[id] - Get a specific tile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tile = await TileService.getTile(id);
    
    if (!tile) {
      return NextResponse.json(
        { error: 'Tile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tile);
  } catch (error) {
    console.error('Failed to fetch tile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tile' },
      { status: 500 }
    );
  }
}

// PUT /api/tiles/[id] - Update a tile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tile = await TileService.updateTile(id, body);
    
    if (!tile) {
      return NextResponse.json(
        { error: 'Tile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tile);
  } catch (error) {
    console.error('Failed to update tile:', error);
    return NextResponse.json(
      { error: 'Failed to update tile' },
      { status: 500 }
    );
  }
}

// DELETE /api/tiles/[id] - Delete a tile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await TileService.deleteTile(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Tile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete tile:', error);
    return NextResponse.json(
      { error: 'Failed to delete tile' },
      { status: 500 }
    );
  }
}