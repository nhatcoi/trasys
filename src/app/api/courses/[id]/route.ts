
import { NextRequest, NextResponse } from 'next/server';
import { CourseRepository } from '@/modules/courses/courses.repo';

const courseRepo = new CourseRepository();

// GET /api/courses/[id] - Get courses by ID
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    const item = await courseRepo.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'courses not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: item });
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

// PUT /api/courses/[id] - Update courses
export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const item = await courseRepo.update(id, body);
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('courses PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update courses' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete courses
export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    await courseRepo.delete(id);
    
    return NextResponse.json({ success: true, message: 'courses deleted successfully' });
  } catch (error) {
    console.error('courses DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete courses' 
      },
      { status: 500 }
    );
  }
}