import { oc } from "@orpc/contract";
import { z } from "zod";

export const crawlerConfigSchema = z
  .object({
    maxPages: z.number().int().min(1).max(2000).optional().default(200),
    sameOrigin: z.boolean().optional().default(true),
    respectRobots: z.boolean().optional().default(true),
    excludedPaths: z.array(z.string()).optional().default([]),
    maxConcurrency: z.number().int().min(1).max(10).optional().default(3),
  })
  .optional();

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  baseUrl: z.string().url("Must be a valid URL (e.g. https://example.com)"),
  crawlerConfig: crawlerConfigSchema,
});

export const projectIdParamSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CrawlerConfig = z.infer<typeof crawlerConfigSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;

export const projectContract = {
  list: oc.route({
    method: "GET",
    path: "/projects",
    summary: "List all projects",
  }),
  get: oc
    .route({
      method: "GET",
      path: "/projects/{id}",
      summary: "Get project by ID",
    })
    .input(projectIdParamSchema),
  create: oc
    .route({
      method: "POST",
      path: "/projects",
      summary: "Create a new project",
    })
    .input(createProjectSchema),
  delete: oc
    .route({
      method: "DELETE",
      path: "/projects/{id}",
      summary: "Delete project by ID",
    })
    .input(projectIdParamSchema),
};
