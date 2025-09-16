import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/org/statuses/[id] - Get specific organization unit status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const statusId = BigInt(id);

    const status = await db.OrgUnitStatus.findUnique({
      where: { id: statusId }
    });

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status not found' },
        { status: 404 }
      );
    }

    // Serialize BigInt fields
    const serializedStatus = {
      ...status,
      id: status.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedStatus
    });

  } catch (error) {
    console.error('Error fetching org unit status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit status' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/org/statuses/[id] - Update organization unit status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const statusId = BigInt(id);

    const body = await request.json();
    const { code, name, description, color, workflow_step, is_active } = body;

    // Update status
    const updatedStatus = await db.OrgUnitStatus.update({
      where: { id: statusId },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(workflow_step !== undefined && { workflow_step }),
        ...(is_active !== undefined && { is_active })
      }
    });

    // Serialize BigInt fields
    const serializedStatus = {
      ...updatedStatus,
      id: updatedStatus.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedStatus
    });

  } catch (error) {
    console.error('Error updating org unit status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update org unit status' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/org/statuses/[id] - Soft delete organization unit status
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const statusId = BigInt(id);

    // Soft delete (set is_active to false)
    const updatedStatus = await db.OrgUnitStatus.update({
      where: { id: statusId },
      data: { is_active: false }
    });

    // Serialize BigInt fields
    const serializedStatus = {
      ...updatedStatus,
      id: updatedStatus.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedStatus,
      message: 'Status deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting org unit status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete org unit status' 
      },
      { status: 500 }
    );
  }
}
