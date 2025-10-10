import { NextRequest, NextResponse } from 'next/server';
import { LayoutService } from '@/lib/services/layoutService';

// GET /api/layouts/[id] - Get a specific layout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const layout = await LayoutService.getLayout(id);
    
    if (!layout) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(layout);
  } catch (error) {
    console.error('Failed to fetch layout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout' },
      { status: 500 }
    );
  }
}

// PUT /api/layouts/[id] - Update a layout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const layout = await LayoutService.updateLayout(id, body);
    
    if (!layout) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(layout);
  } catch (error) {
    console.error('Failed to update layout:', error);
    return NextResponse.json(
      { error: 'Failed to update layout' },
      { status: 500 }
    );
  }
}

// DELETE /api/layouts/[id] - Delete a layout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await LayoutService.deleteLayout(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete layout' },
      { status: 500 }
    );
  }
}