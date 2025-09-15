
import { NextRequest, NextResponse } from 'next/server';
import { ClassSectionsRepository } from '@/modules/class-sections/class-sections.repo';

const classsectionsRepo = new ClassSectionsRepository();

// GET /api/class-sections/[id] - Get class-sections by ID
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    const item = await classsectionsRepo.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'class-sections not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: item });
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

// PUT /api/class-sections/[id] - Update class-sections
export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const item = await classsectionsRepo.update(id, body);
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('class-sections PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update class-sections' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/class-sections/[id] - Delete class-sections
export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    await classsectionsRepo.delete(id);
    
    return NextResponse.json({ success: true, message: 'class-sections deleted successfully' });
  } catch (error) {
    console.error('class-sections DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete class-sections' 
      },
      { status: 500 }
    );
  }
}