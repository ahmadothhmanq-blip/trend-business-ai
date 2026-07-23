-- ERP Platform (standalone AI ERP)

create table if not exists public.erp_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  name text not null default 'My Company',
  legal_name text not null default '',
  tax_id text not null default '',
  currency text not null default 'USD',
  fiscal_year_start text not null default '01-01',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_companies enable row level security;
create policy "Users manage own erp companies" on public.erp_companies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_companies_user_id on public.erp_companies(user_id);

create table if not exists public.erp_branches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  name text not null default 'Main Branch',
  code text not null default 'MAIN',
  address text not null default '',
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_branches enable row level security;
create policy "Users manage own erp branches" on public.erp_branches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_branches_company on public.erp_branches(company_id);

create table if not exists public.erp_departments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  branch_id uuid references public.erp_branches(id) on delete set null,
  name text not null default 'Department',
  code text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_departments enable row level security;
create policy "Users manage own erp departments" on public.erp_departments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_departments_company on public.erp_departments(company_id);

create table if not exists public.erp_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  member_name text not null default '',
  member_email text not null default '',
  role_type text not null default 'viewer' check (role_type in ('owner','admin','finance','operations','hr','viewer')),
  permissions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_roles enable row level security;
create policy "Users manage own erp roles" on public.erp_roles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_roles_company on public.erp_roles(company_id);

create table if not exists public.erp_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  code text not null default '',
  name text not null default 'Account',
  account_type text not null default 'asset' check (account_type in ('asset','liability','equity','revenue','expense')),
  parent_id uuid references public.erp_accounts(id) on delete set null,
  balance_cents bigint not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id, code)
);

alter table public.erp_accounts enable row level security;
create policy "Users manage own erp accounts" on public.erp_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_accounts_company on public.erp_accounts(company_id);

create table if not exists public.erp_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  entry_number text not null default '',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft','posted')),
  posted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_journal_entries enable row level security;
create policy "Users manage own erp journal entries" on public.erp_journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_journal_entries_company on public.erp_journal_entries(company_id);

create table if not exists public.erp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  account_id uuid not null references public.erp_accounts(id) on delete cascade,
  journal_entry_id uuid references public.erp_journal_entries(id) on delete set null,
  description text not null default '',
  debit_cents bigint not null default 0,
  credit_cents bigint not null default 0,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_transactions enable row level security;
create policy "Users manage own erp transactions" on public.erp_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_transactions_company on public.erp_transactions(company_id);
create index if not exists idx_erp_transactions_account on public.erp_transactions(account_id);

create table if not exists public.erp_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  invoice_number text not null default '',
  customer_name text not null default '',
  customer_email text not null default '',
  crm_contact_id uuid,
  crm_deal_id uuid,
  sales_order_id uuid,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','void')),
  amount_cents bigint not null default 0,
  currency text not null default 'USD',
  due_at date,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_invoices enable row level security;
create policy "Users manage own erp invoices" on public.erp_invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_invoices_company on public.erp_invoices(company_id);
create index if not exists idx_erp_invoices_status on public.erp_invoices(status);

create table if not exists public.erp_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  title text not null default 'Expense',
  category text not null default 'general',
  vendor_name text not null default '',
  status text not null default 'draft' check (status in ('draft','submitted','approved','paid','rejected')),
  amount_cents bigint not null default 0,
  currency text not null default 'USD',
  incurred_at date not null default current_date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_expenses enable row level security;
create policy "Users manage own erp expenses" on public.erp_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_expenses_company on public.erp_expenses(company_id);

create table if not exists public.erp_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  invoice_id uuid references public.erp_invoices(id) on delete set null,
  expense_id uuid references public.erp_expenses(id) on delete set null,
  reference text not null default '',
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  amount_cents bigint not null default 0,
  currency text not null default 'USD',
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_payments enable row level security;
create policy "Users manage own erp payments" on public.erp_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_payments_company on public.erp_payments(company_id);

create table if not exists public.erp_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  name text not null default 'Category',
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_categories enable row level security;
create policy "Users manage own erp categories" on public.erp_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_categories_company on public.erp_categories(company_id);

create table if not exists public.erp_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  category_id uuid references public.erp_categories(id) on delete set null,
  sku text not null default '',
  name text not null default 'Product',
  description text not null default '',
  price_cents bigint not null default 0,
  cost_cents bigint not null default 0,
  currency text not null default 'USD',
  unit text not null default 'ea',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id, sku)
);

alter table public.erp_products enable row level security;
create policy "Users manage own erp products" on public.erp_products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_products_company on public.erp_products(company_id);

create table if not exists public.erp_warehouses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  branch_id uuid references public.erp_branches(id) on delete set null,
  name text not null default 'Warehouse',
  code text not null default 'WH1',
  location text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_warehouses enable row level security;
