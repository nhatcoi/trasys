import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeBigInt } from '@/utils/serialize';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { evaluationId, score, comments } = body;

        if (!evaluationId || !score) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get evaluation seed record to derive employee and period
        const evaluation = await db.performanceReview.findUnique({
            where: {
                id: BigInt(evaluationId)
            },
            include: {
                employees: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!evaluation) {
            return NextResponse.json(
                { error: 'Evaluation not found' },
                { status: 404 }
            );
        }

        // Create a NEW anonymous evaluation entry to support multiple submissions
        const newEvaluation = await db.performanceReview.create({
            data: {
                employee_id: evaluation.employee_id,
                review_period: evaluation.review_period,
                score: parseFloat(score),
                comments: comments || null,
                updated_at: new Date()
            },
            include: {
                employees: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const serializedData = serializeBigInt(newEvaluation);

        return NextResponse.json({
            message: 'Evaluation submitted successfully',
            data: serializedData
        });

    } catch (error) {
        console.error('Error submitting evaluation:', error);
        return NextResponse.json(
            { error: 'Failed to submit evaluation' },
            { status: 500 }
        );
    }
}
