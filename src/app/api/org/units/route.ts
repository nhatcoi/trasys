import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRepository } from '@/modules/org/org.repo';

const orgUnitRepo = new OrgUnitRepository();

// Simple validation helper
function validateRequired(obj: { [key: string]: unknown }, fields: string[]) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simple parameter processing
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'desc';
    
    const result = await orgUnitRepo.findAll({
      page,
      size,
      search,
      status,
      type,
      sort,
      order,
      fromDate: searchParams.get('fromDate'),
      toDate: searchParams.get('toDate'),
      include_children: searchParams.get('include_children') === 'true',
      include_employees: searchParams.get('include_employees') === 'true',
      include_parent: searchParams.get('include_parent') === 'true',
    });
    
    return NextResponse.json({ 
      success: true, 
      data: result.items || result,
      pagination: {
        page,
        size,
        total: result.total || result.length,
        totalPages: Math.ceil((result.total || result.length) / size),
        hasNextPage: page < Math.ceil((result.total || result.length) / size),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('org-units GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org units' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    validateRequired(body, ['name', 'code']);
    
    const result = await orgUnitRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('org-units POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org unit' 
      },
      { status: 500 }
    );
  }
}