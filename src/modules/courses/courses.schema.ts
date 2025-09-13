import { z } from 'zod';
import { FieldValidation, createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal course schemas - only essential fields
export const CreateCourseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name_vi: z.string().min(1, 'Name is required'),
  org_unit_id: FieldValidation.orgUnitId,
  credits: z.number().min(1, 'Credits must be positive'),
  // Optional fields
  name_en: FieldValidation.optionalString,
  type: z.string().default('theory'),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

// Simple query validation
export const CourseQuerySchema = createMinimalQuerySchema({
  org_unit_id: z.string().optional(),
  type: z.string().optional(),
});

// Export only essential types
export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type CourseQuery = z.infer<typeof CourseQuerySchema>;
