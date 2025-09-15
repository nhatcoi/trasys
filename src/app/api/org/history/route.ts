import { NextRequest, NextResponse } from 'next/server';
import { HistoryRepository } from '@/modules/org/history/history.repo';

const historyRepo = new HistoryRepository();

// GET /api/org/history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const org_unit_id = searchParams.get('org_unit_id');
    const change_type = searchParams.get('change_type');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');
    const sort = searchParams.get('sort') || 'changed_at';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'desc';

    if (!org_unit_id) {
      return NextResponse.json(
        { success: false, error: 'org_unit_id is required' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await historyRepo.findAll({
      org_unit_id: parseInt(org_unit_id, 10),
      change_type,
      from_date,
      to_date,
      page,
      size,
      sort,
      order,
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('History route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch history' 
      },
      { status: 500 }
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

    // Call repository directly
    const result = await historyRepo.create({
      org_unit_id: parseInt(body.org_unit_id, 10),
      old_name: body.old_name,
      new_name: body.new_name,
      change_type: body.change_type,
      details: body.details,
    });
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
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
