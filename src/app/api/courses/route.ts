import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/modules/courses/courses.service';
import { CourseQuerySchema } from '@/modules/courses/courses.schema';

const courseService = new CourseService();

// GET /api/courses - Get all courses with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const result = await courseService.getAllCoursesWithOptions(params);
    
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

// POST /api/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await courseService.createCourse(body);
    
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
