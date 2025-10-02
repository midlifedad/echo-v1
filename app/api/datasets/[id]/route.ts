/**
 * API Routes: GET, DELETE /api/datasets/[id]
 * Get or delete a specific dataset
 */

import { NextRequest, NextResponse } from 'next/server';
import { datasetStorage } from '@/lib/services/datasetStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }

    // Check if requesting preview only
    const { searchParams } = new URL(request.url);
    const previewOnly = searchParams.get('preview') === 'true';
    const previewRows = parseInt(searchParams.get('rows') || '10');

    if (previewOnly) {
      const preview = await datasetStorage.getDatasetPreview(id, previewRows);
      if (!preview) {
        return NextResponse.json(
          { error: 'Dataset not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(preview);
    }

    // Get full dataset
    const dataset = await datasetStorage.get(id);

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dataset);
  } catch (error) {
    console.error('Failed to get dataset:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }

    // Check if dataset exists
    const dataset = await datasetStorage.get(id);
    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Delete the dataset
    await datasetStorage.deleteDataset(id);

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete dataset:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}