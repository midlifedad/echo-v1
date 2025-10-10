import { NextRequest, NextResponse } from 'next/server';
import { TileInstanceService } from '@/lib/services/tileInstanceService';

// POST /api/instances - Create a new instance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let instance;
    if (body.templateId && !body.config) {
      // Create from template
      instance = await TileInstanceService.createInstanceFromTemplate(
        body.templateId,
        body.layoutId,
        body.positions
      );
    } else {
      // Create custom instance
      instance = await TileInstanceService.createCustomInstance(body);
    }
    
    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error('Failed to create instance:', error);
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    );
  }
}