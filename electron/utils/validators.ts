import { z } from 'zod';

const ALLOWED_SORT_FIELDS = ['created_at', 'imported_at', 'updated_at', 'title'] as const;
const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;

export const listParamsSchema = z
  .object({
    page: z.number().int().min(1).max(10000).optional().default(1),
    pageSize: z.number().int().min(1).max(100).optional().default(20),
    source: z.string().max(50).optional(),
    status: z.string().max(20).optional(),
    sortBy: z.enum(ALLOWED_SORT_FIELDS).optional().default('created_at'),
    sortOrder: z.enum(ALLOWED_SORT_ORDERS).optional().default('desc'),
  })
  .optional()
  .default({});

export const createConversationSchema = z.object({
  source: z.string().min(1).max(50),
  title: z.string().max(500).optional(),
  rawContent: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      timestamp: z.string().optional(),
    }),
  ),
  metadata: z.record(z.unknown()).optional(),
});

export const createNoteSchema = z.object({
  conversationId: z.string().optional(),
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['pending', 'draft', 'confirmed', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map((i) => i.message).join(', ')}`);
  }
  return result.data;
}
