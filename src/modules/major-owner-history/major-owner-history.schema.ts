import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal MajorOwnerHistory schemas
export const CreateMajorOwnerHistorySchema = z.object({
  major_id: z.string().min(1, 'Major ID is required'),
  org_unit_id: z.string().min(1, 'Org unit ID is required'),
  // Optional fields
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateMajorOwnerHistorySchema = CreateMajorOwnerHistorySchema.partial();

// Simple query validation
export const MajorOwnerHistoryQuerySchema = createMinimalQuerySchema({
  major_id: z.string().optional(),
  org_unit_id: z.string().optional(),
});

// Export only essential types
export type CreateMajorOwnerHistoryInput = z.infer<typeof CreateMajorOwnerHistorySchema>;
export type UpdateMajorOwnerHistoryInput = z.infer<typeof UpdateMajorOwnerHistorySchema>;
export type MajorOwnerHistoryQuery = z.infer<typeof MajorOwnerHistoryQuerySchema>;
