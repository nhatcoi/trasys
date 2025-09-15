import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Lấy danh sách tất cả bằng cấp
export async function GET() {
    try {
        const qualifications = await db.qualification.findMany({
            orderBy: {
                title: 'asc'
            }
        });

        // Convert BigInt to string for JSON serialization
        const serializedQualifications = qualifications.map((qualification: any) => ({
            ...qualification,
            id: qualification.id.toString()
        }));

        return NextResponse.json({ success: true, data: serializedQualifications });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Database connection failed'
            },
            { status: 500 }
        );
    }
}

// POST - Tạo bằng cấp mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, title } = body;

        if (!code || !title) {
            return NextResponse.json(
                { success: false, error: 'Code và title là bắt buộc' },
                { status: 400 }
            );
        }

        const qualification = await db.qualification.create({
            data: {
                code,
                title
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...qualification,
                id: qualification.id.toString()
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Database connection failed'
            },
            { status: 500 }
        );
    }
}
