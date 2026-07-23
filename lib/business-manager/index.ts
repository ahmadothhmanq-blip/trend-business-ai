export { generateBusinessPlan, runBusinessAssistant } from "./engine";
export {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  listDepartments,
  createDepartment,
} from "./organizations";
export { listTeams, createTeam, updateTeam, listRoles, createRole, updateRole } from "./teams";
export {
  listProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  computeProjectProgress,
  listMilestones,
  createMilestone,
  updateMilestone,
} from "./projects";
export {
  listTasks,
  getTask,
  createTask,
  updateTask,
  groupTasksByStatus,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "./tasks";
export {
  listWorkflows,
  createWorkflow,
  updateWorkflow,
  defaultOnboardingWorkflow,
  WORKFLOW_STEP_TYPES,
} from "./workflows";
export { listApprovals, createApproval, updateApproval } from "./approvals";
export {
  getBusinessAnalytics,
  summarizeBusinessData,
  listKpis,
  createKpi,
  updateKpi,
} from "./analytics";
export type { BusinessAnalyticsSummary } from "./analytics";
export { buildBusinessManagerHealthReport } from "./health";
export type { BusinessManagerHealthReport } from "./health";
export { hasPermission, canManageRole, ROLE_PERMISSIONS } from "./roles";
export * from "./integrations";
import "@/lib/ai-core/adapters/business-manager-ai";
