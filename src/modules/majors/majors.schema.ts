import { z } from 'zod';

// Minimal schemas - only validate essential fields
export const CreateMajorSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name_vi: z.string().min(1, 'Name is required'),
  org_unit_id: z.string().min(1, 'Org unit is required'),
  degree_level: z.string().min(1, 'Degree level is required'),
  // Optional fields with defaults
  name_en: z.string().optional(),
  short_name: z.string().optional(),
  status: z.string().default('active'),
  duration_years: z.number().default(4.0),
});

export const UpdateMajorSchema = CreateMajorSchema.partial();

// Simple query validation
export const MajorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(100).default(20),
  org_unit_id: z.string().optional(),
  search: z.string().optional(),
});

// Export only essential types
export type CreateMajorInput = z.infer<typeof CreateMajorSchema>;
export type UpdateMajorInput = z.infer<typeof UpdateMajorSchema>;
export type MajorQuery = z.infer<typeof MajorQuerySchema>;
