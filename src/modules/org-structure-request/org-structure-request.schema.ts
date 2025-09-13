import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal OrgStructureRequest schemas
export const CreateOrgStructureRequestSchema = z.object({
  request_type: z.string().min(1, 'Request type is required'),
  org_unit_id: z.string().min(1, 'Org unit ID is required'),
  // Optional fields
  status: z.string().default('pending'),
  description: z.string().optional(),
  requested_by: z.string().optional(),
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
