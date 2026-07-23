export type BusinessRoleType = "owner" | "admin" | "manager" | "member";

export type BusinessProjectStatus = "draft" | "active" | "on_hold" | "completed" | "archived";

export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type WorkflowStatus = "draft" | "active" | "paused" | "completed";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "missed";

export type Organization = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  industry: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  user_id: string;
  organization_id: string;
  department_id: string | null;
  name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  user_id: string;
  organization_id: string;
  team_id: string | null;
  member_name: string;
  member_email: string;
  role_type: BusinessRoleType;
  permissions: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BusinessProject = {
  id: string;
  user_id: string;
  organization_id: string | null;
  team_id: string | null;
  name: string;
  description: string;
  status: BusinessProjectStatus;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  owner_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  organization_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_name: string;
  assignee_email: string;
  due_date: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  target_date: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Workflow = {
  id: string;
  user_id: string;
  organization_id: string | null;
  project_id: string | null;
  name: string;
  description: string;
  status: WorkflowStatus;
  steps: Array<{ id: string; label: string; type: string; config: Record<string, unknown> }>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Approval = {
  id: string;
  user_id: string;
  workflow_id: string | null;
  project_id: string | null;
  title: string;
  description: string;
  status: ApprovalStatus;
  requester_name: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewed_at: string | null;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type KPI = {
  id: string;
  user_id: string;
  organization_id: string | null;
  project_id: string | null;
  name: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  recorded_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BusinessAssistantAction = "analyze" | "improve" | "summarize" | "recommend";

export type GeneratedBusinessPlan = {
  title: string;
  summary: string;
  objectives: string[];
  recommendations: string[];
  bottlenecks: string[];
  actions: Array<{ title: string; priority: string; owner: string }>;
};
