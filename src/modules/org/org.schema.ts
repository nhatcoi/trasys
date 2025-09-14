import { z } from 'zod';

// Input schemas for validation
export const CreateOrgUnitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parent_id: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  campus_id: z.string().optional(),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
});

export const UpdateOrgUnitSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  parent_id: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  campus_id: z.string().optional(),
  effective_from: z.string().optional(),
  effective_to: z.string().nullable().optional(),
});

// Params validation schema
export const OrgUnitParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), {
    message: "ID must be a valid number"
  }),
});

// Query options schema for API search/filter
export const OrgUnitQuerySchema = z.object({
  // Pagination
  page: z.number().min(1).optional().default(1),
  size: z.number().min(1).max(1000).optional().default(100),
  
  // Sorting
  sort: z.string().optional().default('parent_id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  
  // Search & Filter
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  
  // Date range
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  
  // Fetch options (relations)
  include_children: z.boolean().optional().default(false),
  include_employees: z.boolean().optional().default(false),
  include_parent: z.boolean().optional().default(false),
});

// Output schemas for DTOs - accept string from BigInt serialization
export const OrgUnitSchema = z.object({
  id: z.string(), // Accept string from BigInt serialization
  name: z.string(),
  code: z.string(),
  parent_id: z.string().nullable(), // Accept string from BigInt serialization
  type: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  effective_from: z.string().nullable(),
  effective_to: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schema for OrgUnitRelation
export const OrgUnitRelationSchema = z.object({
  parent_id: z.string(),
  child_id: z.string(),
  relation_type: z.enum(['direct', 'advisory', 'support', 'collab']),
  effective_from: z.string(),
  effective_to: z.string().nullable(),
  note: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schema for OrgUnitHistory
export const OrgUnitHistorySchema = z.object({
  id: z.string(),
  org_unit_id: z.string(),
  old_name: z.string().nullable(),
  new_name: z.string().nullable(),
  change_type: z.string(),
  details: z.any().nullable(), // JSON field
  changed_at: z.string().nullable(),
});

export const OrgUnitWithRelationsSchema = OrgUnitSchema.extend({
  children: z.array(OrgUnitSchema).optional(),
  parent: OrgUnitSchema.optional(),
  employees: z.array(z.object({
    id: z.string(), // Accept string from BigInt serialization
    name: z.string().optional(),
    code: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    position: z.string().optional(),
    status: z.string().optional(),
  })).optional(),
  // Relations where this unit is a child
  parentRelations: z.array(OrgUnitRelationSchema.extend({
    parent: OrgUnitSchema,
  })).optional(),
  // Relations where this unit is a parent
  childRelations: z.array(OrgUnitRelationSchema.extend({
    child: OrgUnitSchema,
  })).optional(),
});

export type CreateOrgUnitInput = z.infer<typeof CreateOrgUnitSchema>;
export type UpdateOrgUnitInput = z.infer<typeof UpdateOrgUnitSchema>;
export type OrgUnitParams = z.infer<typeof OrgUnitParamsSchema>;
export type OrgUnitQuery = z.infer<typeof OrgUnitQuerySchema>;
export type OrgUnit = z.infer<typeof OrgUnitSchema>;
export type OrgUnitWithRelations = z.infer<typeof OrgUnitWithRelationsSchema>;
