import { ProgramPriority, ProgramStatus } from '@/constants/programs';

export interface ProgramCourseMapInput {
  course_id: number | string;
  is_required?: boolean;
  display_order?: number;
}

export interface ProgramBlockInput {
  code: string;
  title: string;
  block_type: string;
  display_order?: number;
  courses?: ProgramCourseMapInput[];
}

export interface CreateProgramInput {
  code: string;
  name_vi: string;
  name_en?: string | null;
  description?: string | null;
  version?: string;
  total_credits?: number;
  org_unit_id?: number | string;
  major_id?: number | string;
  status?: ProgramStatus;
  effective_from?: string | null;
  effective_to?: string | null;
  plo?: Record<string, unknown> | null;
  priority?: ProgramPriority;
  blocks?: ProgramBlockInput[];
  standalone_courses?: ProgramCourseMapInput[];
}

export type UpdateProgramInput = Partial<CreateProgramInput>;

export interface ProgramQueryInput {
  page?: number;
  limit?: number;
  status?: ProgramStatus | string;
  orgUnitId?: number;
  search?: string;
  priority?: ProgramPriority | string;
}
