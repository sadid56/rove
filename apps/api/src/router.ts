import { projectRouter } from "./modules/projects/projects.router";
import { scanRouter } from "./modules/scans/scans.router";
import { authRouter, userRouter } from "./modules/auth/auth.router";

export const appRouter = {
  projects: projectRouter,
  scans: scanRouter,
  auth: authRouter,
  user: userRouter
};

export type AppRouter = typeof appRouter;
