import { NextRequest, NextResponse } from 'next/server';
import { LayoutService } from '@/lib/services/layoutService';

// GET /api/layouts - List all layouts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get('ownerId');
    const isShared = searchParams.get('isShared');

    const filters = {
      ...(ownerId && { ownerId }),
      ...(isShared !== null && { isShared: isShared === 'true' }),
    };

    const layouts = await LayoutService.listLayouts(filters);
    return NextResponse.json(layouts);
  } catch (error) {
    console.error('Failed to fetch layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layouts' },
      { status: 500 }
    );
  }
}

// POST /api/layouts - Create a new layout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const layout = await LayoutService.createLayout(body);
    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    console.error('Failed to create layout:', error);
    return NextResponse.json(
      { error: 'Failed to create layout' },
      { status: 500 }
    );
  }
}