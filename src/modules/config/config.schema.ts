import { z } from 'zod';

// Configuration Category Schema
export const ConfigCategorySchema = z.enum([
  'system',
  'organization',
  'workflow',
  'security',
  'notification',
  'integration',
  'ui',
  'backup'
]);

export type ConfigCategory = z.infer<typeof ConfigCategorySchema>;

// Configuration Type Schema
export const ConfigTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'json',
  'array',
  'object',
  'date',
  'enum'
]);

export type ConfigType = z.infer<typeof ConfigTypeSchema>;

// Configuration Item Schema
export const ConfigItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: ConfigCategorySchema,
  type: ConfigTypeSchema,
  value: z.any(),
  defaultValue: z.any(),
  options: z.array(z.any()).optional(), // For enum type
  validation: z.object({
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    custom: z.string().optional(), // Custom validation function name
  }).optional(),
  isPublic: z.boolean().default(false), // Can be accessed by frontend
  isEncrypted: z.boolean().default(false),
  isReadOnly: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  version: z.number().default(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string(),
});

export type ConfigItem = z.infer<typeof ConfigItemSchema>;

// Organization Unit Type Schema
export const OrgUnitTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  properties: z.record(z.any()).optional(), // Additional properties
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrgUnitType = z.infer<typeof OrgUnitTypeSchema>;

// Organization Unit Status Schema
export const OrgUnitStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  isDeletable: z.boolean().default(true),
  isEditable: z.boolean().default(true),
  sortOrder: z.number().default(0),
  workflowRequired: z.boolean().default(false),
  properties: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrgUnitStatus = z.infer<typeof OrgUnitStatusSchema>;

// Workflow Configuration Schema
export const WorkflowConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  requireApproval: z.boolean().default(true),
  autoApproval: z.boolean().default(false),
  approvalLevels: z.number().min(1).max(5).default(2),
  notificationEnabled: z.boolean().default(true),
  escalationEnabled: z.boolean().default(false),
  escalationDays: z.number().min(1).max(30).default(7),
  escalationRoles: z.array(z.string()).default([]),
  timeoutDays: z.number().min(1).max(90).default(30),
  allowRejection: z.boolean().default(true),
  allowWithdrawal: z.boolean().default(true),
  requireComments: z.boolean().default(false),
  commentMaxLength: z.number().default(500),
  attachmentsEnabled: z.boolean().default(false),
  maxAttachments: z.number().default(5),
  allowedFileTypes: z.array(z.string()).default(['pdf', 'doc', 'docx', 'jpg', 'png']),
  maxFileSize: z.number().default(10 * 1024 * 1024), // 10MB
  auditTrail: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

// Security Configuration Schema
export const SecurityConfigSchema = z.object({
  id: z.string(),
  auditLogEnabled: z.boolean().default(true),
  auditRetentionDays: z.number().min(30).max(3650).default(365),
  ipWhitelistEnabled: z.boolean().default(false),
  ipWhitelist: z.array(z.string()).default([]),
  ipBlacklist: z.array(z.string()).default([]),
  sessionTimeout: z.number().min(5).max(480).default(30), // minutes
  maxLoginAttempts: z.number().min(3).max(10).default(5),
  lockoutDuration: z.number().min(5).max(60).default(15), // minutes
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(32).default(8),
    requireUppercase: z.boolean().default(true),
    requireLowercase: z.boolean().default(true),
    requireNumbers: z.boolean().default(true),
    requireSpecialChars: z.boolean().default(true),
    maxAge: z.number().min(30).max(365).default(90), // days
    preventReuse: z.number().min(1).max(12).default(3), // last N passwords
  }),
  twoFactorEnabled: z.boolean().default(false),
  twoFactorRequired: z.boolean().default(false),
  encryptionEnabled: z.boolean().default(true),
  dataMaskingEnabled: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

// Notification Configuration Schema
export const NotificationConfigSchema = z.object({
  id: z.string(),
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(false),
  inAppEnabled: z.boolean().default(true),
  emailSettings: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    fromEmail: z.string().optional(),
    fromName: z.string().optional(),
    templates: z.record(z.string()).optional(),
  }),
  smsSettings: z.object({
    provider: z.string().optional(),
    apiKey: z.string().optional(),
    fromNumber: z.string().optional(),
  }),
  pushSettings: z.object({
    provider: z.string().optional(),
    apiKey: z.string().optional(),
    projectId: z.string().optional(),
  }),
  notificationTypes: z.record(z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    inApp: z.boolean().default(true),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;

// System Configuration Schema
export const SystemConfigSchema = z.object({
  id: z.string(),
  appName: z.string(),
  appVersion: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  language: z.string().default('vi'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  timeFormat: z.string().default('24'),
  currency: z.string().default('VND'),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  backupEnabled: z.boolean().default(true),
  backupSchedule: z.string().default('0 2 * * *'), // Cron expression
  backupRetentionDays: z.number().default(30),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  apiRateLimit: z.number().default(1000), // requests per hour
  fileUploadLimit: z.number().default(100 * 1024 * 1024), // 100MB
  maxUsers: z.number().optional(),
  maxOrgUnits: z.number().optional(),
  features: z.record(z.boolean()).default({}),
  integrations: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

// Input Schemas
export const CreateConfigItemInputSchema = ConfigItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateConfigItemInput = z.infer<typeof CreateConfigItemInputSchema>;

export const UpdateConfigItemInputSchema = CreateConfigItemInputSchema.partial();

export type UpdateConfigItemInput = z.infer<typeof UpdateConfigItemInputSchema>;

export const CreateOrgUnitTypeInputSchema = OrgUnitTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateOrgUnitTypeInput = z.infer<typeof CreateOrgUnitTypeInputSchema>;

export const UpdateOrgUnitTypeInputSchema = CreateOrgUnitTypeInputSchema.partial();

export type UpdateOrgUnitTypeInput = z.infer<typeof UpdateOrgUnitTypeInputSchema>;

export const CreateOrgUnitStatusInputSchema = OrgUnitStatusSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateOrgUnitStatusInput = z.infer<typeof CreateOrgUnitStatusInputSchema>;

export const UpdateOrgUnitStatusInputSchema = CreateOrgUnitStatusInputSchema.partial();

export type UpdateOrgUnitStatusInput = z.infer<typeof UpdateOrgUnitStatusInputSchema>;

// Query Schemas
export const ConfigQuerySchema = z.object({
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(10),
  sort: z.string().default('key'),
  order: z.enum(['asc', 'desc']).default('asc'),
  category: ConfigCategorySchema.optional(),
  type: ConfigTypeSchema.optional(),
  isPublic: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type ConfigQuery = z.infer<typeof ConfigQuerySchema>;

// Configuration Bundle Schema (for bulk operations)
export const ConfigBundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: ConfigCategorySchema,
  items: z.array(z.object({
    key: z.string(),
    value: z.any(),
  })),
  version: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export type ConfigBundle = z.infer<typeof ConfigBundleSchema>;
