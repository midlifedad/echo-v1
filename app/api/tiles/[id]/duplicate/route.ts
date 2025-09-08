import { NextRequest, NextResponse } from 'next/server';
import { TileService } from '@/lib/services/tileService';

// POST /api/tiles/[id]/duplicate - Duplicate a tile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const newName = body.name;
    
    const duplicatedTile = await TileService.duplicateTile(id, newName);
    
    if (!duplicatedTile) {
      return NextResponse.json(
        { error: 'Original tile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(duplicatedTile, { status: 201 });
  } catch (error) {
    console.error('Failed to duplicate tile:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate tile' },
      { status: 500 }
    );
  }
}