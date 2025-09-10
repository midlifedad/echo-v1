import { NextRequest, NextResponse } from 'next/server';
import { TileService } from '@/lib/services/tileService';

// GET /api/tiles - List tiles with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const layoutId = searchParams.get('layoutId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isTemplate = searchParams.get('isTemplate');
    const isPublic = searchParams.get('isPublic');
    const ownerId = searchParams.get('ownerId');
    const search = searchParams.get('search');
    const favorites = searchParams.get('favorites');
    const popular = searchParams.get('popular');

    let tiles;
    
    // Special queries
    if (layoutId) {
      tiles = await TileService.getTilesForLayout(layoutId);
    } else if (favorites === 'true') {
      // For now, use a default user ID - in production, get from auth
      const userId = ownerId || 'default-user';
      tiles = await TileService.getUserFavorites(userId);
    } else if (popular === 'true') {
      const limit = parseInt(searchParams.get('limit') || '10');
      tiles = await TileService.getPopularTiles(limit);
    } else if (type && !category && !search) {
      // Simple type filter
      tiles = await TileService.getTilesByType(type);
    } else {
      // Complex filtering
      const filters: any = {};
      if (category) filters.category = category;
      if (isTemplate !== null) filters.isTemplate = isTemplate === 'true';
      if (isPublic !== null) filters.isPublic = isPublic === 'true';
      if (ownerId) filters.ownerId = ownerId;
      if (search) filters.search = search;
      
      tiles = Object.keys(filters).length > 0 
        ? await TileService.listTilesWithFilters(filters)
        : await TileService.listTiles();
    }

    return NextResponse.json(tiles);
  } catch (error) {
    console.error('Failed to fetch tiles:', error);
    // Return empty array instead of error for better resilience
    return NextResponse.json([]);
  }
}

// POST /api/tiles - Create a new tile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Set default ownerId if not provided - in production, get from auth
    if (!body.ownerId) {
      body.ownerId = 'default-user';
    }
    
    const tile = await TileService.createTile(body);
    return NextResponse.json(tile, { status: 201 });
  } catch (error) {
    console.error('Failed to create tile:', error);
    return NextResponse.json(
      { error: 'Failed to create tile' },
      { status: 500 }
    );
  }
}