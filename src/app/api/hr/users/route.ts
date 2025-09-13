import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            username,
            email,
            password,
            full_name,
            phone,
            address,
            dob,
            gender,
        } = body;

        // Validate required fields
        if (!username || !email || !password || !full_name) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Username, email, password, and full_name are required'
                },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Username or email already exists'
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await db.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                full_name,
                phone,
                address,
                dob: dob ? new Date(dob) : null,
                gender,
            },
        });

        // Convert BigInt to string for JSON serialization
        const serializedUser = {
            ...user,
            id: user.id.toString(),
            password: undefined, // Don't return password
        };

        return NextResponse.json({
            success: true,
            data: serializedUser
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create user'
            },
            { status: 500 }
        );
    }
}
