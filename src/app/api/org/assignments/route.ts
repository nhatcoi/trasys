import { NextRequest, NextResponse } from 'next/server';
import { OrgAssignmentRepository } from '@/modules/org-assignment/org-assignment.repo';

const orgAssignmentRepo = new OrgAssignmentRepository();

// Simple validation helper
function validateRequired(data: any, fields: string[]): string[] {
  const errors: string[] = [];
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  return errors;
}

// GET /api/org/assignments - Get all org assignments with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    const org_unit_id = params.org_unit_id || '';
    const employee_id = params.employee_id || '';
    const is_primary = params.is_primary || '';
    
    const result = await orgAssignmentRepo.findAll({
      page,
      size,
      search,
      org_unit_id,
      employee_id,
      is_primary,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('org-assignments GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org assignments' 
      },
      { status: 500 }
    );
  }
}

// POST /api/org/assignments - Create new org assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    const errors = validateRequired(body, ['employee_id', 'org_unit_id']);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    const result = await orgAssignmentRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('org-assignments POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org assignment' 
      },
      { status: 500 }
    );
  }
}
