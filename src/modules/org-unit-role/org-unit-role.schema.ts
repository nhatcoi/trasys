import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal org unit role schemas
export const CreateOrgUnitRoleSchema = z.object({
  role_code: z.string().min(1, 'Role code is required'),
  // Optional fields
  org_unit_id: z.string().optional(),
  title: z.string().optional(),
});

export const UpdateOrgUnitRoleSchema = CreateOrgUnitRoleSchema.partial();

// Simple query validation
export const OrgUnitRoleQuerySchema = createMinimalQuerySchema({
  org_unit_id: z.string().optional(),
  role_code: z.string().optional(),
});

// Export only essential types
export type CreateOrgUnitRoleInput = z.infer<typeof CreateOrgUnitRoleSchema>;
export type UpdateOrgUnitRoleInput = z.infer<typeof UpdateOrgUnitRoleSchema>;
export type OrgUnitRoleQuery = z.infer<typeof OrgUnitRoleQuerySchema>;
