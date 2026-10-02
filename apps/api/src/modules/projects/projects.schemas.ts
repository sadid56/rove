import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Project name must be at least 2 characters"),
  baseUrl: z.string().url("Must be a valid URL (e.g. https://example.com)"),
  crawlerConfig: z
    .object({
      maxPages: z.number().int().min(1).max(2000).default(200),
      sameOrigin: z.boolean().default(true),
      respectRobots: z.boolean().default(true),
      maxConcurrency: z.number().int().min(1).max(10).default(3),
    })
    .default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProjectSchema = projectSchema.pick({
  name: true,
  baseUrl: true,
  crawlerConfig: true,
});

export const getProjectParamsSchema = z.object({
  id: z.string().uuid(),
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
