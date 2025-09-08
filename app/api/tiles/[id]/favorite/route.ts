import { NextRequest, NextResponse } from 'next/server';
import { TileService } from '@/lib/services/tileService';

// POST /api/tiles/[id]/favorite - Toggle favorite status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // In production, get userId from auth
    const userId = body.userId || 'default-user';
    
    const result = await TileService.toggleFavorite(userId, id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}