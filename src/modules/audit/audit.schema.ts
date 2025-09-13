import { z } from 'zod';

// Audit Action Schema
export const AuditActionSchema = z.enum([
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'approve',
  'reject',
  'export',
  'import',
  'config_change'
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

// Audit Entity Type Schema
export const AuditEntityTypeSchema = z.enum([
  'org_unit',
  'employee',
  'user',
  'role',
  'permission',
  'workflow',
  'config',
  'system'
]);

export type AuditEntityType = z.infer<typeof AuditEntityTypeSchema>;

// Audit Log Schema
export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  action: AuditActionSchema,
  entityType: AuditEntityTypeSchema,
  entityId: z.string(),
  entityName: z.string().optional(),
  entityCode: z.string().optional(),
  userId: z.string(),
  userName: z.string(),
  userRole: z.string(),
  userEmail: z.string().optional(),
  ipAddress: z.string(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  details: z.object({
    changes: z.record(z.object({
      from: z.any().optional(),
      to: z.any().optional(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
    reason: z.string().optional(),
    workflowStep: z.string().optional(),
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  isSuccess: z.boolean().default(true),
  errorMessage: z.string().optional(),
  duration: z.number().optional(), // in milliseconds
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// Audit Log with Relations Schema
export const AuditLogWithRelationsSchema = AuditLogSchema.extend({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }).optional(),
  entity: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string().optional(),
    type: z.string(),
  }).optional(),
});

export type AuditLogWithRelations = z.infer<typeof AuditLogWithRelationsSchema>;

// Input Schemas
export const CreateAuditLogInputSchema = z.object({
  action: AuditActionSchema,
  entityType: AuditEntityTypeSchema,
  entityId: z.string(),
  entityName: z.string().optional(),
  entityCode: z.string().optional(),
  userId: z.string(),
  userName: z.string(),
  userRole: z.string(),
  userEmail: z.string().optional(),
  ipAddress: z.string(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  details: z.object({
    changes: z.record(z.object({
      from: z.any().optional(),
      to: z.any().optional(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
    reason: z.string().optional(),
    workflowStep: z.string().optional(),
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  isSuccess: z.boolean().default(true),
  errorMessage: z.string().optional(),
  duration: z.number().optional(),
});

export type CreateAuditLogInput = z.infer<typeof CreateAuditLogInputSchema>;

// Query Schemas
export const AuditLogQuerySchema = z.object({
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(10),
  sort: z.string().default('timestamp'),
  order: z.enum(['asc', 'desc']).default('desc'),
  action: AuditActionSchema.optional(),
  entityType: AuditEntityTypeSchema.optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  userRole: z.string().optional(),
  ipAddress: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  isSuccess: z.boolean().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  search: z.string().optional(),
});

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;

// Audit Statistics Schema
export const AuditStatisticsSchema = z.object({
  totalLogs: z.number(),
  logsByAction: z.record(z.number()),
  logsByEntityType: z.record(z.number()),
  logsByUser: z.record(z.number()),
  logsBySeverity: z.record(z.number()),
  successRate: z.number(),
  averageResponseTime: z.number(),
  topUsers: z.array(z.object({
    userId: z.string(),
    userName: z.string(),
    count: z.number(),
  })),
  topEntities: z.array(z.object({
    entityType: z.string(),
    entityId: z.string(),
    entityName: z.string(),
    count: z.number(),
  })),
  timeRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

export type AuditStatistics = z.infer<typeof AuditStatisticsSchema>;

// Audit Report Schema
export const AuditReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  query: AuditLogQuerySchema,
  generatedBy: z.string(),
  generatedAt: z.date(),
  format: z.enum(['csv', 'excel', 'pdf', 'json']).default('csv'),
  status: z.enum(['pending', 'generating', 'completed', 'failed']).default('pending'),
  fileUrl: z.string().optional(),
  fileSize: z.number().optional(),
  expiresAt: z.date().optional(),
});

export type AuditReport = z.infer<typeof AuditReportSchema>;

// Audit Configuration Schema
export const AuditConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  retentionDays: z.number().default(365),
  logLevel: z.enum(['all', 'medium_high', 'high_critical']).default('all'),
  includeMetadata: z.boolean().default(true),
  includeUserAgent: z.boolean().default(false),
  includeRequestBody: z.boolean().default(false),
  excludeActions: z.array(AuditActionSchema).default([]),
  excludeEntityTypes: z.array(AuditEntityTypeSchema).default([]),
  excludeUsers: z.array(z.string()).default([]),
  ipWhitelist: z.array(z.string()).default([]),
  ipBlacklist: z.array(z.string()).default([]),
  realTimeAlerts: z.boolean().default(false),
  alertThreshold: z.number().default(100), // logs per minute
  alertRecipients: z.array(z.string()).default([]),
});

export type AuditConfig = z.infer<typeof AuditConfigSchema>;

// Audit Alert Schema
export const AuditAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['threshold_exceeded', 'suspicious_activity', 'failed_login', 'data_breach']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  message: z.string(),
  details: z.record(z.any()),
  isResolved: z.boolean().default(false),
  resolvedBy: z.string().optional(),
  resolvedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AuditAlert = z.infer<typeof AuditAlertSchema>;
