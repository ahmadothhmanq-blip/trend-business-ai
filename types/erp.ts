export type ErpRoleType = "owner" | "admin" | "finance" | "operations" | "hr" | "viewer";

export type ErpAccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type ErpInvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type ErpExpenseStatus = "draft" | "submitted" | "approved" | "paid" | "rejected";

export type ErpPaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type ErpSalesOrderStatus = "draft" | "confirmed" | "fulfilled" | "invoiced" | "cancelled";

export type ErpPurchaseOrderStatus = "draft" | "submitted" | "approved" | "received" | "cancelled";

export type ErpApprovalStatus = "pending" | "approved" | "rejected";

export type ErpStockMovementType = "in" | "out" | "adjustment" | "transfer";

export type ErpAttendanceStatus = "present" | "absent" | "late" | "leave";

export type ErpPayrollStatus = "draft" | "processed" | "paid";

export type ErpAssistantAction =
  | "analyze_financial_data"
  | "generate_reports"
  | "forecast_revenue"
  | "predict_inventory"
  | "recommend_actions"
  | "summarize_performance";

export type ErpCompany = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  legal_name: string;
  tax_id: string;
  currency: string;
  fiscal_year_start: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpBranch = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  name: string;
  code: string;
  address: string;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpDepartment = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  branch_id: string | null;
  name: string;
  code: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpRole = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  member_name: string;
  member_email: string;
  role_type: ErpRoleType;
  permissions: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpAccount = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  code: string;
  name: string;
  account_type: ErpAccountType;
  parent_id: string | null;
  balance_cents: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpTransaction = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  account_id: string;
  journal_entry_id: string | null;
  description: string;
  debit_cents: number;
  credit_cents: number;
  occurred_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpJournalEntry = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  entry_number: string;
  description: string;
  status: "draft" | "posted";
  posted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpInvoice = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  crm_contact_id: string | null;
  crm_deal_id: string | null;
  sales_order_id: string | null;
  status: ErpInvoiceStatus;
  amount_cents: number;
  currency: string;
  due_at: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpExpense = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  title: string;
  category: string;
  vendor_name: string;
  status: ErpExpenseStatus;
  amount_cents: number;
  currency: string;
  incurred_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpPayment = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  invoice_id: string | null;
  expense_id: string | null;
  reference: string;
  status: ErpPaymentStatus;
  amount_cents: number;
  currency: string;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpCategory = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpProduct = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  description: string;
  price_cents: number;
  cost_cents: number;
  currency: string;
  unit: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpWarehouse = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  branch_id: string | null;
  name: string;
  code: string;
  location: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpStockMovement = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  product_id: string;
  warehouse_id: string;
  movement_type: ErpStockMovementType;
  quantity: number;
  reference: string;
  notes: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpSupplier = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpSalesOrder = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  crm_deal_id: string | null;
  crm_contact_id: string | null;
  status: ErpSalesOrderStatus;
  total_cents: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpPurchaseOrder = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  po_number: string;
  supplier_id: string | null;
  status: ErpPurchaseOrderStatus;
  total_cents: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpApproval = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  status: ErpApprovalStatus;
  requested_by: string;
  reviewed_by: string;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpEmployee = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  department_id: string | null;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  role_type: ErpRoleType;
  salary_cents: number;
  hire_date: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpAttendance = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  status: ErpAttendanceStatus;
  check_in_at: string | null;
  check_out_at: string | null;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpPayroll = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  gross_cents: number;
  deductions_cents: number;
  net_cents: number;
  status: ErpPayrollStatus;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpReport = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  report_type: string;
  title: string;
  payload: Record<string, unknown>;
  generated_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ErpMetric = {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string;
  metric_key: string;
  metric_value: number;
  recorded_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
