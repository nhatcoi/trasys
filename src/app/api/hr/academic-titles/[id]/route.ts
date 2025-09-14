import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const titleId = params.id;

        const title = await db.academic_titles.findUnique({
            where: { id: BigInt(titleId) },
        });

        if (!title) {
            return NextResponse.json({ success: false, error: 'Academic title not found' }, { status: 404 });
        }

        const serializedTitle = {
            ...title,
            id: title.id.toString(),
        };

        return NextResponse.json({ success: true, data: serializedTitle });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch academic title'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const titleId = params.id;
        const body = await request.json();
        const { code, title } = body;

        const updatedTitle = await db.academic_titles.update({
            where: { id: BigInt(titleId) },
            data: {
                code,
                title,
            },
        });

        const serializedTitle = {
            ...updatedTitle,
            id: updatedTitle.id.toString(),
        };

        return NextResponse.json({ success: true, data: serializedTitle });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update academic title'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const titleId = params.id;

        await db.academic_titles.delete({
            where: { id: BigInt(titleId) },
        });

        return NextResponse.json({ success: true, message: 'Academic title deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete academic title'
            },
            { status: 500 }
        );
    }
}
