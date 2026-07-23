"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Workflow, Approval } from "@/types/business-manager";

type Props = {
  initialWorkflows?: Workflow[];
  initialApprovals?: Approval[];
};

export function OperationsPanel({ initialWorkflows = [], initialApprovals = [] }: Props) {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [workflowName, setWorkflowName] = useState("");
  const [approvalTitle, setApprovalTitle] = useState("");

  const createWorkflow = async () => {
    if (!workflowName.trim()) return toast.error("Workflow name required");
    const res = await fetch("/api/business-manager/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: workflowName, useTemplate: true, status: "active" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setWorkflows([data.workflow, ...workflows]);
    setWorkflowName("");
    toast.success("Workflow created");
  };

  const requestApproval = async () => {
    if (!approvalTitle.trim()) return toast.error("Title required");
    const res = await fetch("/api/business-manager/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: approvalTitle, requesterName: "You" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setApprovals([data.approval, ...approvals]);
    setApprovalTitle("");
    toast.success("Approval requested");
  };

  const reviewApproval = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch("/api/business-manager/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setApprovals(approvals.map((a) => (a.id === id ? data.approval : a)));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-medium uppercase text-white/40">Workflow builder</p>
          <div className="flex gap-2">
            <Input value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Workflow name" className="border-white/10 bg-white/5 text-white" />
            <Button onClick={() => void createWorkflow()}><Plus className="size-4" /></Button>
          </div>
        </div>
        {workflows.map((w) => (
          <div key={w.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{w.name}</p>
            <p className="text-xs capitalize text-white/40">{w.status}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-white/60">
              {w.steps.map((s) => (
                <li key={s.id}>{s.label} <span className="text-white/30">({s.type})</span></li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-medium uppercase text-white/40">Approvals</p>
          <div className="flex gap-2">
            <Input value={approvalTitle} onChange={(e) => setApprovalTitle(e.target.value)} placeholder="Approval request" className="border-white/10 bg-white/5 text-white" />
            <Button onClick={() => void requestApproval()}>Request</Button>
          </div>
        </div>
        {approvals.map((a) => (
          <div key={a.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-white">{a.title}</p>
              <span className="text-xs capitalize text-white/40">{a.status}</span>
            </div>
            {a.status === "pending" && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => void reviewApproval(a.id, "approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => void reviewApproval(a.id, "rejected")}>Reject</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
