import { projectContract } from "./projects";
import { scanContract } from "./scans";
import { authContract, userContract } from "./auth";
import { qaContract } from "./qa-suites";

export * from "./projects";
export * from "./scans";
export * from "./auth";
export * from "./qa-suites";

export const appContract = {
  projects: projectContract,
  scans: scanContract,
  auth: authContract,
  user: userContract,
  qa: qaContract,
};

export type { ContractRouterClient } from "@orpc/contract";
export { oc } from "@orpc/contract";

export type AppContract = typeof appContract;
