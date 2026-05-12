import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const CreateProjectSchema = ProjectSchema.omit({ id: true });

export const UpdateProjectSchema = ProjectSchema.partial().omit({ id: true });

export type ProjectInput = z.infer<typeof CreateProjectSchema>;
export type ProjectUpdate = z.infer<typeof UpdateProjectSchema>;
