import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = params.id;

        const performanceReview = await db.performance_reviews.findUnique({
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

        const performanceReview = await db.performance_reviews.update({
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

        await db.performance_reviews.delete({
            where: { id: reviewId as any }
        });

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
