import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRelationService } from '@/modules/org-unit-relation/org-unit-relation.service';

const orgUnitRelationService = new OrgUnitRelationService();

// GET /api/org-unit-relations - Get all org unit relations with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await orgUnitRelationService.getAll(params);
    
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

// POST /api/org-unit-relations - Create new org unit relation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await orgUnitRelationService.create(body);
    
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

