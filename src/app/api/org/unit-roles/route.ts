import { NextRequest, NextResponse } from 'next/server';
import { OrgUnitRoleService } from '@/modules/org-unit-role/org-unit-role.service';
import { OrgUnitRoleQuerySchema } from '@/modules/org-unit-role/org-unit-role.schema';

const orgUnitRoleService = new OrgUnitRoleService();

// GET /api/org-unit-roles - Get all org unit roles with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await orgUnitRoleService.getAllOrgUnitRolesWithOptions(params);
    
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

// POST /api/org-unit-roles - Create new org unit role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await orgUnitRoleService.createOrgUnitRole(body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 201 });
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
