import { NextRequest, NextResponse } from 'next/server';
import { TileTemplateService } from '@/lib/services/tileTemplateService';

// POST /api/instances/[id]/save-as-template - Save an instance as a new template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const template = await TileTemplateService.createTemplateFromInstance(
      params.id,
      {
        name: body.name,
        description: body.description,
        category: body.category,
        tags: body.tags,
        isPublic: body.isPublic
      }
    );
    
    if (!template) {
      return NextResponse.json(
        { error: 'Failed to create template from instance' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to save instance as template:', error);
    return NextResponse.json(
      { error: 'Failed to save instance as template' },
      { status: 500 }
    );
  }
}