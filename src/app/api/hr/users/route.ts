import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Try direct user table access
        const users = await db.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                full_name: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(users, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        console.error('Error details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users', details: error.message },
            { status: 500 }
        );
    }
}