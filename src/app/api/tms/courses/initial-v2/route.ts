import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { withErrorHandling } from '@/lib/api/api-handler';
import { db } from '@/lib/db';

interface CreateCourseInput {
  // Step 1: Basic Information
  code: string;
  name_vi: string;
  name_en?: string;
  credits: number;
  org_unit_id: string;
  type: string;
  description?: string;
  
  // Step 2: Prerequisites
  prerequisites?: string[];
  
  // Step 3: Learning Objectives
  learning_objectives?: any;
  
  // Step 4: Learning Materials
  learning_materials?: Array<{
    title: string;
    description?: string;
    file_type?: string;
    file_size?: number;
  }>;
  
  // Step 5: Assessment
  assessment_methods?: any;
  passing_grade?: number;
  
  // Step 6: Workflow
  workflow_priority?: string;
  workflow_notes?: string;
}

export const POST = withErrorHandling(
  async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { error: 'Unauthorized' };
    }

    const courseData: CreateCourseInput = await request.json();

    // Validate required fields
    if (!courseData.code || !courseData.name_vi || !courseData.credits || !courseData.org_unit_id) {
      return { error: 'Missing required fields: code, name_vi, credits, org_unit_id' };
    }

    // Convert prerequisites array to string
    const prerequisitesString = courseData.prerequisites?.join(', ') || null;

    // Create course with related data in transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create main course record (core data only)
      const course = await tx.course.create({
        data: {
          code: courseData.code,
          name_vi: courseData.name_vi,
          name_en: courseData.name_en || null,
          credits: courseData.credits,
          org_unit_id: BigInt(courseData.org_unit_id),
          type: courseData.type,
          description: courseData.description || null,
        }
      }).catch((error) => {
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
          // Unique constraint violation
          if (error.meta?.target?.includes('org_unit_id') && error.meta?.target?.includes('code')) {
            throw new Error('Mã môn học đã tồn tại trong đơn vị này. Vui lòng chọn mã khác.');
          }
          throw new Error('Dữ liệu đã tồn tại. Vui lòng kiểm tra lại thông tin.');
        }
        if (error.code === 'P2003') {
          // Foreign key constraint violation
          throw new Error('Đơn vị tổ chức không hợp lệ. Vui lòng chọn đơn vị khác.');
        }
        throw error;
      });

      // 2. Create course workflow record
      const workflow = await tx.courseWorkflow.create({
        data: {
          course_id: course.id,
          status: 'DRAFT',
          workflow_stage: 'FACULTY',
          priority: courseData.workflow_priority || 'medium',
          notes: courseData.workflow_notes || null,
        }
      });

      // 3. Create course content record
      const content = await tx.courseContent.create({
        data: {
          course_id: course.id,
          prerequisites: prerequisitesString,
          learning_objectives: courseData.learning_objectives || null,
          assessment_methods: courseData.assessment_methods || null,
          passing_grade: courseData.passing_grade || 5.0,
        }
      });

      // 4. Create course audit record
      const audit = await tx.courseAudit.create({
        data: {
          course_id: course.id,
          created_by: BigInt(session.user.id),
          updated_by: BigInt(session.user.id),
        }
      });

      return {
        course,
        workflow,
        content,
        audit
      };
    });

    return {
      success: true,
      message: 'Course created successfully',
      data: {
        id: result.course.id.toString(),
        code: result.course.code,
        name_vi: result.course.name_vi,
        status: result.workflow.status,
        workflow_stage: result.workflow.workflow_stage,
        created_at: result.course.created_at,
      }
    };
  },
  'create initial course v2'
);
