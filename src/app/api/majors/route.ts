
import { NextRequest, NextResponse } from 'next/server';
import { MajorsRepository } from '@/modules/majors/majors.repo';

const majorsRepo = new MajorsRepository();

// Simple validation helper
function validateRequired(obj, fields) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// GET /api/majors - Get all majors with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    
    const result = await majorsRepo.findAll({
      page,
      size,
      search,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('majors GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch majors' 
      },
      { status: 500 }
    );
  }
}

// POST /api/majors - Create new majors
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple validation - customize required fields per module
    validateRequired(body, ['code', 'name_vi', 'org_unit_id']); // Majors need code, name_vi, and org_unit_id
    
    const result = await majorsRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('majors POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create majors' 
      },
      { status: 500 }
    );
  }
}