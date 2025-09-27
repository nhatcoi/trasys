import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { withErrorHandling, withBody, createSuccessResponse, createErrorResponse } from '@/lib/api/api-handler';
import { CreateCourseInput, CourseQueryInput } from '@/lib/api/schemas/course';


// GET /api/tms/courses
export const GET = withErrorHandling(
  async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || undefined;
    const orgUnitId = searchParams.get('orgUnitId');
    const workflowStage = searchParams.get('workflowStage');
    const listMode = searchParams.get('list') === 'true';

    const skip = (page - 1) * limit;

    // Build WHERE conditions
    const where: any = {};
    if (orgUnitId) where.org_unit_id = parseInt(orgUnitId);
    if (search) {
        where.OR = [
        { name_vi: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
        ];
    }
    
    // Filter by course status and workflow stage
    if (status) {
        where.status = status;
    }
    if (workflowStage) {
        where.workflows = {
            some: { workflow_stage: workflowStage }
        };
    }

    // Get total count and courses
    const [total, courses] = await Promise.all([
        db.course.count({ where }),
        db.course.findMany({
        where,
        select: listMode ? {
            id: true,
            code: true,
            name_vi: true,
            name_en: true,
            credits: true,
            type: true
        } : undefined,
        include: listMode ? undefined : {
            OrgUnit: {
            select: { name: true }
            },
            workflows: {
            select: { status: true, workflow_stage: true, priority: true }
            },
            contents: {
            select: { prerequisites: true, passing_grade: true }
            },
            audits: {
            select: { created_by: true, created_at: true }
            }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
        })
    ]);

    // Serialize BigInt values and flatten structure
    const serializedCourses = listMode 
        ? courses.map(course => ({
            id: course.id.toString(),
            code: course.code,
            name_vi: course.name_vi,
            name_en: course.name_en || '',
            credits: parseFloat(course.credits.toString()),
            type: course.type,
            label: `${course.code} - ${course.name_vi}`,
            value: `${course.code} - ${course.name_vi}`
        }))
        : courses.map(course => ({
            ...course,
            id: course.id.toString(),
            org_unit_id: course.org_unit_id.toString(),
            credits: parseFloat(course.credits.toString()),
            
            // Flatten workflow data
            status: course.workflows?.[0]?.status || 'DRAFT',
            workflow_stage: course.workflows?.[0]?.workflow_stage || 'FACULTY',
            workflow_priority: course.workflows?.[0]?.priority || 'medium',
            
            // Flatten content data
            prerequisites: course.contents?.[0]?.prerequisites || null,
            learning_objectives: course.contents?.[0]?.learning_objectives || null,
            assessment_methods: course.contents?.[0]?.assessment_methods || null,
            passing_grade: course.contents?.[0]?.passing_grade ? parseFloat(course.contents[0].passing_grade.toString()) : null,
            
            // Flatten audit data
            created_by: course.audits?.[0]?.created_by?.toString() || null,
            created_at: course.audits?.[0]?.created_at || course.created_at,
            
            // OrgUnit data
            OrgUnit: course.OrgUnit ? {
            ...course.OrgUnit,
            id: course.OrgUnit.id?.toString()
            } : null,
            
            // Remove nested arrays for cleaner response
            workflows: undefined,
            contents: undefined,
            audits: undefined
        }));

    return {
        items: serializedCourses,
        pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
        }
    };
  },
  'fetch courses'
);


