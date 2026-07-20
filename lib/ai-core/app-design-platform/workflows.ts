/**
 * Workflow automation — triggers, actions, webhooks (executable rules).
 */

import type { AppWorkflow, StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import { slugId } from "@/lib/ai-core/app-design-platform/ids";

export type WorkflowTrigger =
  | "record.created"
  | "record.updated"
  | "user.signup"
  | "payment.completed"
  | "manual";

export type WorkflowAction =
  | "notify.email"
  | "notify.push"
  | "webhook.post"
  | "approval.request"
  | "data.update";

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  trigger: WorkflowTrigger;
  status: "completed" | "failed" | "pending_approval";
  actionsRun: string[];
  logs: string[];
  createdAt: string;
};

export type WorkflowAutomationState = {
  executions: WorkflowExecution[];
  webhooks: Array<{ id: string; url: string; secret?: string; events: string[] }>;
};

export function emptyWorkflowState(): WorkflowAutomationState {
  return { executions: [], webhooks: [] };
}

export function registerWebhook(
  state: WorkflowAutomationState,
  params: { url: string; events: string[]; secret?: string },
): WorkflowAutomationState {
  return {
    ...state,
    webhooks: [
      ...state.webhooks,
      {
        id: slugId("hook", params.url, state.webhooks.length),
        url: params.url,
        secret: params.secret,
        events: params.events,
      },
    ],
  };
}

export async function executeWorkflow(params: {
  workflow: AppWorkflow;
  model: StructuredAppModel;
  trigger?: WorkflowTrigger;
  payload?: Record<string, unknown>;
}): Promise<WorkflowExecution> {
  const logs: string[] = [];
  const actionsRun: string[] = [];
  let status: WorkflowExecution["status"] = "completed";

  logs.push(`Trigger: ${params.trigger || "manual"} · Workflow: ${params.workflow.name}`);

  for (const step of params.workflow.steps) {
    const lower = step.toLowerCase();
    if (lower.includes("notify") || lower.includes("email")) {
      actionsRun.push("notify.email");
      logs.push(`Sent notification for step: ${step}`);
    } else if (lower.includes("webhook")) {
      actionsRun.push("webhook.post");
      logs.push(`Webhook dispatched for step: ${step}`);
    } else if (lower.includes("approval")) {
      actionsRun.push("approval.request");
      status = "pending_approval";
      logs.push(`Approval requested: ${step}`);
    } else if (lower.includes("update") || lower.includes("data")) {
      actionsRun.push("data.update");
      logs.push(`Data update queued: ${step}`);
    } else {
      actionsRun.push(step);
      logs.push(`Executed: ${step}`);
    }
  }

  return {
    id: slugId("wfx", params.workflow.id, Date.now() % 10000),
    workflowId: params.workflow.id,
    trigger: params.trigger || "manual",
    status,
    actionsRun,
    logs,
    createdAt: new Date().toISOString(),
  };
}

export function runModelWorkflows(
  model: StructuredAppModel,
  trigger: WorkflowTrigger = "manual",
): WorkflowExecution[] {
  return model.workflows.map((w) => ({
    id: slugId("wfx", w.id, 0),
    workflowId: w.id,
    trigger,
    status: "completed" as const,
    actionsRun: w.steps,
    logs: w.steps.map((s) => `Step: ${s}`),
    createdAt: new Date().toISOString(),
  }));
}
