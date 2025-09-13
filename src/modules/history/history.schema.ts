import { z } from 'zod';

// Query schema for history filtering
export const HistoryQuerySchema = z.object({
  org_unit_id: z.string().optional(),
  change_type: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(20),
  sort: z.enum(['changed_at', 'change_type']).default('changed_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
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

export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;
export type OrgUnitHistory = z.infer<typeof OrgUnitHistorySchema>;
