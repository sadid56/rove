import { projectRouter } from "./modules/projects/projects.router";
import { scanRouter } from "./modules/scans/scans.router";
import { authRouter, userRouter } from "./modules/auth/auth.router";
import { qaRouter } from "./modules/qa-suites/qa.router";

export const appRouter = {
  projects: projectRouter,
  scans: scanRouter,
  auth: authRouter,
  user: userRouter,
  qa: qaRouter,
};

export type AppRouter = typeof appRouter;
