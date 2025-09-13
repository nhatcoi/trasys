import { NextRequest, NextResponse } from 'next/server';
import { OrgStructureRequestService } from '@/modules/org-structure-request/org-structure-request.service';
import { OrgStructureRequestQuerySchema } from '@/modules/org-structure-request/org-structure-request.schema';

const orgStructureRequestService = new OrgStructureRequestService();

// GET /api/org-structure-requests - Get all org structure requests with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await orgStructureRequestService.getAllOrgStructureRequestsWithOptions(params);
    
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

// POST /api/org-structure-requests - Create new org structure request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await orgStructureRequestService.createOrgStructureRequest(body);
    
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
