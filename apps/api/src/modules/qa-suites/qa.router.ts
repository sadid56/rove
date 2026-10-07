import { qaContract } from "@repo/contract";
import { qaService } from "./qa.service";
import { createProcedure } from "../../utils/procedure";

export const qaRouter = {
  journeys: {
    list: createProcedure(qaContract.journeys.list, () => qaService.listJourneys()),
    create: createProcedure(qaContract.journeys.create, (input) => qaService.createJourney(input)),
    run: createProcedure(qaContract.journeys.run, ({ id }) => qaService.runJourney(id)),
  },
  apiMonitors: {
    list: createProcedure(qaContract.apiMonitors.list, (input) => qaService.listApiMonitors(input)),
    create: createProcedure(qaContract.apiMonitors.create, (input) => qaService.createApiMonitor(input)),
    ping: createProcedure(qaContract.apiMonitors.ping, ({ id }) => qaService.pingApiMonitor(id)),
  },
  issues: {
    list: createProcedure(qaContract.issues.list, (input) => qaService.listIssues(input)),
    create: createProcedure(qaContract.issues.create, (input) => qaService.createIssue(input)),
    updateStatus: createProcedure(qaContract.issues.updateStatus, ({ id, status }) =>
      qaService.updateIssueStatus(id, status)
    ),
  },
  team: {
    list: createProcedure(qaContract.team.list, (input) => qaService.listTeam(input)),
    invite: createProcedure(qaContract.team.invite, (input) => qaService.inviteTeamMember(input)),
  },
  security: {
    listFindings: createProcedure(qaContract.security.listFindings, (input) => qaService.listSecurityFindings(input)),
    runScan: createProcedure(qaContract.security.runScan, () => qaService.runSecurityScan()),
  },
  aiStudio: {
    listVisionDefects: createProcedure(qaContract.aiStudio.listVisionDefects, () => qaService.listVisionDefects()),
    runVisionAudit: createProcedure(qaContract.aiStudio.runVisionAudit, (input) => qaService.runVisionAudit(input)),
    listFixes: createProcedure(qaContract.aiStudio.listFixes, () => qaService.listFixes()),
    createPr: createProcedure(qaContract.aiStudio.createPr, (input) => qaService.createPr(input)),
  },
  billing: {
    get: createProcedure(qaContract.billing.get, () => qaService.getBilling()),
    updatePlan: createProcedure(qaContract.billing.updatePlan, (input) => qaService.updateBillingPlan(input)),
    createCheckoutSession: createProcedure(qaContract.billing.createCheckoutSession, (input) =>
      qaService.createCheckoutSession(input)
    ),
    createPortalSession: createProcedure(qaContract.billing.createPortalSession, (input) =>
      qaService.createPortalSession(input)
    ),
    listInvoices: createProcedure(qaContract.billing.listInvoices, (input) => qaService.listInvoices(input)),
  },
  aiAssistant: {
    chat: createProcedure(qaContract.aiAssistant.chat, (input) => qaService.aiChat(input)),
  },
  integrations: {
    list: createProcedure(qaContract.integrations.list, () => qaService.listIntegrations()),
    update: createProcedure(qaContract.integrations.update, (input) => qaService.updateIntegration(input)),
    test: createProcedure(qaContract.integrations.test, (input) => qaService.testIntegration(input)),
  },
};

