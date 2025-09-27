import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { withErrorHandling, withIdParam, withIdAndBody, createErrorResponse, createSuccessResponse } from '@/lib/api/api-handler';
import { UpdateCourseInput } from '@/lib/api/schemas/course';

// GET /api/tms/courses/[id] - Lấy chi tiết course
const getCourseById = async (id: string, request: Request) => {
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) {
  //   return createErrorResponse('Unauthorized', 'Authentication required', 401);
  // }

  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    throw new Error('Invalid course ID');
  }

  const course = await db.course.findUnique({
    where: { id: BigInt(courseId) },
    select: {
      id: true,
      code: true,
      name_vi: true,
      name_en: true,
      credits: true,
      type: true,
      status: true,
      org_unit_id: true,
      created_at: true,
      updated_at: true,
      description: true,
      OrgUnit: {
        select: { name: true, code: true }
      },
      workflows: {
        select: {
          id: true,
          status: true,
          workflow_stage: true,
          priority: true,
          notes: true,
          created_at: true,
          updated_at: true
        }
      },
      contents: {
        select: {
          id: true,
          prerequisites: true,
          learning_objectives: true,
          assessment_methods: true,
          passing_grade: true,
          created_at: true,
          updated_at: true
        }
      },
      audits: {
        select: {
          id: true,
          created_by: true,
          updated_by: true,
          created_at: true,
          updated_at: true
        }
      },
      course_approval_history: {
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          action: true,
          from_status: true,
          to_status: true,
          reviewer_id: true,
          reviewer_role: true,
          comments: true,
          created_at: true
        }
      },
      instructor_qualifications: {
        select: {
          id: true,
          instructor_id: true,
          qualification_type: true,
          qualification_level: true,
          status: true,
          valid_from: true,
          valid_to: true
        }
      },
      CourseVersion: {
        include: {
          CourseSyllabus: {
            orderBy: { week_number: 'asc' },
            select: {
              id: true,
              week_number: true,
              topic: true,
              teaching_methods: true,
              materials: true,
              assignments: true,
              duration_hours: true,
              is_exam_week: true,
              created_by: true,
              created_at: true
            }
          }
        }
      },
      prerequisites: {
        include: {
          prerequisite_course: {
            select: { id: true, code: true, name_vi: true }
          }
        }
      }
    }
  });

  if (!course) {
    throw new Error('Course not found');
  }



  return course;
};

