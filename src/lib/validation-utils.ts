import { z } from 'zod';

// Common validation patterns for minimal schemas
export const CommonValidation = {
  // Basic pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100).default(20),
  }),

  // Common search
  search: z.string().optional(),

  // ID validation
  id: z.string().min(1, 'ID is required'),
};

// Helper to create minimal create schemas
export function createMinimalCreateSchema<T extends Record<string, z.ZodTypeAny>>(
  requiredFields: T,
  optionalFields: Record<string, z.ZodTypeAny> = {}
) {
  return z.object({
    ...requiredFields,
    ...optionalFields,
  });
}

// Helper to create minimal update schemas
export function createMinimalUpdateSchema<T extends Record<string, z.ZodTypeAny>>(
  requiredFields: T,
  optionalFields: Record<string, z.ZodTypeAny> = {}
) {
  return z.object({
    ...requiredFields,
    ...optionalFields,
  }).partial();
}

// Helper to create minimal query schemas
export function createMinimalQuerySchema(
  filters: Record<string, z.ZodTypeAny> = {}
) {
  return z.object({
    ...CommonValidation.pagination.shape,
    search: CommonValidation.search,
    ...filters,
  });
}

// Standard API response format
export const StandardResponse = {
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
};

// Common field validations
export const FieldValidation = {
  requiredString: z.string().min(1),
  optionalString: z.string().optional(),
  requiredNumber: z.number(),
  optionalNumber: z.number().optional(),
  requiredBoolean: z.boolean(),
  optionalBoolean: z.boolean().optional(),
  orgUnitId: z.string().min(1, 'Org unit ID is required'),
  email: z.string().email('Invalid email format'),
  date: z.string().optional(),
};
