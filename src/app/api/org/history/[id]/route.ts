import { NextRequest, NextResponse } from 'next/server';
import { HistoryRepository } from '@/modules/org/history/history.repo';

const historyRepo = new HistoryRepository();

// GET /api/org/history/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid history ID' 
        },
        { status: 400 }
      );
    }
    
    // Call repository
    const result = await historyRepo.findById(id);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : (result.error?.includes('not found') ? 404 : 500)
    });
  } catch (error) {
    console.error('History route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid request parameters' 
      },
      { status: 400 }
    );
  }
}
