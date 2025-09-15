import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/org/units/[id]/status - Update org unit status only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Convert string id to BigInt
    const unitId = BigInt(id);
    
    // Check if unit exists
    const existingUnit = await db.OrgUnit.findUnique({
      where: { id: unitId },
      select: { id: true, name: true, code: true }
    });
    
    if (!existingUnit) {
      return NextResponse.json(
        { success: false, error: 'Unit not found' },
        { status: 404 }
      );
    }
    
    // Update only status field
    const updatedUnit = await db.OrgUnit.update({
      where: { id: unitId },
      data: { status: body.status },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        updated_at: true,
      }
    });
    
    // Serialize BigInt fields
    const serializedUnit = {
      ...updatedUnit,
      id: updatedUnit.id.toString(),
    };
    
    return NextResponse.json({ 
      success: true, 
      data: serializedUnit,
      message: `Unit status updated to ${body.status}`
    });
  } catch (error) {
    console.error('org-units status PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update unit status' 
      },
      { status: 500 }
    );
  }
}
