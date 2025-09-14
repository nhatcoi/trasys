import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal Programs schemas - match database requirements
export const CreateProgramsSchema = z.object({
  major_id: z.string().optional(), // Temporarily optional for debugging
  org_unit_id: z.string().optional(),
  version: z.string().min(1, 'Version is required'),
  total_credits: z.number().min(1, 'Total credits is required'),
  // Optional fields
  plo: z.any().optional(),
  status: z.string().default('DRAFT'),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
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
