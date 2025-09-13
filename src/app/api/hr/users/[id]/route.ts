import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { full_name, email, phone, address, dob, gender, new_password } = body;

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { id: BigInt(params.id) }
        });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {
            full_name,
            email,
            phone,
            address,
            dob: dob ? new Date(dob) : null,
            gender,
        };

        // Hash new password if provided
        if (new_password && new_password.trim() !== '') {
            updateData.password_hash = await bcrypt.hash(new_password, 12);
        }

        // Update user
        const updatedUser = await db.user.update({
            where: { id: BigInt(params.id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                phone: true,
                address: true,
                dob: true,
                gender: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updatedUser,
                id: updatedUser.id.toString()
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
