
import { NextRequest, NextResponse } from 'next/server';
import { SectionsRepository } from '@/modules/sections/sections.repo';

const sectionsRepo = new SectionsRepository();

// Simple validation helper
function validateRequired(obj, fields) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// GET /api/sections - Get all sections with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    
    const result = await sectionsRepo.findAll({
      page,
      size,
      search,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('sections GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch sections' 
      },
      { status: 500 }
    );
  }
}

// POST /api/sections - Create new sections
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple validation - customize required fields per module
    validateRequired(body, ['code', 'name_vi', 'org_unit_id']); // Sections need code, name_vi, and org_unit_id
    
    const result = await sectionsRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('sections POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create sections' 
      },
      { status: 500 }
    );
  }
}