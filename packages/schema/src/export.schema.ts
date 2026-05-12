import { z } from 'zod';
import { ApiDefinitionSchema } from './api-definition.schema';
import { ProjectSchema } from './project.schema';

export const ExportConfigSchema = z.object({
  project: ProjectSchema.required(),
  apis: z.array(ApiDefinitionSchema),
  exportedAt: z.string().datetime(),
  version: z.string().default('1.0.0'),
});

export type ExportConfigInput = z.infer<typeof ExportConfigSchema>;
