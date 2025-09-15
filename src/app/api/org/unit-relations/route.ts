import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRelationRepository } from '@/modules/org/unit-relation/org-unit-relation.repo';

const orgUnitRelationRepo = new OrgUnitRelationRepository();

// Simple validation helper
function validateRequired(obj: { [key: string]: unknown }, fields: string[]) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// GET /api/org-unit-relations - Get all org unit relations with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    const parent_id = params.parent_id || '';
    const child_id = params.child_id || '';
    
    const result = await orgUnitRelationRepo.findAll({
      page,
      size,
      search,
      parent_id,
      child_id,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('org-unit-relations GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit relations' 
      },
      { status: 500 }
    );
  }
}

// POST /api/org-unit-relations - Create new org unit relation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    validateRequired(body, ['parent_id', 'child_id', 'relation_type', 'effective_from']);
    
    const result = await orgUnitRelationRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('org-unit-relations POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org unit relation' 
      },
      { status: 500 }
    );
  }
}

