import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandling } from '@/lib/api/api-handler';
import {
  CourseStatus,
  CourseType,
  WorkflowStage,
  normalizeCoursePriority,
} from '@/constants/courses';

// Public API endpoints không cần authentication để demo

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const statusParam = searchParams.get('status');
  const normalizedStatus = statusParam?.toUpperCase();
  const search = searchParams.get('search') || undefined;
  const orgUnitId = searchParams.get('orgUnitId');
  const workflowStageParam = searchParams.get('workflowStage');
  const normalizedWorkflowStage = workflowStageParam?.toUpperCase();
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
  if (normalizedStatus && (Object.values(CourseStatus) as string[]).includes(normalizedStatus)) {
    where.status = normalizedStatus as CourseStatus;
  }
  if (normalizedWorkflowStage && (Object.values(WorkflowStage) as string[]).includes(normalizedWorkflowStage)) {
    where.workflows = {
      some: { workflow_stage: normalizedWorkflowStage as WorkflowStage }
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
        status: (course.workflows?.[0]?.status || CourseStatus.DRAFT) as CourseStatus,
        workflow_stage: (course.workflows?.[0]?.workflow_stage || WorkflowStage.FACULTY) as WorkflowStage,
        workflow_priority: normalizeCoursePriority(course.workflows?.[0]?.priority).toLowerCase(),
        
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
}, 'fetch public courses');

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const courseData = body as any;

  // Basic validation
  if (!courseData.code || !courseData.name_vi || !courseData.credits || !courseData.org_unit_id || !courseData.type) {
    throw new Error('Missing required fields: code, name_vi, credits, org_unit_id, type');
  }

  // Get next available ID
  const lastCourse = await db.course.findFirst({
    orderBy: { id: 'desc' }
  });
  const nextId = lastCourse ? lastCourse.id + BigInt(1) : BigInt(1);

  const prerequisitesString = courseData.prerequisites?.map(p => typeof p === 'string' ? p : p.label).join(', ') || null;
  const workflowPriorityValue = normalizeCoursePriority(courseData.workflow_priority).toLowerCase();
  const courseTypeValue = (Object.values(CourseType) as string[]).includes(courseData.type)
    ? (courseData.type as CourseType)
    : CourseType.THEORY;

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
        type: courseTypeValue,
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
        status: CourseStatus.DRAFT,
        workflow_stage: WorkflowStage.FACULTY,
        priority: workflowPriorityValue,
        notes: courseData.workflow_notes || null,
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
        prerequisites: prerequisitesString,
        learning_objectives: courseData.learning_objectives || null,
        assessment_methods: courseData.assessment_methods || null,
        passing_grade: courseData.passing_grade || 5.0,
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
        created_by: BigInt(1), // Demo user
        updated_by: BigInt(1),
      }
    });

    return { course, workflow, content, audit };
  }).catch((error) => {
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('org_unit_id') && error.meta?.target?.includes('code')) {
        throw new Error(`Mã môn học '${courseData.code}' đã tồn tại trong đơn vị tổ chức này.`);
      }
    } else if (error.code === 'P2003') {
      if (error.meta?.field_name?.includes('org_unit_id')) {
        throw new Error('Đơn vị tổ chức không hợp lệ.');
      }
    }
    throw error;
  });

  return {
    message: 'Course created successfully',
    data: result
  };
}, 'create public course');
