import { NextRequest, NextResponse } from 'next/server';
import { TileTemplateService } from '@/lib/services/tileTemplateService';

// GET /api/templates/categories - Get unique template categories
export async function GET(request: NextRequest) {
  try {
    const categories = await TileTemplateService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch template categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template categories' },
      { status: 500 }
    );
  }
}