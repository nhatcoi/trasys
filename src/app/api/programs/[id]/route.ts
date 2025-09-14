import { NextRequest, NextResponse } from 'next/server';
import { ProgramRepository } from '@/modules/programs/programs.repo';

const programRepo = new ProgramRepository();

// GET /api/programs/[id] - Get program by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const program = await programRepo.findById(id);
    
    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    console.error('Program GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch program' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/programs/[id] - Update program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const program = await programRepo.update(id, body);
    
    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    console.error('Program PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update program' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/programs/[id] - Delete program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await programRepo.delete(id);
    
    return NextResponse.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Program DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete program' 
      },
      { status: 500 }
    );
  }
}
