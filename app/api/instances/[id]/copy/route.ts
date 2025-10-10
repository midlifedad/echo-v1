import { NextRequest, NextResponse } from 'next/server';
import { TileInstanceService } from '@/lib/services/tileInstanceService';

// POST /api/instances/[id]/copy - Copy an instance to another layout
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const newInstance = await TileInstanceService.copyInstance({
      sourceInstanceId: params.id,
      targetLayoutId: body.targetLayoutId,
      positions: body.positions
    });
    
    return NextResponse.json(newInstance, { status: 201 });
  } catch (error) {
    console.error('Failed to copy instance:', error);
    return NextResponse.json(
      { error: 'Failed to copy instance' },
      { status: 500 }
    );
  }
}