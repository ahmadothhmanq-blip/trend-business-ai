import type { ErpEmployee, ErpAttendance, ErpPayroll } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listEmployees(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_employees").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("last_name");
}

export async function createEmployee(
  supabase: SupabaseClient,
  row: Partial<ErpEmployee> & { user_id: string; company_id: string; first_name: string; last_name: string },
) {
  const employeeNumber = row.employee_number || `EMP-${Date.now()}`;
  return supabase
    .from("erp_employees")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      department_id: row.department_id ?? null,
      employee_number: employeeNumber,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      job_title: row.job_title ?? "",
      role_type: row.role_type ?? "viewer",
      salary_cents: row.salary_cents ?? 0,
      hire_date: row.hire_date ?? null,
      is_active: row.is_active ?? true,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listAttendance(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_attendance").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("attendance_date", { ascending: false });
}

export async function recordAttendance(
  supabase: SupabaseClient,
  row: Partial<ErpAttendance> & { user_id: string; company_id: string; employee_id: string; attendance_date: string },
) {
  return supabase
    .from("erp_attendance")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      employee_id: row.employee_id,
      attendance_date: row.attendance_date,
      status: row.status ?? "present",
      check_in_at: row.check_in_at ?? null,
      check_out_at: row.check_out_at ?? null,
      notes: row.notes ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listPayroll(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_payroll").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("period_end", { ascending: false });
}

export async function createPayrollRecord(
  supabase: SupabaseClient,
  row: Partial<ErpPayroll> & {
    user_id: string;
    company_id: string;
    employee_id: string;
    period_start: string;
    period_end: string;
    gross_cents: number;
  },
) {
  const deductions = row.deductions_cents ?? 0;
  const net = row.net_cents ?? row.gross_cents - deductions;
  return supabase
    .from("erp_payroll")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      employee_id: row.employee_id,
      period_start: row.period_start,
      period_end: row.period_end,
      gross_cents: row.gross_cents,
      deductions_cents: deductions,
      net_cents: net,
      status: row.status ?? "draft",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
