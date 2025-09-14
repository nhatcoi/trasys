import { NextRequest, NextResponse } from 'next/server';
import { MajorOwnerHistoryService } from '@/modules/major-owner-history/major-owner-history.service';

const majorOwnerHistoryService = new MajorOwnerHistoryService();

// GET /api/major-owner-histories - Get all major owner histories with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await majorOwnerHistoryService.getAll(params);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/major-owner-histories - Create new major owner history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await majorOwnerHistoryService.create(body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
