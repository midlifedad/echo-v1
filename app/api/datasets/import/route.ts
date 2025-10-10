/**
 * API Route: POST /api/datasets/import
 * Imports CSV data and stores it in IndexedDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { csvParser } from '@/lib/services/csvParser';
import { datasetStorage } from '@/lib/services/datasetStorage';
import { Dataset } from '@/lib/types/dataset';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV files are supported.' },
        { status: 400 }
      );
    }

    // Parse the CSV file
    const result = await csvParser.parseToDataset(file, {
      hasHeaders: true,
      maxRows: 10000
    });

    if (!result.success || !result.dataset) {
      return NextResponse.json(
        { 
          error: 'Failed to parse CSV file',
          details: result.errors
        },
        { status: 400 }
      );
    }

    // Update dataset metadata
    const dataset = result.dataset;
    if (name) dataset.name = name;
    if (description) dataset.description = description;

    // Validate dataset
    const validation = await datasetStorage.validateDataset(dataset);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Dataset validation failed',
          errors: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }

    // Store the dataset
    await datasetStorage.save(dataset);

    // Return success with dataset info
    return NextResponse.json({
      success: true,
      datasetId: dataset.id,
      name: dataset.name,
      rowCount: dataset.statistics.rowCount,
      columnCount: dataset.statistics.columnCount,
      preview: result.preview,
      warnings: validation.warnings
    });
  } catch (error) {
    console.error('Dataset import error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}