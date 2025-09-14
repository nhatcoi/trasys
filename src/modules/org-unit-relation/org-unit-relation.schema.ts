import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal OrgUnitRelation schemas
export const CreateOrgUnitRelationSchema = z.object({
  parent_id: z.string().min(1, 'Parent ID is required'),
  child_id: z.string().min(1, 'Child ID is required'),
  relation_type: z.enum(['direct', 'advisory', 'support', 'collab']),
  effective_from: z.string().optional(),
  effective_to: z.string().nullable().optional(),
  note: z.string().optional(),
});

export const UpdateOrgUnitRelationSchema = z.object({
  relation_type: z.enum(['direct', 'advisory', 'support', 'collab']).optional(),
  effective_from: z.string().optional(),
  effective_to: z.string().nullable().optional(),
  note: z.string().optional(),
});

// Simple query validation
export const OrgUnitRelationQuerySchema = createMinimalQuerySchema({
  parent_id: z.string().optional(),
  child_id: z.string().optional(),
  relation_type: z.enum(['direct', 'advisory', 'support', 'collab']).optional(),
});

// Export only essential types
export type CreateOrgUnitRelationInput = z.infer<typeof CreateOrgUnitRelationSchema>;
export type UpdateOrgUnitRelationInput = z.infer<typeof UpdateOrgUnitRelationSchema>;
export type OrgUnitRelationQuery = z.infer<typeof OrgUnitRelationQuerySchema>;

