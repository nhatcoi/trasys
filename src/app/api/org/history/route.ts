import { NextRequest, NextResponse } from 'next/server';
import { HistoryService } from '@/modules/history/history.service';
import { HistoryQuerySchema } from '@/modules/history/history.schema';

const historyService = new HistoryService();

// GET /api/org/history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryData = {
      org_unit_id: searchParams.get('org_unit_id') || undefined,
      change_type: searchParams.get('change_type') || undefined,
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      size: parseInt(searchParams.get('size') || '20'),
      sort: searchParams.get('sort') as 'changed_at' | 'change_type' || 'changed_at',
      order: searchParams.get('order') as 'asc' | 'desc' || 'desc',
    };

    // Validate query parameters
    const validatedQuery = HistoryQuerySchema.parse(queryData);
    
    // Call service
    const result = await historyService.getAll(validatedQuery);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500
    });
  } catch (error) {
    console.error('History route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request parameters' 
      },
      { status: 400 }
    );
  }
}

// POST /api/org/history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.org_unit_id || !body.change_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'org_unit_id and change_type are required' 
        },
        { status: 400 }
      );
    }

    // Call service
    const result = await historyService.create({
      org_unit_id: parseInt(body.org_unit_id, 10),
      old_name: body.old_name,
      new_name: body.new_name,
      change_type: body.change_type,
      details: body.details,
    });
    
    return NextResponse.json(result, { 
      status: result.success ? 201 : 500
    });
  } catch (error) {
    console.error('History route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request data' 
      },
      { status: 400 }
    );
  }
}
