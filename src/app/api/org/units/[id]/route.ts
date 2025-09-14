import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRepository } from '@/modules/org/org.repo';

const orgUnitRepo = new OrgUnitRepository();

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;
    
    // Convert string id to number
    const unitId = parseInt(id, 10);
    if (isNaN(unitId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid unit ID' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgUnitRepo.findById(unitId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Unit not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch unit' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;
    
    // Convert string id to number
    const unitId = parseInt(id, 10);
    if (isNaN(unitId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid unit ID' },
        { status: 400 }
      );
    }
    
    // Validate body
    const body = await request.json();
    const errors = validateRequired(body, ['name', 'code']);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgUnitRepo.update(unitId, body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update unit' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;
    
    // Convert string id to number
    const unitId = parseInt(id, 10);
    if (isNaN(unitId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid unit ID' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgUnitRepo.delete(unitId);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete unit' 
      },
      { status: 500 }
    );
  }
}