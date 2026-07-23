export { runCrmAssistant } from "./engine";
export {
  listAccounts,
  createAccount,
  updateAccount,
} from "./accounts";
export {
  listContacts,
  createContact,
  updateContact,
  mergeContacts,
} from "./contacts";
export {
  listLeads,
  createLead,
  updateLead,
  convertLead,
  scoreLeadHeuristic,
} from "./leads";
export {
  listStages,
  listDeals,
  createDeal,
  updateDeal,
  groupDealsByStage,
  ensureDefaultStages,
} from "./pipeline";
export { listTasks, createTask, updateTask } from "./tasks";
export { listActivities, recordActivity } from "./activities";
export { listAutomationRules, createAutomationRule } from "./automation";
export { getCrmAnalytics, computeCrmAnalytics } from "./analytics";
export type { CrmAnalyticsSummary } from "./analytics";
export { buildCrmHealthReport } from "./health";
export type { CrmHealthReport } from "./health";
export { hasCrmPermission, CRM_ROLE_PERMISSIONS } from "./permissions";
export { logCrmAudit } from "./audit";
export * from "./integrations";
import "@/lib/ai-core/adapters/crm-ai";
