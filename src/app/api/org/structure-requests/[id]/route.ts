import { NextRequest, NextResponse } from 'next/server';
import { OrgStructureRequestRepository } from '@/modules/org/structure-request/org-structure-request.repo';

const orgStructureRequestRepo = new OrgStructureRequestRepository();

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

// GET /api/org/structure-requests/[id] - Get single org structure request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const resolvedParams = await params;
        const { id } = await params;
    
    const result = await orgStructureRequestRepo.findById(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('org-structure-requests GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch request' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/org/structure-requests/[id] - Update org structure request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const resolvedParams = await params;
        const { id } = await params;
    const body = await request.json();
    
    // Validate that request exists
    const existingRequest = await orgStructureRequestRepo.findById(id);
    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    const result = await orgStructureRequestRepo.update(id, body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('org-structure-requests PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update request' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/org/structure-requests/[id] - Delete org structure request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const resolvedParams = await params;
        const { id } = await params;
    
    await orgStructureRequestRepo.delete(id);
    
    return NextResponse.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('org-structure-requests DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete request' 
      },
      { status: 500 }
    );
  }
}