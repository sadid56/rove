import { os, ORPCError } from "@orpc/server";
import { z } from "zod";
import { projectsService } from "./projects.service";

export const listProjects = os
  .route({
    method: "GET",
    path: "/projects",
    summary: "List all projects"
  })
  .handler(async () => {
    return await projectsService.list();
  });

export const getProject = os
  .route({
    method: "GET",
    path: "/projects/{id}",
    summary: "Get project by ID"
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const project = await projectsService.findById(input.id);
    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: `Project with ID ${input.id} was not found`
      });
    }
    return project;
  });

export const createProject = os
  .route({
    method: "POST",
    path: "/projects",
    summary: "Create a new project"
  })
  .input(
    z.object({
      name: z.string().min(2),
      baseUrl: z.string().url(),
      crawlerConfig: z
        .object({
          maxPages: z.number().optional(),
          sameOrigin: z.boolean().optional(),
          respectRobots: z.boolean().optional(),
          excludedPaths: z.array(z.string()).optional()
        })
        .optional()
    })
  )
  .handler(async ({ input }) => {
    return await projectsService.create(input);
  });

export const deleteProject = os
  .route({
    method: "DELETE",
    path: "/projects/{id}",
    summary: "Delete project by ID"
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const success = await projectsService.delete(input.id);
    if (!success) {
      throw new ORPCError("NOT_FOUND", {
        message: `Project with ID ${input.id} was not found`
      });
    }
    return { success: true };
  });

export const projectRouter = {
  list: listProjects,
  get: getProject,
  create: createProject,
  delete: deleteProject
};
