import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal Programs schemas
export const CreateProgramsSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name_vi: z.string().min(1, 'Name is required'),
  org_unit_id: z.string().min(1, 'Org unit is required'),
  // Optional fields
  name_en: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default('active'),
});

export const UpdateProgramsSchema = CreateProgramsSchema.partial();

// Simple query validation
export const ProgramsQuerySchema = createMinimalQuerySchema({
  org_unit_id: z.string().optional(),
  status: z.string().optional(),
});

// Export only essential types
export type CreateProgramsInput = z.infer<typeof CreateProgramsSchema>;
export type UpdateProgramsInput = z.infer<typeof UpdateProgramsSchema>;
export type ProgramsQuery = z.infer<typeof ProgramsQuerySchema>;
