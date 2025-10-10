import { NextRequest, NextResponse } from 'next/server';
import { TileTemplateService } from '@/lib/services/tileTemplateService';

// POST /api/templates/[id]/favorite - Toggle favorite status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    const isFavorite = await TileTemplateService.toggleFavorite(params.id, userId);
    
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}