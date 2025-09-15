
import { NextRequest, NextResponse } from 'next/server';
import { CourseRepository } from '@/modules/courses/courses.repo';

const courseRepo = new CourseRepository();

// Simple validation helper
function validateRequired(obj, fields) {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// GET /api/courses - Get all courses with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Simple parameter processing
    const page = parseInt(params.page || '1');
    const size = parseInt(params.size || '20');
    const search = params.search || '';
    const sort = params.sort || 'created_at';
    const order = params.order || 'desc';
    
    const result = await courseRepo.findAllWithOptions({
      page,
      size,
      search,
      sort,
      order,
      org_unit_id: params.org_unit_id,
      type: params.type
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('courses GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch courses' 
      },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new courses
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple validation - customize required fields per module
    validateRequired(body, ['code', 'name_vi']); // Courses need code and name_vi
    
    const result = await courseRepo.create(body);
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('courses POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create courses' 
      },
      { status: 500 }
    );
  }
}