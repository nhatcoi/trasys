import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');

        let whereClause = {};
        if (employeeId) {
            whereClause = { employee_id: BigInt(employeeId) };
        }

        const performanceReviews = await db.performance_reviews.findMany({
            where: whereClause,
            include: {
                employees: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Serialize BigInt and Decimal values
        const serializedReviews = performanceReviews.map((review: any) => ({
            ...review,
            id: review.id.toString(),
            employee_id: review.employee_id.toString(),
            score: review.score?.toString() || null,
            employees: review.employees ? {
                ...review.employees,
                id: review.employees.id.toString(),
                user_id: review.employees.user_id.toString(),
                user: review.employees.user ? {
                    ...review.employees.user,
                    id: review.employees.user.id.toString()
                } : null
            } : null
        }));

        return NextResponse.json({ success: true, data: serializedReviews });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch performance reviews'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            employee_id,
            review_period,
            score,
            comments,
        } = body;

        if (!employee_id) {
            return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
        }

        const performanceReview = await db.performance_reviews.create({
            data: {
                employee_id: BigInt(employee_id),
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

        return NextResponse.json({ success: true, data: serializedReview }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create performance review'
            },
            { status: 500 }
        );
    }
}
