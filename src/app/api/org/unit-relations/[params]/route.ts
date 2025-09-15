import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRelationRepository } from '@/modules/org/unit-relation/org-unit-relation.repo';

const orgUnitRelationRepo = new OrgUnitRelationRepository();

// GET /api/org-unit-relations/[params] - Get org unit relation by composite key
export async function GET(
  request: NextRequest,
  { params }: { params: { params: string } }
) {
  try {
    // Parse composite key from params (format: parent_id/child_id/relation_type/effective_from)
    const [parent_id, child_id, relation_type, effective_from] = params.params.split('/');
    
    if (!parent_id || !child_id || !relation_type || !effective_from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters. Expected: parent_id/child_id/relation_type/effective_from' 
        },
        { status: 400 }
      );
    }

    const result = await orgUnitRelationService.getById({
      parent_id,
      child_id,
      relation_type,
      effective_from: decodeURIComponent(effective_from),
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

// PUT /api/org-unit-relations/[params] - Update org unit relation
export async function PUT(
  request: NextRequest,
  { params }: { params: { params: string } }
) {
  try {
    // Parse composite key from params
    const [parent_id, child_id, relation_type, effective_from] = params.params.split('/');
    
    if (!parent_id || !child_id || !relation_type || !effective_from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters. Expected: parent_id/child_id/relation_type/effective_from' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const result = await orgUnitRelationService.update({
      parent_id,
      child_id,
      relation_type,
      effective_from: decodeURIComponent(effective_from),
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

// DELETE /api/org-unit-relations/[params] - Delete org unit relation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { params: string } }
) {
  try {
    // Parse composite key from params
    const [parent_id, child_id, relation_type, effective_from] = params.params.split('/');
    
    if (!parent_id || !child_id || !relation_type || !effective_from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters. Expected: parent_id/child_id/relation_type/effective_from' 
        },
        { status: 400 }
      );
    }

    const result = await orgUnitRelationService.delete({
      parent_id,
      child_id,
      relation_type,
      effective_from: decodeURIComponent(effective_from),
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

