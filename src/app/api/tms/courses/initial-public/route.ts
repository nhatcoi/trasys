import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandling } from '@/lib/api/api-handler';
import { CreateCourseInput } from '@/lib/api/schemas/course';

// POST /api/tms/courses/initial-public - Tạo course với đầy đủ 5 steps (public demo)
const createInitialCoursePublic = async (body: unknown, request: NextRequest) => {
  const courseData = body as CreateCourseInput;

  // Basic validation
  if (!courseData.code || !courseData.name_vi || !courseData.credits || !courseData.org_unit_id || !courseData.type) {
    throw new Error('Missing required fields: code, name_vi, credits, org_unit_id, type');
  }

  // Get next available ID
  const lastCourse = await db.course.findFirst({
    orderBy: { id: 'desc' }
  });
  const nextId = lastCourse ? lastCourse.id + BigInt(1) : BigInt(1);

  // Process prerequisites array to string
  const prerequisitesString = courseData.prerequisites ? courseData.prerequisites.join(', ') : null;

  // Create course in transaction to ensure data consistency
  const result = await db.$transaction(async (tx) => {
    // 1. Create main course record
    const course = await tx.course.create({
      data: {
        id: nextId,
        code: courseData.code,
        name_vi: courseData.name_vi,
        name_en: courseData.name_en || null,
        credits: courseData.credits,
        org_unit_id: BigInt(courseData.org_unit_id),
        type: courseData.type,
        description: courseData.description || null,
        
        // Step 2: Prerequisites
        prerequisites: prerequisitesString,
        
        // Step 3: Learning Objectives + Syllabus (combined for now)
        learning_objectives: {
          objectives: courseData.learning_objectives || [],
          syllabus: courseData.syllabus || []
        },
        
        // Step 5: Assessment
        assessment_methods: courseData.assessment_methods || null,
        passing_grade: courseData.passing_grade || 5.0,
        
        // Step 6: Workflow
        workflow_priority: courseData.workflow_priority || 'medium',
        workflow_notes: courseData.workflow_notes || null,
        
        // Default status
        status: 'DRAFT',
        workflow_stage: 'FACULTY'
      }
    }).catch((error) => {
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('org_unit_id') && error.meta?.target?.includes('code')) {
          throw new Error(`Mã môn học "${courseData.code}" đã tồn tại trong khoa này. Vui lòng chọn mã khác hoặc chọn khoa khác.`);
        } else if (error.meta?.target?.includes('code')) {
          throw new Error(`Mã môn học "${courseData.code}" đã tồn tại. Vui lòng chọn mã khác.`);
        } else {
          throw new Error('Môn học với thông tin này đã tồn tại. Vui lòng kiểm tra lại thông tin.');
        }
      } else if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new Error(`Khoa với ID ${courseData.org_unit_id} không tồn tại. Vui lòng chọn khoa hợp lệ.`);
      } else {
        // Other database errors
        throw new Error(`Lỗi database: ${error.message}`);
      }
    });

    // 2. Create syllabus entries if provided (Step 4)
    // Note: For now, we'll store syllabus in the course learning_objectives field
    // as a nested structure since course_syllabus requires course_version_id
    // In the future, we can create a proper course version and link syllabus to it

    return course;
  });

  return {
    message: 'Course created successfully with all 5 steps',
    data: result,
    steps_completed: {
      basic_info: true,
      prerequisites: !!courseData.prerequisites?.length,
      learning_objectives: !!courseData.learning_objectives?.length,
      syllabus: !!courseData.syllabus?.length,
      assessment: !!courseData.assessment_methods?.length,
      workflow: true
    }
  };
};

export const POST = withErrorHandling(
  async (request: NextRequest) => {
    const body = await request.json();
    return await createInitialCoursePublic(body, request);
  },
  'create initial course (public)'
);
