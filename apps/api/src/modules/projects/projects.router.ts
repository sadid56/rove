import { implement, ORPCError } from "@orpc/server";
import { projectContract } from "@repo/contract";
import { projectsService } from "./projects.service";

export const listProjects = implement(projectContract.list).handler(async () => {
  return await projectsService.list();
});

export const getProject = implement(projectContract.get).handler(
  async ({ input }) => {
    const project = await projectsService.findById(input.id);
    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: `Project with ID ${input.id} was not found`
      });
    }
    return project;
  }
);

export const createProject = implement(projectContract.create).handler(
  async ({ input }) => {
    return await projectsService.create(input);
  }
);

export const deleteProject = implement(projectContract.delete).handler(
  async ({ input }) => {
    const success = await projectsService.delete(input.id);
    if (!success) {
      throw new ORPCError("NOT_FOUND", {
        message: `Project with ID ${input.id} was not found`
      });
    }
    return { success: true };
  }
);

export const projectRouter = {
  list: listProjects,
  get: getProject,
  create: createProject,
  delete: deleteProject
};