// PUT /api/tms/courses/[id] - Cập nhật course
const updateCourse = async (id: string, body: unknown, request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'Authentication required', 401);
  }

  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    throw new Error('Invalid course ID');
  }

  const courseData = body as any;
  const prerequisitesString = courseData.prerequisites?.map((p: any) => typeof p === 'string' ? p : p.label).join(', ') || null;

  const result = await db.$transaction(async (tx) => {
    // 1. Update main course record
    const updatedCourse = await tx.course.update({
      where: { id: BigInt(courseId) },
      data: {
        code: courseData.code,
        name_vi: courseData.name_vi,
        name_en: courseData.name_en || null,
        credits: courseData.credits,
        ...(courseData.org_unit_id && { org_unit_id: BigInt(courseData.org_unit_id) }),
        ...(courseData.type && { type: courseData.type }),
        description: courseData.description || null,
        updated_at: new Date(),
      }
    });

    // 2. Update CourseWorkflow record
    const updatedWorkflow = await tx.courseWorkflow.updateMany({
      where: { course_id: BigInt(courseId) },
      data: {
        status: (courseData as any).status || 'DRAFT',
        workflow_stage: (courseData as any).workflow_stage || 'FACULTY',
        priority: (courseData as any).workflow_priority || 'medium',
        notes: (courseData as any).workflow_notes || null,
        updated_at: new Date(),
      }
    });

    // 3. Update CourseContent record (only set fields that are provided)
    const contentUpdateData: any = {};
    if (Object.prototype.hasOwnProperty.call(courseData, 'prerequisites')) {
      contentUpdateData.prerequisites = prerequisitesString;
    }
    if (Object.prototype.hasOwnProperty.call(courseData, 'learning_objectives')) {
      contentUpdateData.learning_objectives = courseData.learning_objectives as any;
    }
    if (Object.prototype.hasOwnProperty.call(courseData, 'assessment_methods')) {
      contentUpdateData.assessment_methods = courseData.assessment_methods as any;
    }
    if (Object.prototype.hasOwnProperty.call(courseData, 'passing_grade')) {
      contentUpdateData.passing_grade = courseData.passing_grade as any;
    }
    let updatedContent: any = null;
    if (Object.keys(contentUpdateData).length > 0) {
      contentUpdateData.updated_at = new Date();
      updatedContent = await tx.courseContent.updateMany({
        where: { course_id: BigInt(courseId) },
        data: contentUpdateData
      });
    }

    // 4. Update CourseAudit record
    const updatedAudit = await tx.courseAudit.updateMany({
      where: { course_id: BigInt(courseId) },
      data: {
        updated_by: BigInt(session.user.id),
        updated_at: new Date(),
      }
    });

    // 5. Update syllabus if provided
    if (courseData.syllabus && Array.isArray(courseData.syllabus)) {
      // Resolve course version (use latest, or create if none)
      let courseVersion = await tx.courseVersion.findFirst({
        where: { course_id: BigInt(courseId) },
        orderBy: { created_at: 'desc' }
      });
      if (!courseVersion) {
        courseVersion = await tx.courseVersion.create({
          data: {
            course_id: BigInt(courseId),
            version: '1',
            status: 'DRAFT'
          }
        });
      }

      // Delete existing syllabus for this version
      await tx.courseSyllabus.deleteMany({
        where: { course_version_id: courseVersion.id }
      });

      // Create new syllabus entries for this version
      if (courseData.syllabus.length > 0) {
        await tx.courseSyllabus.createMany({
          data: courseData.syllabus.map((week: any) => ({
            course_version_id: courseVersion!.id,
            week_number: week.week,
            topic: week.topic,
            teaching_methods: null,
            materials: week.materials ?? null,
            assignments: week.assignments ?? null,
            duration_hours: week.duration ?? 3,
            is_exam_week: week.isExamWeek ?? false
          }))
        });
      }
    }

    // 6. Update instructors if provided (replace strategy)
    if (Array.isArray((courseData as any).instructors)) {
      await tx.instructorQualifications.deleteMany({
        where: { course_id: BigInt(courseId) }
      });
      const instructors = (courseData as any).instructors as any[];
      if (instructors.length > 0) {
        await tx.instructorQualifications.createMany({
          data: instructors.map((ins: any) => ({
            instructor_id: BigInt(ins.instructor_id ?? ins.id ?? ins.employee_id),
            course_id: BigInt(courseId),
            qualification_type: ins.qualification_type ?? ins.qualification ?? 'GENERAL',
            qualification_level: ins.qualification_level ?? ins.level ?? 'STANDARD',
            status: ins.status ?? 'PENDING',
            valid_from: ins.valid_from ? new Date(ins.valid_from) : null,
            valid_to: ins.valid_to ? new Date(ins.valid_to) : null
          }))
        });
      }
    }

    // 7. Handle workflow actions (approve/reject)
    if ((courseData as any).workflow_action) {
      const workflowAction = (courseData as any).workflow_action;
      const comment = (courseData as any).comment || '';
      const status = (courseData as any).status;
      const workflowStage = (courseData as any).workflow_stage;

      // Check permissions for workflow actions
      const session = await getServerSession(authOptions);
      if (!session?.user?.permissions) {
        throw new Error('Unauthorized - No session permissions');
      }
      
      const userPermissions = session.user.permissions as string[];
      const requiredPermission = workflowAction === 'approve' ? 'tms.course.approve' : 'tms.course.reject';
      
      if (!userPermissions.includes(requiredPermission)) {
        throw new Error(`Unauthorized - Missing permission: ${requiredPermission}`);
      }

      // Update course workflow
      await tx.courseWorkflow.updateMany({
        where: { course_id: BigInt(courseId) },
        data: {
          status: status,
          workflow_stage: workflowStage,
          notes: comment,
          updated_at: new Date()
        }
      });

      // Sync status to Course table
      await tx.course.update({
        where: { id: BigInt(courseId) },
        data: {
          status: status,
          updated_at: new Date()
        }
      });

      // Create approval history entry
      await tx.courseApprovalHistory.create({
        data: {
          course_id: BigInt(courseId),
          action: workflowAction.toUpperCase(),
          from_status: 'DRAFT', // TODO: Get current status
          to_status: status,
          reviewer_id: BigInt(1), // TODO: Get from session
          reviewer_role: workflowAction === 'approve' ? 'ACADEMIC_BOARD' : 'FACULTY', // Phê duyệt: Hội đồng, Từ chối: Khoa
          comments: comment,
          created_at: new Date()
        }
      });
    }

    return { updatedCourse, updatedWorkflow, updatedContent, updatedAudit };
  }).catch((error) => {
    if (error.code === 'P2002') {
      // Unique constraint violation
      if (error.meta?.target?.includes('org_unit_id') && error.meta?.target?.includes('code')) {
        throw new Error(`Mã môn học '${courseData.code}' đã tồn tại trong đơn vị tổ chức này.`);
      }
    } else if (error.code === 'P2003') {
      // Foreign key constraint violation
      if (error.meta?.field_name?.includes('org_unit_id')) {
        throw new Error('Đơn vị tổ chức không hợp lệ.');
      }
    }
    throw error; // Re-throw other errors
  });

  return result;
};

// DELETE /api/tms/courses/[id] - Xóa course
const deleteCourse = async (id: string, request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'Authentication required', 401);
  }

  const courseId = parseInt(id);
  if (isNaN(courseId)) {
    throw new Error('Invalid course ID');
  }

  // Check if course exists
  const course = await db.course.findUnique({
    where: { id: BigInt(courseId) }
  });

  if (!course) {
    throw new Error('Course not found');
  }

  // Delete course (cascade will handle related records in course_workflows, course_contents, course_audits, etc.)
  await db.course.delete({
    where: { id: BigInt(courseId) }
  });

  return 'Course deleted successfully';
};

// Export handlers with error handling (inline)
export const GET = withIdParam(async (id: string, request: Request) => {
  return await getCourseById(id, request);
}, 'fetch course by id');

export const PUT = withIdAndBody(async (id: string, body: unknown, request: Request) => {
  return await updateCourse(id, body, request);
}, 'update course');

export const DELETE = withIdParam(async (id: string, request: Request) => {
  return await deleteCourse(id, request);
}, 'delete course');
