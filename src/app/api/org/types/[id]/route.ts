import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/org/types/[id] - Get specific organization unit type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const typeId = BigInt(id);

    const type = await db.OrgUnitType.findUnique({
      where: { id: typeId }
    });

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type not found' },
        { status: 404 }
      );
    }

    // Serialize BigInt fields
    const serializedType = {
      ...type,
      id: type.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedType
    });

  } catch (error) {
    console.error('Error fetching org unit type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit type' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/org/types/[id] - Update organization unit type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const typeId = BigInt(id);

    const body = await request.json();
    const { code, name, description, color, sort_order, is_active } = body;

    // Update type
    const updatedType = await db.OrgUnitType.update({
      where: { id: typeId },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(sort_order !== undefined && { sort_order }),
        ...(is_active !== undefined && { is_active })
      }
    });

    // Serialize BigInt fields
    const serializedType = {
      ...updatedType,
      id: updatedType.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedType
    });

  } catch (error) {
    console.error('Error updating org unit type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update org unit type' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/org/types/[id] - Soft delete organization unit type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const typeId = BigInt(id);

    // Soft delete (set is_active to false)
    const updatedType = await db.OrgUnitType.update({
      where: { id: typeId },
      data: { is_active: false }
    });

    // Serialize BigInt fields
    const serializedType = {
      ...updatedType,
      id: updatedType.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedType,
      message: 'Type deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting org unit type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete org unit type' 
      },
      { status: 500 }
    );
  }
}
