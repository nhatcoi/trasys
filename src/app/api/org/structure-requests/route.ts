import { NextRequest, NextResponse } from 'next/server';
import { OrgStructureRequestRepository } from '@/modules/org-structure-request/org-structure-request.repo';

const orgStructureRequestRepo = new OrgStructureRequestRepository();

// Simple validation helper
function validateRequired(obj: any, fields: string[]) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// GET /api/org-structure-requests - Get all org structure requests with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    
    const result = await orgStructureRequestRepo.findAll({
      page,
      size,
      search,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('org-structure-requests GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch org structure requests' 
      },
      { status: 500 }
    );
  }
}

// POST /api/org-structure-requests - Create new org structure request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation - request_type is required, other fields are optional
    validateRequired(body, ['request_type']);
    
    const result = await orgStructureRequestRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('org-structure-requests POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create org structure request' 
      },
      { status: 500 }
    );
  }
}
