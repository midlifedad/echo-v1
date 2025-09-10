import { NextRequest, NextResponse } from 'next/server';

const CHART_MCP_URL = process.env.CHART_MCP_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to Chart MCP server
    const response = await fetch(`${CHART_MCP_URL}/api/v8/visualize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any API key if required
        ...(process.env.CHART_MCP_API_KEY && {
          'Authorization': `Bearer ${process.env.CHART_MCP_API_KEY}`
        })
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Chart generation failed: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint
    const response = await fetch(`${CHART_MCP_URL}/health`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Chart MCP server is not available' },
      { status: 503 }
    );
  }
}