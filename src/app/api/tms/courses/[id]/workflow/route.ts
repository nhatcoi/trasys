import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { withErrorHandling, withIdAndBody, createErrorResponse } from '@/lib/api/api-handler';
import { WorkflowActionInput } from '@/lib/api/schemas/course';

// POST /api/tms/courses/[id]/workflow - Workflow actions
const processWorkflowAction = async (id: string, body: unknown, request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'Authentication required', 401);
  }

  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    throw new Error('Invalid course ID');
  }

  const workflowData = body as WorkflowActionInput;
  const { action, comment, priority } = workflowData;

  // Get current course with workflow info
  const course = await db.course.findUnique({
    where: { id: BigInt(courseId) },
    include: {
      workflows: {
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  });

  if (!course || !course.workflows[0]) {
    throw new Error('Course or workflow not found');
  }

  const currentWorkflow = course.workflows[0];
  let newWorkflowStage = currentWorkflow.workflow_stage;
  let newStatus = currentWorkflow.status;

  // Handle different workflow actions using transaction
  const result = await db.$transaction(async (tx) => {
    let updatedWorkflow;

    switch (action) {
      case 'submit':
        if (currentWorkflow.status === 'DRAFT') {
          newStatus = 'SUBMITTED';
          newWorkflowStage = 'ACADEMIC_OFFICE';
          updatedWorkflow = await tx.courseWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              status: newStatus,
              workflow_stage: newWorkflowStage,
              current_reviewer_id: null, // Will be assigned by Academic Office
              updated_at: new Date(),
            }
          });
        } else {
          throw new Error('Invalid action for current status');
        }
        break;

      case 'approve':
        if (currentWorkflow.workflow_stage === 'ACADEMIC_OFFICE') {
          newWorkflowStage = 'ACADEMIC_BOARD';
          updatedWorkflow = await tx.courseWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              workflow_stage: newWorkflowStage,
              current_reviewer_id: null, // Will be assigned by Academic Board
              updated_at: new Date(),
            }
          });
        } else if (currentWorkflow.workflow_stage === 'ACADEMIC_BOARD') {
          newStatus = 'APPROVED';
          updatedWorkflow = await tx.courseWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              status: newStatus,
              workflow_stage: 'ACADEMIC_BOARD', // Keep as ACADEMIC_BOARD instead of COMPLETED
              current_reviewer_id: null,
              updated_at: new Date(),
            }
          });
        } else {
          throw new Error('Invalid action for current workflow stage');
        }
        break;

      case 'reject':
        newStatus = 'REJECTED';
        updatedWorkflow = await tx.courseWorkflow.update({
          where: { id: currentWorkflow.id },
          data: {
            status: newStatus,
            workflow_stage: 'FACULTY',
            current_reviewer_id: null,
            notes: comment || 'Rejected without reason',
            updated_at: new Date(),
          }
        });
        break;

      case 'return':
        if (currentWorkflow.workflow_stage === 'ACADEMIC_OFFICE') {
          newWorkflowStage = 'FACULTY';
          updatedWorkflow = await tx.courseWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              workflow_stage: newWorkflowStage,
              current_reviewer_id: null,
              updated_at: new Date(),
            }
          });
        } else if (currentWorkflow.workflow_stage === 'ACADEMIC_BOARD') {
          newWorkflowStage = 'ACADEMIC_OFFICE';
          updatedWorkflow = await tx.courseWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              workflow_stage: newWorkflowStage,
              current_reviewer_id: null,
              updated_at: new Date(),
            }
          });
        } else {
          throw new Error('Invalid action for current workflow stage');
        }
        break;

      case 'publish':
        if (currentWorkflow.status === 'APPROVED') {
          newStatus = 'PUBLISHED';
          updatedWorkflow = await tx.courseWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              status: newStatus,
              updated_at: new Date(),
            }
          });
        } else {
          throw new Error('Only approved courses can be published');
        }
        break;

      default:
        throw new Error('Invalid action');
    }

    return updatedWorkflow;
  });

  // Create approval history record
  await db.courseApprovalHistory.create({
    data: {
      course_id: BigInt(courseId),
      workflow_id: currentWorkflow.id,
      action: action.toUpperCase(),
      reviewer_id: BigInt(session.user.id),
      reviewer_role: 'FACULTY', // TODO: Get actual role from user
      comments: comment || null,
      from_status: currentWorkflow.status,
      to_status: newStatus,
      created_at: new Date()
    }
  });

  return createSuccessResponse(result, `Course ${action} successfully`);
};

// Export handler with error handling
export const POST = withIdAndBody(processWorkflowAction, 'process workflow action');