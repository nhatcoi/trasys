import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const trainingId = params.id;

        const training = await db.training.findUnique({
            where: { id: BigInt(trainingId) },
        });

        if (!training) {
            return NextResponse.json({ success: false, error: 'Training not found' }, { status: 404 });
        }

        const serializedTraining = {
            ...training,
            id: training.id.toString(),
            start_date: training.start_date.toISOString().split('T')[0],
            end_date: training.end_date.toISOString().split('T')[0],
            created_at: training.created_at.toISOString(),
            updated_at: training.updated_at.toISOString(),
        };

        return NextResponse.json({ success: true, data: serializedTraining });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch training'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const trainingId = params.id;
        const body = await request.json();
        const { title, provider, start_date, end_date, training_type, description } = body;

        const updatedTraining = await db.training.update({
            where: { id: BigInt(trainingId) },
            data: {
                title,
                provider,
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                training_type,
                description,
            },
        });

        const serializedTraining = {
            ...updatedTraining,
            id: updatedTraining.id.toString(),
            start_date: updatedTraining.start_date.toISOString().split('T')[0],
            end_date: updatedTraining.end_date.toISOString().split('T')[0],
            created_at: updatedTraining.created_at.toISOString(),
            updated_at: updatedTraining.updated_at.toISOString(),
        };

        return NextResponse.json({ success: true, data: serializedTraining });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update training'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const trainingId = params.id;

        await db.training.delete({
            where: { id: BigInt(trainingId) },
        });

        return NextResponse.json({ success: true, message: 'Training deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete training'
            },
            { status: 500 }
        );
    }
}
