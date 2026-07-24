"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ErpEmployee } from "@/types/erp";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = { companyId: string; initialEmployees?: ErpEmployee[] };

export function HrDashboard({ companyId, initialEmployees = [] }: Props) {
  const wt = useWorkspaceT("erp");
  const [employees, setEmployees] = useState(initialEmployees);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [attendanceEmployeeId, setAttendanceEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));

  const createEmployee = async () => {
    const res = await fetch("/api/erp/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, firstName, lastName, email, jobTitle }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    setEmployees([data.employee, ...employees]);
    toast.success(wt("toasts.employeeAdded"));
  };

  const recordAttendance = async () => {
    const res = await fetch("/api/erp/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "attendance", companyId, employeeId: attendanceEmployeeId, attendanceDate, status: "present" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? wt("toasts.failed"));
    toast.success(wt("toasts.attendanceRecorded"));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs uppercase text-white/40">{wt("panels.hr.addEmployee")}</p>
        <div className="flex flex-wrap gap-2">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={wt("forms.firstName")} className="border-white/10 bg-white/5 text-white" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={wt("forms.lastName")} className="border-white/10 bg-white/5 text-white" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={wt("forms.email")} className="border-white/10 bg-white/5 text-white" />
          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={wt("forms.jobTitle")} className="border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void createEmployee()}>{wt("panels.hr.addEmployee")}</Button>
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs uppercase text-white/40">{wt("panels.hr.attendance")}</p>
        <Input value={attendanceEmployeeId} onChange={(e) => setAttendanceEmployeeId(e.target.value)} placeholder={wt("forms.employeeId")} className="border-white/10 bg-white/5 text-white" />
        <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void recordAttendance()}>{wt("panels.hr.recordAttendance")}</Button>
      </div>
      <div className="space-y-1 text-sm text-white/70">
        {employees.map((e) => (
          <div key={e.id}>{e.first_name} {e.last_name} · {e.job_title || "—"} · {e.email}</div>
        ))}
      </div>
    </div>
  );
}
