import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal OrgStructureRequest schemas
export const CreateOrgStructureRequestSchema = z.object({
  request_type: z.string().min(1, 'Request type is required'),
  requester_id: z.string().optional(),
  target_org_unit_id: z.string().optional(),
  payload: z.any(), // JSON field - required
  status: z.string().default('SUBMITTED'),
  workflow_step: z.number().default(1),
});

export const UpdateOrgStructureRequestSchema = CreateOrgStructureRequestSchema.partial();

// Simple query validation
export const OrgStructureRequestQuerySchema = createMinimalQuerySchema({
  org_unit_id: z.string().optional(),
  request_type: z.string().optional(),
  status: z.string().optional(),
});

// Export only essential types
export type CreateOrgStructureRequestInput = z.infer<typeof CreateOrgStructureRequestSchema>;
export type UpdateOrgStructureRequestInput = z.infer<typeof UpdateOrgStructureRequestSchema>;
export type OrgStructureRequestQuery = z.infer<typeof OrgStructureRequestQuerySchema>;
