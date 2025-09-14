
import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionsRepository } from '@/modules/class-sections/class-sections.repo';

const classsectionsRepo = new ClassSectionsRepository();

// Simple validation helper
function validateRequired(obj, fields) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// GET /api/class-sections - Get all class-sections with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    
    const result = await classsectionsRepo.findAll({
      page,
      size,
      search,
      ...params
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('class-sections GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch class-sections' 
      },
      { status: 500 }
    );
  }
}

// POST /api/class-sections - Create new class-sections
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple validation - customize required fields per module
    validateRequired(body, ['name']); // Update this per module needs
    
    const result = await classsectionsRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('class-sections POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create class-sections' 
      },
      { status: 500 }
    );
  }
}