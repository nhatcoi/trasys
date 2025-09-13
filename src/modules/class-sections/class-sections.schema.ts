import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal class section schemas
export const CreateClassSectionSchema = z.object({
  course_id: z.string().min(1, 'Course ID is required'),
  term_academic_id: z.string().min(1, 'Term ID is required'),
  // Optional fields
  course_version_id: z.string().optional(),
  section_code: z.string().optional(),
  capacity: z.number().optional(),
  org_unit_id: z.string().optional(),
});

export const UpdateClassSectionSchema = CreateClassSectionSchema.partial();

// Simple query validation
export const ClassSectionQuerySchema = createMinimalQuerySchema({
  course_id: z.string().optional(),
  org_unit_id: z.string().optional(),
  term_academic_id: z.string().optional(),
});

// Export only essential types
export type CreateClassSectionInput = z.infer<typeof CreateClassSectionSchema>;
export type UpdateClassSectionInput = z.infer<typeof UpdateClassSectionSchema>;
export type ClassSectionQuery = z.infer<typeof ClassSectionQuerySchema>;
