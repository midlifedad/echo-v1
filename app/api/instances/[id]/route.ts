import { NextRequest, NextResponse } from 'next/server';
import { TileInstanceService } from '@/lib/services/tileInstanceService';

// GET /api/instances/[id] - Get a single instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instance = await TileInstanceService.getInstance(params.id);
    
    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(instance);
  } catch (error) {
    console.error('Failed to fetch instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instance' },
      { status: 500 }
    );
  }
}

// PUT /api/instances/[id] - Update an instance
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const instance = await TileInstanceService.updateInstance(params.id, body);
    
    if (!instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(instance);
  } catch (error) {
    console.error('Failed to update instance:', error);
    return NextResponse.json(
      { error: 'Failed to update instance' },
      { status: 500 }
    );
  }
}

// DELETE /api/instances/[id] - Delete an instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await TileInstanceService.deleteInstance(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete instance:', error);
    return NextResponse.json(
      { error: 'Failed to delete instance' },
      { status: 500 }
    );
  }
}