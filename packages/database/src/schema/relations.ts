import { relations } from "drizzle-orm";
import { users, sessions, accounts } from "./auth";
import { projects } from "./projects";
import { scans, scanRoutes, pageResults, consoleEvents, runtimeErrors, networkRequests, regressions } from "./scans";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  projects: many(projects)
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id]
  }),
  scans: many(scans)
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  project: one(projects, {
    fields: [scans.projectId],
    references: [projects.id]
  }),
  routes: many(scanRoutes),
  pageResults: many(pageResults),
  regressions: many(regressions, { relationName: "currentScan" })
}));

export const scanRoutesRelations = relations(scanRoutes, ({ one, many }) => ({
  scan: one(scans, {
    fields: [scanRoutes.scanId],
    references: [scans.id]
  }),
  pageResults: many(pageResults)
}));

export const pageResultsRelations = relations(pageResults, ({ one, many }) => ({
  scan: one(scans, {
    fields: [pageResults.scanId],
    references: [scans.id]
  }),
  route: one(scanRoutes, {
    fields: [pageResults.routeId],
    references: [scanRoutes.id]
  }),
  consoleEvents: many(consoleEvents),
  runtimeErrors: many(runtimeErrors),
  networkRequests: many(networkRequests)
}));

export const consoleEventsRelations = relations(consoleEvents, ({ one }) => ({
  pageResult: one(pageResults, {
    fields: [consoleEvents.pageResultId],
    references: [pageResults.id]
  })
}));

export const runtimeErrorsRelations = relations(runtimeErrors, ({ one }) => ({
  pageResult: one(pageResults, {
    fields: [runtimeErrors.pageResultId],
    references: [pageResults.id]
  })
}));

export const networkRequestsRelations = relations(networkRequests, ({ one }) => ({
  pageResult: one(pageResults, {
    fields: [networkRequests.pageResultId],
    references: [pageResults.id]
  })
}));

export const regressionsRelations = relations(regressions, ({ one }) => ({
  currentScan: one(scans, {
    fields: [regressions.currentScanId],
    references: [scans.id],
    relationName: "currentScan"
  }),
  previousScan: one(scans, {
    fields: [regressions.previousScanId],
    references: [scans.id]
  })
}));
