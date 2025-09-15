import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitBackupRepository } from '@/modules/org-unit-backup/org-unit-backup.repo';

const orgUnitBackupRepo = new OrgUnitBackupRepository();

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

// GET /api/org/unit-backups/[id] - Get org unit backup by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Convert string id to number
    const backupId = parseInt(id, 10);
    if (isNaN(backupId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup ID' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgUnitBackupRepo.findById(backupId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Backup not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch backup' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/org/unit-backups/[id] - Update org unit backup
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Convert string id to number
    const backupId = parseInt(id, 10);
    if (isNaN(backupId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup ID' },
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
    const result = await orgUnitBackupRepo.update(backupId, body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update backup' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/org/unit-backups/[id] - Delete org unit backup
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Convert string id to number
    const backupId = parseInt(id, 10);
    if (isNaN(backupId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup ID' },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await orgUnitBackupRepo.delete(backupId);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete backup' 
      },
      { status: 500 }
    );
  }
}
