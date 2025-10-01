import { withIdParam, withIdAndBody, createErrorResponse } from '@/lib/api/api-handler';
import { db } from '@/lib/db';
import { ProgramPriority, ProgramStatus, normalizeProgramPriority } from '@/constants/programs';
import { UpdateProgramInput } from '@/lib/api/schemas/program';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

const CONTEXT_GET = 'get program';
const CONTEXT_UPDATE = 'update program';
const CONTEXT_DELETE = 'delete program';

const selectProgramDetail = {
  id: true,
  code: true,
  name_vi: true,
  name_en: true,
  description: true,
  version: true,
  total_credits: true,
  status: true,
  plo: true,
  effective_from: true,
  effective_to: true,
  created_at: true,
  updated_at: true,
  org_unit_id: true,
  major_id: true,
  OrgUnit: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  ProgramBlock: {
    select: {
      id: true,
      code: true,
      title: true,
      block_type: true,
      display_order: true,
      ProgramCourseMap: {
        select: {
          id: true,
          course_id: true,
          is_required: true,
          display_order: true,
          group_id: true,
          Course: {
            select: {
              id: true,
              code: true,
              name_vi: true,
              credits: true,
            },
          },
        },
        orderBy: { display_order: 'asc' },
      },
      ProgramBlockGroup: {
        select: {
          id: true,
          code: true,
          title: true,
          group_type: true,
          display_order: true,
          ProgramBlockGroupRule: {
            select: {
              id: true,
              min_credits: true,
              max_credits: true,
              min_courses: true,
              max_courses: true,
            },
            orderBy: { id: 'asc' },
          },
        },
        orderBy: { display_order: 'asc' },
      },
    },
    orderBy: { display_order: 'asc' },
  },
  ProgramCourseMap: {
    where: { block_id: null },
    select: {
      id: true,
      course_id: true,
      is_required: true,
      display_order: true,
      group_id: true,
      Course: {
        select: {
          id: true,
          code: true,
          name_vi: true,
          credits: true,
        },
      },
    },
    orderBy: { display_order: 'asc' },
  },
  _count: {
    select: {
      StudentAcademicProgress: true,
      ProgramBlock: true,
      ProgramCourseMap: true,
    },
  },
} as const;

export const GET = withIdParam(async (id: string) => {
  const programId = Number(id);
  if (Number.isNaN(programId)) {
    throw new Error('Invalid program id');
  }

  const program = await db.program.findUnique({
    where: { id: BigInt(programId) },
    select: selectProgramDetail,
  });

  if (!program) {
    throw new Error('Program not found');
  }

  return {
    ...program,
    status: (program.status ?? ProgramStatus.DRAFT) as ProgramStatus,
    stats: {
      student_count: program._count?.StudentAcademicProgress ?? 0,
      block_count: program._count?.ProgramBlock ?? 0,
      course_count: program._count?.ProgramCourseMap ?? 0,
    },
    priority: ProgramPriority.MEDIUM,
  };
}, CONTEXT_GET);

