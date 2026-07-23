import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import {
  listEmployees,
  createEmployee,
  listAttendance,
  recordAttendance,
  listPayroll,
  createPayrollRecord,
} from "@/lib/erp/hr";
import { NextResponse } from "next/server";
import { z } from "zod";

const employeeSchema = z.object({
  companyId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().optional(),
  jobTitle: z.string().optional(),
  salaryCents: z.number().int().min(0).optional(),
  departmentId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? undefined;
  const type = searchParams.get("type") ?? "employees";

  if (type === "attendance") {
    const { data, error } = await listAttendance(auth.supabase, auth.user!.id, companyId ?? undefined);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("erp.attendance.list", error);
    return NextResponse.json({ attendance: data ?? [] });
  }
  if (type === "payroll") {
    const { data, error } = await listPayroll(auth.supabase, auth.user!.id, companyId ?? undefined);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("erp.payroll.list", error);
    return NextResponse.json({ payroll: data ?? [] });
  }

  const { data, error } = await listEmployees(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ employees: [] });
    return databaseErrorResponse("erp.employees.list", error);
  }
  return NextResponse.json({ employees: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const typed = body as {
    type?: string;
    companyId?: string;
    employeeId?: string;
    attendanceDate?: string;
    status?: "present" | "absent" | "late" | "leave";
    periodStart?: string;
    periodEnd?: string;
    grossCents?: number;
  };

  if (typed.type === "attendance" && typed.companyId && typed.employeeId && typed.attendanceDate) {
    const { data, error } = await recordAttendance(auth.supabase, {
      user_id: auth.user!.id,
      company_id: typed.companyId,
      employee_id: typed.employeeId,
      attendance_date: typed.attendanceDate,
      status: typed.status,
    });
    if (error) return databaseErrorResponse("erp.attendance.create", error);
    return NextResponse.json({ attendance: data });
  }

  if (typed.type === "payroll" && typed.companyId && typed.employeeId && typed.periodStart && typed.periodEnd && typed.grossCents != null) {
    const { data, error } = await createPayrollRecord(auth.supabase, {
      user_id: auth.user!.id,
      company_id: typed.companyId,
      employee_id: typed.employeeId,
      period_start: typed.periodStart,
      period_end: typed.periodEnd,
      gross_cents: typed.grossCents,
    });
    if (error) return databaseErrorResponse("erp.payroll.create", error);
    return NextResponse.json({ payroll: data });
  }

  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createEmployee(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    job_title: parsed.data.jobTitle,
    salary_cents: parsed.data.salaryCents,
    department_id: parsed.data.departmentId ?? null,
  });
  if (error) return databaseErrorResponse("erp.employees.create", error);
  return NextResponse.json({ employee: data });
}
