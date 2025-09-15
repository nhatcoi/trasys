
import { NextRequest, NextResponse } from 'next/server';
import { MajorsRepository } from '@/modules/majors/majors.repo';

const majorsRepo = new MajorsRepository();

// GET /api/majors/[id] - Get majors by ID
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    const item = await majorsRepo.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'majors not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: item });
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

// PUT /api/majors/[id] - Update majors
export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const item = await majorsRepo.update(id, body);
    
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('majors PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update majors' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/majors/[id] - Delete majors
export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;
    
    await majorsRepo.delete(id);
    
    return NextResponse.json({ success: true, message: 'majors deleted successfully' });
  } catch (error) {
    console.error('majors DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete majors' 
      },
      { status: 500 }
    );
  }
}