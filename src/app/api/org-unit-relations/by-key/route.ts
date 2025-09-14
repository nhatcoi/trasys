import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRelationService } from '@/modules/org-unit-relation/org-unit-relation.service';

const orgUnitRelationService = new OrgUnitRelationService();

// GET /api/org-unit-relations/by-key - Get org unit relation by composite key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parent_id = searchParams.get('parent_id');
    const child_id = searchParams.get('child_id');
    const relation_type = searchParams.get('relation_type');
    const effective_from = searchParams.get('effective_from');
    
    if (!parent_id || !child_id || !relation_type || !effective_from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: parent_id, child_id, relation_type, effective_from' 
        },
        { status: 400 }
      );
    }

    const result = await orgUnitRelationService.getById({
      parent_id,
      child_id,
      relation_type,
      effective_from,
    });
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
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

// PUT /api/org-unit-relations/by-key - Update org unit relation
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parent_id = searchParams.get('parent_id');
    const child_id = searchParams.get('child_id');
    const relation_type = searchParams.get('relation_type');
    const effective_from = searchParams.get('effective_from');
    
    if (!parent_id || !child_id || !relation_type || !effective_from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: parent_id, child_id, relation_type, effective_from' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const result = await orgUnitRelationService.update({
      parent_id,
      child_id,
      relation_type,
      effective_from,
    }, body);
    
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

// DELETE /api/org-unit-relations/by-key - Delete org unit relation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parent_id = searchParams.get('parent_id');
    const child_id = searchParams.get('child_id');
    const relation_type = searchParams.get('relation_type');
    const effective_from = searchParams.get('effective_from');
    
    if (!parent_id || !child_id || !relation_type || !effective_from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: parent_id, child_id, relation_type, effective_from' 
        },
        { status: 400 }
      );
    }

    const result = await orgUnitRelationService.delete({
      parent_id,
      child_id,
      relation_type,
      effective_from,
    });
    
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

