import { z } from 'zod';

// Workflow Status Schema
export const WorkflowStatusSchema = z.enum([
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'rejected',
  'active',
  'archived'
]);

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

// Workflow Priority Schema
export const WorkflowPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export type WorkflowPriority = z.infer<typeof WorkflowPrioritySchema>;

// Workflow Step Schema
export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number(),
  approverRole: z.string(),
  isRequired: z.boolean().default(true),
  autoApprove: z.boolean().default(false),
  timeoutDays: z.number().default(7),
  escalationRole: z.string().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// Workflow Template Schema
export const WorkflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  entityType: z.string(), // 'org_unit', 'employee', etc.
  isActive: z.boolean().default(true),
  steps: z.array(WorkflowStepSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

// Workflow Instance Schema
export const WorkflowInstanceSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  status: WorkflowStatusSchema,
  priority: WorkflowPrioritySchema.default('medium'),
  submittedBy: z.string(),
  submittedAt: z.date(),
  completedAt: z.date().optional(),
  currentStep: z.number().default(0),
  data: z.record(z.any()), // Workflow data
  comments: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowInstance = z.infer<typeof WorkflowInstanceSchema>;

// Workflow Action Schema
export const WorkflowActionSchema = z.object({
  id: z.string(),
  instanceId: z.string(),
  stepId: z.string(),
  action: z.enum(['approve', 'reject', 'request_changes', 'escalate']),
  performedBy: z.string(),
  performedAt: z.date(),
  comments: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export type WorkflowAction = z.infer<typeof WorkflowActionSchema>;

// Workflow Notification Schema
export const WorkflowNotificationSchema = z.object({
  id: z.string(),
  instanceId: z.string(),
  recipientId: z.string(),
  type: z.enum(['assignment', 'reminder', 'escalation', 'completion']),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  sentAt: z.date(),
  readAt: z.date().optional(),
});

export type WorkflowNotification = z.infer<typeof WorkflowNotificationSchema>;

// Input Schemas
export const CreateWorkflowTemplateInputSchema = WorkflowTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateWorkflowTemplateInput = z.infer<typeof CreateWorkflowTemplateInputSchema>;

export const UpdateWorkflowTemplateInputSchema = CreateWorkflowTemplateInputSchema.partial();

export type UpdateWorkflowTemplateInput = z.infer<typeof UpdateWorkflowTemplateInputSchema>;

export const CreateWorkflowInstanceInputSchema = z.object({
  templateId: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  priority: WorkflowPrioritySchema.default('medium'),
  data: z.record(z.any()),
  comments: z.string().optional(),
});

export type CreateWorkflowInstanceInput = z.infer<typeof CreateWorkflowInstanceInputSchema>;

export const UpdateWorkflowInstanceInputSchema = z.object({
  status: WorkflowStatusSchema.optional(),
  currentStep: z.number().optional(),
  data: z.record(z.any()).optional(),
  comments: z.string().optional(),
});

export type UpdateWorkflowInstanceInput = z.infer<typeof UpdateWorkflowInstanceInputSchema>;

export const WorkflowActionInputSchema = z.object({
  action: WorkflowActionSchema.shape.action,
  comments: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export type WorkflowActionInput = z.infer<typeof WorkflowActionInputSchema>;

// Query Schemas
export const WorkflowQuerySchema = z.object({
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(10),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: WorkflowStatusSchema.optional(),
  priority: WorkflowPrioritySchema.optional(),
  entityType: z.string().optional(),
  submittedBy: z.string().optional(),
  assignedTo: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type WorkflowQuery = z.infer<typeof WorkflowQuerySchema>;
