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

// GET /api/org/unit-backups - Get all org unit backups with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    const type = params.type || '';
    const status = params.status || '';
    
    const result = await orgUnitBackupRepo.findAll({
      page,
      size,
      search,
      type,
      status,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('org-unit-backups GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org unit backups' 
      },
      { status: 500 }
    );
  }
}

// POST /api/org/unit-backups - Create new org unit backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation
    const errors = validateRequired(body, ['name', 'code', 'backup_reason']);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    const result = await orgUnitBackupRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('org-unit-backups POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org unit backup' 
      },
      { status: 500 }
    );
  }
}