// POST /api/tms/courses 
export const POST = withBody(
  async (body: unknown, request: Request) => {
    // Temporarily use admin id = 1 instead of session
    const userId = BigInt(1); // Default admin user

    const courseData = body as CreateCourseInput;

    // Basic validation
    if (!courseData.code || !courseData.name_vi || !courseData.credits || !courseData.org_unit_id || !courseData.type) {
      throw new Error('Missing required fields: code, name_vi, credits, org_unit_id, type');
    }

    const prerequisitesName = courseData.prerequisites?.map(p => 
      typeof p === 'string' ? p : p.name_vi || p.label
    ).join(', ') || null;

    // Get next available ID
    const lastCourse = await db.course.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextId = lastCourse ? lastCourse.id + BigInt(1) : BigInt(1);

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
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // 2. Create CourseWorkflow record
      const lastWorkflow = await tx.courseWorkflow.findFirst({
        orderBy: { id: 'desc' }
      });
      const nextWorkflowId = lastWorkflow ? lastWorkflow.id + BigInt(1) : BigInt(1);
      
      const workflow = await tx.courseWorkflow.create({
        data: {
          id: nextWorkflowId,
          course_id: course.id,
          status: 'DRAFT',
          workflow_stage: 'FACULTY',
          priority: courseData.workflow_priority || 'medium',
          notes: courseData.workflow_notes || null,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // 3. Create CourseContent record
      const lastContent = await tx.courseContent.findFirst({
        orderBy: { id: 'desc' }
      });
      const nextContentId = lastContent ? lastContent.id + BigInt(1) : BigInt(1);
      
      const content = await tx.courseContent.create({
        data: {
          id: nextContentId,
          course_id: course.id,
          prerequisites: prerequisitesName,
          learning_objectives: courseData.learning_objectives || null,
          assessment_methods: courseData.assessment_methods || null,
          passing_grade: courseData.passing_grade || 5.0,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // 4. Create CourseAudit record
      const lastAudit = await tx.courseAudit.findFirst({
        orderBy: { id: 'desc' }
      });
      const nextAuditId = lastAudit ? lastAudit.id + BigInt(1) : BigInt(1);
      
      const audit = await tx.courseAudit.create({
        data: {
          id: nextAuditId,
          course_id: course.id,
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // 5. Create CourseVersion record (Version 1)
      const courseVersion = await tx.courseVersion.create({
        data: {
          course_id: course.id,
          version: "1",
          status: "DRAFT",
          effective_from: new Date(),
          effective_to: null,
        }
      });

      // 6. Create CoursePrerequisites records if provided
      let prerequisites = [];
      if (courseData.prerequisites && Array.isArray(courseData.prerequisites) && courseData.prerequisites.length > 0) {
        for (const prereq of courseData.prerequisites) {
          const prereqId = typeof prereq === 'string' ? prereq : (prereq.value || prereq.id);
          if (!prereqId) {
            console.error('Invalid prerequisite ID:', prereq);
            continue;
          }
          const prerequisite = await tx.coursePrerequisites.create({
            data: {
              course_id: course.id,
              prerequisite_course_id: BigInt(prereqId),
              prerequisite_type: "RECOMMENDED", // Required field
              min_grade: 5.0,
              description: "Prerequisite course",
              created_at: new Date(),
            }
          });
          prerequisites.push(prerequisite);
        }
      }

      // 7. Create CourseSyllabus records if provided
      let syllabusEntries = [];
      if (courseData.syllabus && Array.isArray(courseData.syllabus) && courseData.syllabus.length > 0) {
        for (const week of courseData.syllabus) {
          const syllabusEntry = await tx.courseSyllabus.create({
            data: {
              course_version_id: courseVersion.id,
              week_number: week.week,
              topic: week.topic,
              teaching_methods: week.teaching_methods || null,
              materials: week.materials,
              assignments: week.assignments,
              duration_hours: week.duration_hours || 3.0,
              is_exam_week: week.is_exam_week || false,
              created_by: BigInt(1), // Default admin user
              created_at: new Date(),
            }
          });
          syllabusEntries.push(syllabusEntry);
        }
      }

      return { 
        course, 
        workflow, 
        content, 
        audit, 
        courseVersion, 
        prerequisites, 
        syllabusEntries 
      };
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

    return {
      message: 'Course created successfully',
      data: result
    };
  },
  'create course'
);
