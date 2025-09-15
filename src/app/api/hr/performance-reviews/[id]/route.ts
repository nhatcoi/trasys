import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEmployeeActivity, getActorInfo } from '@/lib/audit-logger';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = params.id;

        const performanceReview = await db.performanceReview.findUnique({
            where: { id: reviewId as any },
            include: {
                employees: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!performanceReview) {
            return NextResponse.json({ success: false, error: 'Performance review not found' }, { status: 404 });
        }

        // Serialize BigInt and Decimal values
        const serializedReview = {
            ...performanceReview,
            id: performanceReview.id.toString(),
            employee_id: performanceReview.employee_id.toString(),
            score: performanceReview.score?.toString() || null,
            employees: performanceReview.employees ? {
                ...performanceReview.employees,
                id: performanceReview.employees.id.toString(),
                user_id: performanceReview.employees.user_id.toString(),
                user: performanceReview.employees.user ? {
                    ...performanceReview.employees.user,
                    id: performanceReview.employees.user.id.toString()
                } : null
            } : null
        };

        return NextResponse.json({ success: true, data: serializedReview });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch performance review'
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = params.id;
        const body = await request.json();
        const {
            review_period,
            score,
            comments,
        } = body;

        // Get old data for logging
        const oldReview = await db.performanceReview.findUnique({
            where: { id: reviewId as any },
        });

        const performanceReview = await db.performanceReview.update({
            where: { id: reviewId as any },
            data: {
                review_period,
                score: score ? parseFloat(score) : null,
                comments,
            },
            include: {
                employees: {
                    include: {
                        user: true
                    }
                }
            }
        });

        // Serialize BigInt and Decimal values
        const serializedReview = {
            ...performanceReview,
            id: performanceReview.id.toString(),
            employee_id: performanceReview.employee_id.toString(),
            score: performanceReview.score?.toString() || null,
            employees: performanceReview.employees ? {
                ...performanceReview.employees,
                id: performanceReview.employees.id.toString(),
                user_id: performanceReview.employees.user_id.toString(),
                user: performanceReview.employees.user ? {
                    ...performanceReview.employees.user,
                    id: performanceReview.employees.user.id.toString()
                } : null
            } : null
        };

        // Log the update activity
        const actorInfo = getActorInfo(request);
        await logEmployeeActivity({
            employee_id: performanceReview.employee_id,
            action: 'UPDATE',
            entity_type: 'performance_reviews',
            entity_id: performanceReview.id,
            old_value: oldReview ? JSON.stringify({
                ...oldReview,
                id: oldReview.id.toString(),
                employee_id: oldReview.employee_id.toString(),
                score: oldReview.score?.toString() || null,
            }) : undefined,
            new_value: JSON.stringify(serializedReview),
            ...actorInfo,
        });

        return NextResponse.json({ success: true, data: serializedReview });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update performance review'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = params.id;

        // Get old data for logging
        const oldReview = await db.performanceReview.findUnique({
            where: { id: reviewId as any },
        });

        await db.performanceReview.delete({
            where: { id: reviewId as any }
        });

        // Log the deletion activity
        const actorInfo = getActorInfo(request);
        if (oldReview) {
            await logEmployeeActivity({
                employee_id: oldReview.employee_id,
                action: 'DELETE',
                entity_type: 'performance_reviews',
                entity_id: oldReview.id,
                old_value: JSON.stringify({
                    ...oldReview,
                    id: oldReview.id.toString(),
                    employee_id: oldReview.employee_id.toString(),
                    score: oldReview.score?.toString() || null,
                }),
                ...actorInfo,
            });
        }

        return NextResponse.json({ success: true, message: 'Performance review deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete performance review'
            },
            { status: 500 }
        );
    }
}
