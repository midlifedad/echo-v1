import { NextRequest, NextResponse } from 'next/server';
import { TileTemplateService } from '@/lib/services/tileTemplateService';

// POST /api/templates/[id]/duplicate - Duplicate a template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;
    
    // Get the original template
    const original = await TileTemplateService.getTemplate(params.id);
    
    if (!original) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Create a duplicate
    const duplicate = await TileTemplateService.createTemplate({
      ...original,
      name: name || `${original.name} (Copy)`,
      isPublic: false,
      usageCount: 0
    });
    
    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error('Failed to duplicate template:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate template' },
      { status: 500 }
    );
  }
}