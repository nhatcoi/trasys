import { NextRequest, NextResponse } from 'next/server';
import { orgConfigCache } from '@/lib/org-config-cache';

// GET /api/org/types/cached - Get cached organization unit types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force_refresh') === 'true';
    
    const types = await orgConfigCache.getTypes(forceRefresh);

    const response = NextResponse.json({
      success: true,
      data: types,
      total: types.length,
      cached: !forceRefresh,
      timestamp: new Date().toISOString()
    });

    // Set cache headers
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    response.headers.set('ETag', `"types-${types.length}-${Date.now()}"`);

    return response;

  } catch (error) {
    console.error('Error fetching cached org unit types:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit types' 
      },
      { status: 500 }
    );
  }
}
