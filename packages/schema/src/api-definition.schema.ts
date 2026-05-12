import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export const EnvironmentSchema = z.object({
  local: z.string().url(),
  production: z.string().url(),
});

export const QueryParamSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  required: z.boolean().default(false),
  description: z.string().optional(),
});

export const RequestFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    key: z.string().min(1),
    type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
    required: z.boolean().default(false),
    description: z.string().optional(),
    children: z.array(RequestFieldSchema).optional(),
  })
);

export const ResponseMappingSchema = z.object({
  successPath: z.string().min(1),
  messagePath: z.string().min(1),
  dataPath: z.string().min(1),
  statusCodePath: z.string().optional(),
});

export const ApiDefinitionSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  environments: EnvironmentSchema,
  endpoint: z.string().min(1),
  method: HttpMethodSchema,
  headers: z.record(z.string(), z.string()).default({}),
  queryParams: z.array(QueryParamSchema).default([]),
  requestBody: z.array(RequestFieldSchema).default([]),
  responseMapping: ResponseMappingSchema,
  timeout: z.number().int().positive().default(30000),
  authRequired: z.boolean().default(false),
});

export const CreateApiDefinitionSchema = ApiDefinitionSchema.omit({
  id: true,
});

export const UpdateApiDefinitionSchema = ApiDefinitionSchema.partial().omit({
  id: true,
  projectId: true,
});

export type ApiDefinitionInput = z.infer<typeof CreateApiDefinitionSchema>;
export type ApiDefinitionUpdate = z.infer<typeof UpdateApiDefinitionSchema>;
