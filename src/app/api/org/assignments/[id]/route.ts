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

// GET /api/org/assignments/[id] - Get org assignment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Convert string id to number
    const assignmentId = parseInt(id, 10);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgAssignmentRepo.findById(assignmentId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch assignment' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/org/assignments/[id] - Update org assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Convert string id to number
    const assignmentId = parseInt(id, 10);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }
    
    // Validate body
    const body = await request.json();
    const errors = validateRequired(body, ['employee_id', 'org_unit_id']);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgAssignmentRepo.update(assignmentId, body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update assignment' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/org/assignments/[id] - Delete org assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Convert string id to number
    const assignmentId = parseInt(id, 10);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgAssignmentRepo.delete(assignmentId);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete assignment' 
      },
      { status: 500 }
    );
  }
}
