import { NextRequest, NextResponse } from 'next/server';
import { HistoryRepository } from '@/modules/org/history/history.repo';

const historyRepo = new HistoryRepository();

// GET /api/org/units/[id]/history - Get history for a specific unit
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string  }> }
) {
  try {
        const resolvedParams = await params;
        const unitId = parseInt(resolvedParams.id, 10);
    
    if (isNaN(unitId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unit ID' 
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const change_type = searchParams.get('change_type');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '50');
    const sort = searchParams.get('sort') || 'changed_at';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'desc';
    
    // Call repository
    const result = await historyRepo.findAll({
      org_unit_id: unitId,
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
    console.error('Unit history route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch unit history' 
      },
      { status: 500 }
    );
  }
}
