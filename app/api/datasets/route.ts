/**
 * API Route: GET /api/datasets
 * Lists all stored datasets
 */

import { NextRequest, NextResponse } from 'next/server';
import { datasetStorage } from '@/lib/services/datasetStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'name' | 'createdAt' | 'updatedAt' | 'size';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get datasets from storage
    const result = await datasetStorage.listDatasets({
      search,
      tags,
      sortBy,
      sortOrder,
      limit,
      offset
    });

    // Get storage quota info
    const quota = await datasetStorage.getStorageQuota();

    return NextResponse.json({
      datasets: result.datasets,
      total: result.total,
      limit,
      offset,
      storageQuota: quota
    });
  } catch (error) {
    console.error('Failed to list datasets:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}