export const PATCH = withIdAndBody(async (id: string, body: unknown) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'Authentication required', 401);
  }

  const programId = Number(id);
  if (Number.isNaN(programId)) {
    throw new Error('Invalid program id');
  }

  const payload = body as UpdateProgramInput;

  const data: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (payload.code) data.code = payload.code;
  if (payload.name_vi) data.name_vi = payload.name_vi;
  if (payload.name_en !== undefined) data.name_en = payload.name_en || null;
  if (payload.description !== undefined) data.description = payload.description || null;
  if (payload.version) data.version = payload.version;
  if (payload.total_credits !== undefined) data.total_credits = payload.total_credits;
  if (payload.status) data.status = payload.status;
  if (payload.plo !== undefined) data.plo = payload.plo;
  if (payload.effective_from !== undefined) {
    data.effective_from = payload.effective_from ? new Date(payload.effective_from) : null;
  }
  if (payload.effective_to !== undefined) {
    data.effective_to = payload.effective_to ? new Date(payload.effective_to) : null;
  }
  if (payload.org_unit_id !== undefined) {
    const orgUnitId = payload.org_unit_id ? BigInt(Number(payload.org_unit_id)) : null;
    data.org_unit_id = orgUnitId;
  }
  if (payload.major_id !== undefined) {
    const majorId = payload.major_id ? BigInt(Number(payload.major_id)) : null;
    data.major_id = majorId;
  }

  const result = await db.$transaction(async (tx) => {
    await tx.program.update({
      where: { id: BigInt(programId) },
      data,
    });

    const shouldReplaceStructure = Array.isArray(payload.blocks) || Array.isArray(payload.standalone_courses);
    let blockCountOverride: number | null = null;
    let courseCountOverride: number | null = null;

    if (shouldReplaceStructure) {
      await tx.programCourseMap.deleteMany({ where: { program_id: BigInt(programId) } });
      await tx.programBlock.deleteMany({ where: { program_id: BigInt(programId) } });

      const blocksInput = Array.isArray(payload.blocks) ? payload.blocks : [];
      const standaloneInput = Array.isArray(payload.standalone_courses) ? payload.standalone_courses : [];

      let blockCounter = 0;
      let courseCounter = 0;

      for (let index = 0; index < blocksInput.length; index += 1) {
        const blockInput = blocksInput[index];
        const createdBlock = await tx.programBlock.create({
          data: {
            program_id: BigInt(programId),
            code: blockInput.code?.toString().trim() || `BLOCK-${index + 1}`,
            title: blockInput.title?.toString().trim() || `Khối học phần ${index + 1}`,
            block_type: blockInput.block_type?.toString().trim() || 'core',
            display_order:
              blockInput.display_order != null
                ? Math.max(1, blockInput.display_order)
                : index + 1,
          },
        });
        blockCounter += 1;

        if (Array.isArray(blockInput.courses)) {
          for (let courseIndex = 0; courseIndex < blockInput.courses.length; courseIndex += 1) {
            const courseInput = blockInput.courses[courseIndex];
            const numericCourseId = Number(courseInput.course_id);
            if (Number.isNaN(numericCourseId)) continue;

            await tx.programCourseMap.create({
              data: {
                program_id: BigInt(programId),
                course_id: BigInt(numericCourseId),
                block_id: createdBlock.id,
                is_required: courseInput.is_required ?? true,
                display_order:
                  courseInput.display_order != null
                    ? Math.max(1, courseInput.display_order)
                    : courseIndex + 1,
              },
            });
            courseCounter += 1;
          }
        }
      }

      for (let index = 0; index < standaloneInput.length; index += 1) {
        const courseInput = standaloneInput[index];
        const numericCourseId = Number(courseInput.course_id);
        if (Number.isNaN(numericCourseId)) continue;

        await tx.programCourseMap.create({
          data: {
            program_id: BigInt(programId),
            course_id: BigInt(numericCourseId),
            block_id: null,
            is_required: courseInput.is_required ?? true,
            display_order:
              courseInput.display_order != null
                ? Math.max(1, courseInput.display_order)
                : index + 1,
          },
        });
        courseCounter += 1;
      }

      blockCountOverride = blockCounter;
      courseCountOverride = courseCounter;
    }

    const program = await tx.program.findUnique({
      where: { id: BigInt(programId) },
      select: selectProgramDetail,
    });

    if (!program) {
      throw new Error('Program not found after update');
    }

    return {
      program,
      blockCount: blockCountOverride ?? program._count?.ProgramBlock ?? 0,
      courseCount: courseCountOverride ?? program._count?.ProgramCourseMap ?? 0,
    };
  });

  return {
    ...result.program,
    status: (result.program.status ?? ProgramStatus.DRAFT) as ProgramStatus,
    stats: {
      student_count: result.program._count?.StudentAcademicProgress ?? 0,
      block_count: result.blockCount,
      course_count: result.courseCount,
    },
    priority: normalizeProgramPriority(payload.priority || ProgramPriority.MEDIUM),
  };
}, CONTEXT_UPDATE);

export const DELETE = withIdParam(async (id: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'Authentication required', 401);
  }

  const programId = Number(id);
  if (Number.isNaN(programId)) {
    throw new Error('Invalid program id');
  }

  await db.program.delete({
    where: { id: BigInt(programId) },
  });

  return { success: true };
}, CONTEXT_DELETE);