create policy "Users manage own erp warehouses" on public.erp_warehouses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_warehouses_company on public.erp_warehouses(company_id);

create table if not exists public.erp_suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  name text not null default 'Supplier',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_suppliers enable row level security;
create policy "Users manage own erp suppliers" on public.erp_suppliers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_suppliers_company on public.erp_suppliers(company_id);

create table if not exists public.erp_stock_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  product_id uuid not null references public.erp_products(id) on delete cascade,
  warehouse_id uuid not null references public.erp_warehouses(id) on delete cascade,
  movement_type text not null default 'in' check (movement_type in ('in','out','adjustment','transfer')),
  quantity numeric not null default 0,
  reference text not null default '',
  notes text not null default '',
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_stock_movements enable row level security;
create policy "Users manage own erp stock movements" on public.erp_stock_movements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_stock_movements_product on public.erp_stock_movements(product_id);
create index if not exists idx_erp_stock_movements_warehouse on public.erp_stock_movements(warehouse_id);

create table if not exists public.erp_sales_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  order_number text not null default '',
  customer_name text not null default '',
  customer_email text not null default '',
  crm_deal_id uuid,
  crm_contact_id uuid,
  status text not null default 'draft' check (status in ('draft','confirmed','fulfilled','invoiced','cancelled')),
  total_cents bigint not null default 0,
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_sales_orders enable row level security;
create policy "Users manage own erp sales orders" on public.erp_sales_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_sales_orders_company on public.erp_sales_orders(company_id);

create table if not exists public.erp_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  po_number text not null default '',
  supplier_id uuid references public.erp_suppliers(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','submitted','approved','received','cancelled')),
  total_cents bigint not null default 0,
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_purchase_orders enable row level security;
create policy "Users manage own erp purchase orders" on public.erp_purchase_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_purchase_orders_company on public.erp_purchase_orders(company_id);

create table if not exists public.erp_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  entity_type text not null default '',
  entity_id uuid not null,
  title text not null default 'Approval',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_by text not null default '',
  reviewed_by text not null default '',
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_approvals enable row level security;
create policy "Users manage own erp approvals" on public.erp_approvals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_approvals_company on public.erp_approvals(company_id);

create table if not exists public.erp_employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  department_id uuid references public.erp_departments(id) on delete set null,
  employee_number text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  job_title text not null default '',
  role_type text not null default 'viewer' check (role_type in ('owner','admin','finance','operations','hr','viewer')),
  salary_cents bigint not null default 0,
  hire_date date,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_employees enable row level security;
create policy "Users manage own erp employees" on public.erp_employees for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_employees_company on public.erp_employees(company_id);

create table if not exists public.erp_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  employee_id uuid not null references public.erp_employees(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null default 'present' check (status in ('present','absent','late','leave')),
  check_in_at timestamptz,
  check_out_at timestamptz,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_attendance enable row level security;
create policy "Users manage own erp attendance" on public.erp_attendance for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_attendance_employee on public.erp_attendance(employee_id);

create table if not exists public.erp_payroll (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  employee_id uuid not null references public.erp_employees(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_cents bigint not null default 0,
  deductions_cents bigint not null default 0,
  net_cents bigint not null default 0,
  status text not null default 'draft' check (status in ('draft','processed','paid')),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_payroll enable row level security;
create policy "Users manage own erp payroll" on public.erp_payroll for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_payroll_employee on public.erp_payroll(employee_id);

create table if not exists public.erp_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  report_type text not null default 'summary',
  title text not null default 'Report',
  payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_reports enable row level security;
create policy "Users manage own erp reports" on public.erp_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_reports_company on public.erp_reports(company_id);

create table if not exists public.erp_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid not null references public.erp_companies(id) on delete cascade,
  metric_key text not null default '',
  metric_value numeric not null default 0,
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.erp_metrics enable row level security;
create policy "Users manage own erp metrics" on public.erp_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_metrics_company on public.erp_metrics(company_id);
create index if not exists idx_erp_metrics_key on public.erp_metrics(metric_key);

create table if not exists public.erp_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  company_id uuid,
  action text not null default '',
  entity_type text not null default '',
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.erp_audit_log enable row level security;
create policy "Users manage own erp audit log" on public.erp_audit_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_erp_audit_log_user on public.erp_audit_log(user_id);

-- FK for sales_order on invoices (added after sales_orders exists)
alter table public.erp_invoices
  drop constraint if exists erp_invoices_sales_order_id_fkey;
alter table public.erp_invoices
  add constraint erp_invoices_sales_order_id_fkey
  foreign key (sales_order_id) references public.erp_sales_orders(id) on delete set null;
