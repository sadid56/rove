import { ORPCError } from "@orpc/server";
import { projectContract } from "@repo/contract";
import { projectsService } from "./projects.service";
import { createProcedure } from "../../utils/procedure";

export const listProjects = createProcedure(projectContract.list, () =>
  projectsService.list()
);

export const getProject = createProcedure(projectContract.get, async ({ id }) => {
  const project = await projectsService.findById(id);
  if (!project) {
    throw new ORPCError("NOT_FOUND", {
      message: `Project with ID ${id} was not found`
    });
  }
  return project;
});

export const createProject = createProcedure(projectContract.create, (input) =>
  projectsService.create(input)
);

export const deleteProject = createProcedure(projectContract.delete, async ({ id }) => {
  const success = await projectsService.delete(id);
  if (!success) {
    throw new ORPCError("NOT_FOUND", {
      message: `Project with ID ${id} was not found`
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
