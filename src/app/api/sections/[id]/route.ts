
import { NextRequest, NextResponse } from 'next/server';
import { SectionsRepository } from '@/modules/sections/sections.repo';

const sectionsRepo = new SectionsRepository();

// GET /api/sections/[id] - Get sections by ID
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    const item = await sectionsRepo.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'sections not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: item });
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

// PUT /api/sections/[id] - Update sections
export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const item = await sectionsRepo.update(id, body);
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('sections PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update sections' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/sections/[id] - Delete sections
export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    await sectionsRepo.delete(id);
    
    return NextResponse.json({ success: true, message: 'sections deleted successfully' });
  } catch (error) {
    console.error('sections DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete sections' 
      },
      { status: 500 }
    );
  }
}