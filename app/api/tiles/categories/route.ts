import { NextRequest, NextResponse } from 'next/server';
import { TileService } from '@/lib/services/tileService';

// GET /api/tiles/categories - Get all tile categories
export async function GET(request: NextRequest) {
  try {
    const categories = await TileService.getCategories();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Return empty array instead of error for better resilience
    return NextResponse.json([]);
  }
}