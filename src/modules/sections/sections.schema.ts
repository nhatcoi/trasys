import { z } from 'zod';
import { createMinimalQuerySchema } from '@/lib/validation-utils';

// Minimal Sections schemas
export const CreateSectionsSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name_vi: z.string().min(1, 'Name is required'),
  org_unit_id: z.string().min(1, 'Org unit is required'),
  // Optional fields
  name_en: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default('active'),
});

export const UpdateSectionsSchema = CreateSectionsSchema.partial();

// Simple query validation
export const SectionsQuerySchema = createMinimalQuerySchema({
  org_unit_id: z.string().optional(),
  status: z.string().optional(),
});

// Export only essential types
export type CreateSectionsInput = z.infer<typeof CreateSectionsSchema>;
export type UpdateSectionsInput = z.infer<typeof UpdateSectionsSchema>;
export type SectionsQuery = z.infer<typeof SectionsQuerySchema>;
