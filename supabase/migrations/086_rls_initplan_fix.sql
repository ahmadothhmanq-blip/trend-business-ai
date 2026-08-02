-- Policies updated: 386
-- Migration 086: Fix auth_rls_initplan advisor warnings
-- Auto-generated: wrap auth.uid/jwt/role/email() in scalar subselects

drop policy if exists "Users see own activity" on "public"."activity_log";
create policy "Users see own activity" on "public"."activity_log" for select
  using ((((select auth.uid()) = user_id) OR (organization_id IN ( SELECT org_members.organization_id
   FROM org_members
  WHERE ((org_members.user_id = (select auth.uid())) AND (org_members.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));

drop policy if exists "Users manage own agent analytics" on "public"."agent_analytics";
create policy "Users manage own agent analytics" on "public"."agent_analytics" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent audit log" on "public"."agent_audit_log";
create policy "Users manage own agent audit log" on "public"."agent_audit_log" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users see own executions" on "public"."agent_executions";
create policy "Users see own executions" on "public"."agent_executions" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent knowledge bases" on "public"."agent_knowledge_bases";
create policy "Users manage own agent knowledge bases" on "public"."agent_knowledge_bases" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent knowledge documents" on "public"."agent_knowledge_documents";
create policy "Users manage own agent knowledge documents" on "public"."agent_knowledge_documents" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own memory" on "public"."agent_memory";
create policy "Users manage own memory" on "public"."agent_memory" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent memory entries" on "public"."agent_memory_entries";
create policy "Users manage own agent memory entries" on "public"."agent_memory_entries" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent permissions" on "public"."agent_permissions";
create policy "Users manage own agent permissions" on "public"."agent_permissions" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent run steps" on "public"."agent_run_steps";
create policy "Users manage own agent run steps" on "public"."agent_run_steps" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent runs" on "public"."agent_runs";
create policy "Users manage own agent runs" on "public"."agent_runs" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent schedules" on "public"."agent_schedules";
create policy "Users manage own agent schedules" on "public"."agent_schedules" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent tools" on "public"."agent_tools";
create policy "Users manage own agent tools" on "public"."agent_tools" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent triggers" on "public"."agent_triggers";
create policy "Users manage own agent triggers" on "public"."agent_triggers" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent versions" on "public"."agent_versions";
create policy "Users manage own agent versions" on "public"."agent_versions" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own agent workflow runs" on "public"."agent_workflow_runs";
create policy "Users manage own agent workflow runs" on "public"."agent_workflow_runs" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own workflows" on "public"."agent_workflows";
create policy "Users manage own workflows" on "public"."agent_workflows" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users delete own non-template agents" on "public"."agents";
create policy "Users delete own non-template agents" on "public"."agents" for delete
  using ((((select auth.uid()) = user_id) AND (COALESCE(is_template, false) = false)));

drop policy if exists "Users insert own non-template agents" on "public"."agents";
create policy "Users insert own non-template agents" on "public"."agents" for insert
  with check ((((select auth.uid()) = user_id) AND (COALESCE(is_template, false) = false)));

drop policy if exists "Users select own or template agents" on "public"."agents";
create policy "Users select own or template agents" on "public"."agents" for select
  using ((((select auth.uid()) = user_id) OR (is_template = true)));

drop policy if exists "Users update own non-template agents" on "public"."agents";
create policy "Users update own non-template agents" on "public"."agents" for update
  using ((((select auth.uid()) = user_id) AND (COALESCE(is_template, false) = false)))
  with check ((((select auth.uid()) = user_id) AND (COALESCE(is_template, false) = false)));

drop policy if exists "Users can delete own AI provider settings" on "public"."ai_provider_settings";
create policy "Users can delete own AI provider settings" on "public"."ai_provider_settings" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own AI provider settings" on "public"."ai_provider_settings";
create policy "Users can insert own AI provider settings" on "public"."ai_provider_settings" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can read own AI provider settings" on "public"."ai_provider_settings";
create policy "Users can read own AI provider settings" on "public"."ai_provider_settings" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can update own AI provider settings" on "public"."ai_provider_settings";
create policy "Users can update own AI provider settings" on "public"."ai_provider_settings" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own ai runs" on "public"."ai_runs";
create policy "Users can delete own ai runs" on "public"."ai_runs" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own ai runs" on "public"."ai_runs";
create policy "Users can insert own ai runs" on "public"."ai_runs" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own ai runs" on "public"."ai_runs";
create policy "Users can update own ai runs" on "public"."ai_runs" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own ai runs" on "public"."ai_runs";
create policy "Users can view own ai runs" on "public"."ai_runs" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own keys" on "public"."api_keys";
create policy "Users manage own keys" on "public"."api_keys" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi alerts" on "public"."bi_alerts";
create policy "Users manage own bi alerts" on "public"."bi_alerts" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi audit log" on "public"."bi_audit_log";
create policy "Users manage own bi audit log" on "public"."bi_audit_log" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi dashboards" on "public"."bi_dashboards";
create policy "Users manage own bi dashboards" on "public"."bi_dashboards" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi data sources" on "public"."bi_data_sources";
create policy "Users manage own bi data sources" on "public"."bi_data_sources" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi datasets" on "public"."bi_datasets";
create policy "Users manage own bi datasets" on "public"."bi_datasets" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi dimensions" on "public"."bi_dimensions";
create policy "Users manage own bi dimensions" on "public"."bi_dimensions" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi kpis" on "public"."bi_kpis";
create policy "Users manage own bi kpis" on "public"."bi_kpis" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi metrics" on "public"."bi_metrics";
create policy "Users manage own bi metrics" on "public"."bi_metrics" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi models" on "public"."bi_models";
create policy "Users manage own bi models" on "public"."bi_models" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi queries" on "public"."bi_queries";
create policy "Users manage own bi queries" on "public"."bi_queries" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi reports" on "public"."bi_reports";
create policy "Users manage own bi reports" on "public"."bi_reports" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi scheduled reports" on "public"."bi_scheduled_reports";
create policy "Users manage own bi scheduled reports" on "public"."bi_scheduled_reports" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own bi widgets" on "public"."bi_widgets";
create policy "Users manage own bi widgets" on "public"."bi_widgets" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users see own checkout sessions" on "public"."billing_checkout_sessions";
create policy "Users see own checkout sessions" on "public"."billing_checkout_sessions" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own billing customer" on "public"."billing_customers";
create policy "Users see own billing customer" on "public"."billing_customers" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own invoices" on "public"."billing_invoices";
create policy "Users see own invoices" on "public"."billing_invoices" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own subscriptions" on "public"."billing_subscriptions";
create policy "Users see own subscriptions" on "public"."billing_subscriptions" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own brand assets" on "public"."brand_assets";
create policy "Users manage own brand assets" on "public"."brand_assets" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own brand assistant sessions" on "public"."brand_assistant_sessions";
create policy "Users manage own brand assistant sessions" on "public"."brand_assistant_sessions" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own brand identity generations" on "public"."brand_identity_generations";
create policy "Users can delete own brand identity generations" on "public"."brand_identity_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own brand identity generations" on "public"."brand_identity_generations";
create policy "Users can insert own brand identity generations" on "public"."brand_identity_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own brand identity generations" on "public"."brand_identity_generations";
create policy "Users can update own brand identity generations" on "public"."brand_identity_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own brand identity generations" on "public"."brand_identity_generations";
create policy "Users can view own brand identity generations" on "public"."brand_identity_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own brand kit versions" on "public"."brand_kit_versions";
create policy "Users manage own brand kit versions" on "public"."brand_kit_versions" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own brand kits" on "public"."brand_kits";
create policy "Users manage own brand kits" on "public"."brand_kits" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own approvals" on "public"."business_approvals";
create policy "Users manage own approvals" on "public"."business_approvals" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own departments" on "public"."business_departments";
create policy "Users manage own departments" on "public"."business_departments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own business generations" on "public"."business_generations";
create policy "Users can delete own business generations" on "public"."business_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own business generations" on "public"."business_generations";
create policy "Users can insert own business generations" on "public"."business_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own business generations" on "public"."business_generations";
create policy "Users can update own business generations" on "public"."business_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own business generations" on "public"."business_generations";
create policy "Users can view own business generations" on "public"."business_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own business ideas" on "public"."business_ideas";
create policy "Users can delete own business ideas" on "public"."business_ideas" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own business ideas" on "public"."business_ideas";
create policy "Users can insert own business ideas" on "public"."business_ideas" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own business ideas" on "public"."business_ideas";
create policy "Users can update own business ideas" on "public"."business_ideas" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own business ideas" on "public"."business_ideas";
create policy "Users can view own business ideas" on "public"."business_ideas" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own kpis" on "public"."business_kpis";
create policy "Users manage own kpis" on "public"."business_kpis" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own milestones" on "public"."business_milestones";
create policy "Users manage own milestones" on "public"."business_milestones" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own organizations" on "public"."business_organizations";
create policy "Users manage own organizations" on "public"."business_organizations" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own projects" on "public"."business_projects";
create policy "Users manage own projects" on "public"."business_projects" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own roles" on "public"."business_roles";
create policy "Users manage own roles" on "public"."business_roles" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own tasks" on "public"."business_tasks";
create policy "Users manage own tasks" on "public"."business_tasks" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own teams" on "public"."business_teams";
create policy "Users manage own teams" on "public"."business_teams" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own workflows" on "public"."business_workflows";
create policy "Users manage own workflows" on "public"."business_workflows" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own calendar entries" on "public"."content_calendar";
create policy "Users can delete own calendar entries" on "public"."content_calendar" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own calendar entries" on "public"."content_calendar";
create policy "Users can insert own calendar entries" on "public"."content_calendar" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own calendar entries" on "public"."content_calendar";
create policy "Users can update own calendar entries" on "public"."content_calendar" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own calendar entries" on "public"."content_calendar";
create policy "Users can view own calendar entries" on "public"."content_calendar" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own content documents" on "public"."content_documents";
create policy "Users can delete own content documents" on "public"."content_documents" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own content documents" on "public"."content_documents";
create policy "Users can insert own content documents" on "public"."content_documents" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own content documents" on "public"."content_documents";
create policy "Users can update own content documents" on "public"."content_documents" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own content documents" on "public"."content_documents";
create policy "Users can view own content documents" on "public"."content_documents" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own content generations" on "public"."content_generations";
create policy "Users can delete own content generations" on "public"."content_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own content generations" on "public"."content_generations";
create policy "Users can insert own content generations" on "public"."content_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own content generations" on "public"."content_generations";
create policy "Users can update own content generations" on "public"."content_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own content generations" on "public"."content_generations";
create policy "Users can view own content generations" on "public"."content_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own content projects" on "public"."content_projects";
create policy "Users can delete own content projects" on "public"."content_projects" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own content projects" on "public"."content_projects";
create policy "Users can insert own content projects" on "public"."content_projects" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own content projects" on "public"."content_projects";
create policy "Users can update own content projects" on "public"."content_projects" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own content projects" on "public"."content_projects";
create policy "Users can view own content projects" on "public"."content_projects" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own content templates" on "public"."content_templates";
create policy "Users can delete own content templates" on "public"."content_templates" for delete
  using ((((select auth.uid()) = user_id) AND (is_system = false)));

drop policy if exists "Users can insert own content templates" on "public"."content_templates";
create policy "Users can insert own content templates" on "public"."content_templates" for insert
  with check ((((select auth.uid()) = user_id) AND (is_system = false)));

drop policy if exists "Users can update own content templates" on "public"."content_templates";
create policy "Users can update own content templates" on "public"."content_templates" for update
  using ((((select auth.uid()) = user_id) AND (is_system = false)));

drop policy if exists "Users can view system and own content templates" on "public"."content_templates";
create policy "Users can view system and own content templates" on "public"."content_templates" for select
  using (((is_system = true) OR ((select auth.uid()) = user_id)));

drop policy if exists "Users can delete own content versions" on "public"."content_versions";
create policy "Users can delete own content versions" on "public"."content_versions" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own content versions" on "public"."content_versions";
create policy "Users can insert own content versions" on "public"."content_versions" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can view own content versions" on "public"."content_versions";
create policy "Users can view own content versions" on "public"."content_versions" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own credits" on "public"."credit_balances";
create policy "Users see own credits" on "public"."credit_balances" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own credit ledger" on "public"."credit_ledger";
create policy "Users see own credit ledger" on "public"."credit_ledger" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm accounts" on "public"."crm_accounts";
create policy "Users manage own crm accounts" on "public"."crm_accounts" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm activities" on "public"."crm_activities";
create policy "Users manage own crm activities" on "public"."crm_activities" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm analytics" on "public"."crm_analytics";
create policy "Users manage own crm analytics" on "public"."crm_analytics" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm assignments" on "public"."crm_assignments";
create policy "Users manage own crm assignments" on "public"."crm_assignments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users see own crm audit" on "public"."crm_audit_log";
create policy "Users see own crm audit" on "public"."crm_audit_log" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm automation" on "public"."crm_automation_rules";
create policy "Users manage own crm automation" on "public"."crm_automation_rules" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm contacts" on "public"."crm_contacts";
create policy "Users manage own crm contacts" on "public"."crm_contacts" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm deals" on "public"."crm_deals";
create policy "Users manage own crm deals" on "public"."crm_deals" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm leads" on "public"."crm_leads";
create policy "Users manage own crm leads" on "public"."crm_leads" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm notes" on "public"."crm_notes";
create policy "Users manage own crm notes" on "public"."crm_notes" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm stages" on "public"."crm_stages";
create policy "Users manage own crm stages" on "public"."crm_stages" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own crm tasks" on "public"."crm_tasks";
create policy "Users manage own crm tasks" on "public"."crm_tasks" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber alerts" on "public"."cyber_alerts";
create policy "Users manage own cyber alerts" on "public"."cyber_alerts" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber assets" on "public"."cyber_assets";
create policy "Users manage own cyber assets" on "public"."cyber_assets" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber audit log" on "public"."cyber_audit_log";
create policy "Users manage own cyber audit log" on "public"."cyber_audit_log" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber case events" on "public"."cyber_case_events";
create policy "Users manage own cyber case events" on "public"."cyber_case_events" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber cases" on "public"."cyber_cases";
create policy "Users manage own cyber cases" on "public"."cyber_cases" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber detection rules" on "public"."cyber_detection_rules";
create policy "Users manage own cyber detection rules" on "public"."cyber_detection_rules" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber events" on "public"."cyber_events";
create policy "Users manage own cyber events" on "public"."cyber_events" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber feeds" on "public"."cyber_feeds";
create policy "Users manage own cyber feeds" on "public"."cyber_feeds" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber findings" on "public"."cyber_findings";
create policy "Users manage own cyber findings" on "public"."cyber_findings" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber incidents" on "public"."cyber_incidents";
create policy "Users manage own cyber incidents" on "public"."cyber_incidents" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber iocs" on "public"."cyber_iocs";
create policy "Users manage own cyber iocs" on "public"."cyber_iocs" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber metrics" on "public"."cyber_metrics";
create policy "Users manage own cyber metrics" on "public"."cyber_metrics" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber orgs" on "public"."cyber_organizations";
create policy "Users manage own cyber orgs" on "public"."cyber_organizations" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber osint" on "public"."cyber_osint_results";
create policy "Users manage own cyber osint" on "public"."cyber_osint_results" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber playbooks" on "public"."cyber_playbooks";
create policy "Users manage own cyber playbooks" on "public"."cyber_playbooks" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber risk scores" on "public"."cyber_risk_scores";
create policy "Users manage own cyber risk scores" on "public"."cyber_risk_scores" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber roles" on "public"."cyber_roles";
create policy "Users manage own cyber roles" on "public"."cyber_roles" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber scans" on "public"."cyber_scans";
create policy "Users manage own cyber scans" on "public"."cyber_scans" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber threat reports" on "public"."cyber_threat_reports";
create policy "Users manage own cyber threat reports" on "public"."cyber_threat_reports" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber threats" on "public"."cyber_threats";
create policy "Users manage own cyber threats" on "public"."cyber_threats" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber users" on "public"."cyber_users";
create policy "Users manage own cyber users" on "public"."cyber_users" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own cyber vulnerabilities" on "public"."cyber_vulnerabilities";
create policy "Users manage own cyber vulnerabilities" on "public"."cyber_vulnerabilities" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own design assets" on "public"."design_assets";
create policy "Users manage own design assets" on "public"."design_assets" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own design canvas" on "public"."design_canvas";
create policy "Users manage own design canvas" on "public"."design_canvas" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own editor history" on "public"."design_editor_history";
create policy "Users manage own editor history" on "public"."design_editor_history" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own design generations" on "public"."design_generations";
create policy "Users manage own design generations" on "public"."design_generations" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own design layers" on "public"."design_layers";
create policy "Users manage own design layers" on "public"."design_layers" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own design projects" on "public"."design_projects";
create policy "Users manage own design projects" on "public"."design_projects" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "design_systems_owner_insert" on "public"."design_systems";
create policy "design_systems_owner_insert" on "public"."design_systems" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "design_systems_owner_select" on "public"."design_systems";
create policy "design_systems_owner_select" on "public"."design_systems" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Anyone can read system templates v2" on "public"."design_templates_v2";
create policy "Anyone can read system templates v2" on "public"."design_templates_v2" for select
  using (((is_system = true) OR ((select auth.uid()) = user_id)));

drop policy if exists "Users manage own templates v2" on "public"."design_templates_v2";
create policy "Users manage own templates v2" on "public"."design_templates_v2" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp accounts" on "public"."erp_accounts";
create policy "Users manage own erp accounts" on "public"."erp_accounts" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp approvals" on "public"."erp_approvals";
create policy "Users manage own erp approvals" on "public"."erp_approvals" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp attendance" on "public"."erp_attendance";
create policy "Users manage own erp attendance" on "public"."erp_attendance" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp audit log" on "public"."erp_audit_log";
create policy "Users manage own erp audit log" on "public"."erp_audit_log" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp branches" on "public"."erp_branches";
create policy "Users manage own erp branches" on "public"."erp_branches" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp categories" on "public"."erp_categories";
create policy "Users manage own erp categories" on "public"."erp_categories" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp companies" on "public"."erp_companies";
create policy "Users manage own erp companies" on "public"."erp_companies" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp departments" on "public"."erp_departments";
create policy "Users manage own erp departments" on "public"."erp_departments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp employees" on "public"."erp_employees";
create policy "Users manage own erp employees" on "public"."erp_employees" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp expenses" on "public"."erp_expenses";
create policy "Users manage own erp expenses" on "public"."erp_expenses" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp invoices" on "public"."erp_invoices";
create policy "Users manage own erp invoices" on "public"."erp_invoices" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp journal entries" on "public"."erp_journal_entries";
create policy "Users manage own erp journal entries" on "public"."erp_journal_entries" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp metrics" on "public"."erp_metrics";
create policy "Users manage own erp metrics" on "public"."erp_metrics" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp payments" on "public"."erp_payments";
create policy "Users manage own erp payments" on "public"."erp_payments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp payroll" on "public"."erp_payroll";
create policy "Users manage own erp payroll" on "public"."erp_payroll" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp products" on "public"."erp_products";
create policy "Users manage own erp products" on "public"."erp_products" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp purchase orders" on "public"."erp_purchase_orders";
create policy "Users manage own erp purchase orders" on "public"."erp_purchase_orders" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp reports" on "public"."erp_reports";
create policy "Users manage own erp reports" on "public"."erp_reports" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp roles" on "public"."erp_roles";
create policy "Users manage own erp roles" on "public"."erp_roles" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp sales orders" on "public"."erp_sales_orders";
create policy "Users manage own erp sales orders" on "public"."erp_sales_orders" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp stock movements" on "public"."erp_stock_movements";
create policy "Users manage own erp stock movements" on "public"."erp_stock_movements" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp suppliers" on "public"."erp_suppliers";
create policy "Users manage own erp suppliers" on "public"."erp_suppliers" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp transactions" on "public"."erp_transactions";
create policy "Users manage own erp transactions" on "public"."erp_transactions" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own erp warehouses" on "public"."erp_warehouses";
create policy "Users manage own erp warehouses" on "public"."erp_warehouses" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own favorites" on "public"."favorites";
create policy "Users can delete own favorites" on "public"."favorites" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own favorites" on "public"."favorites";
create policy "Users can insert own favorites" on "public"."favorites" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can view own favorites" on "public"."favorites";
create policy "Users can view own favorites" on "public"."favorites" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "generated_designs_owner_insert" on "public"."generated_designs";
create policy "generated_designs_owner_insert" on "public"."generated_designs" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "generated_designs_owner_select" on "public"."generated_designs";
create policy "generated_designs_owner_select" on "public"."generated_designs" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "generated_images_owner_insert" on "public"."generated_images";
create policy "generated_images_owner_insert" on "public"."generated_images" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "generated_images_owner_select" on "public"."generated_images";
create policy "generated_images_owner_select" on "public"."generated_images" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own attachments" on "public"."generation_attachments";
create policy "Users can delete own attachments" on "public"."generation_attachments" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own attachments" on "public"."generation_attachments";
create policy "Users can insert own attachments" on "public"."generation_attachments" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own attachments" on "public"."generation_attachments";
create policy "Users can update own attachments" on "public"."generation_attachments" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own attachments" on "public"."generation_attachments";
create policy "Users can view own attachments" on "public"."generation_attachments" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own commissions" on "public"."growth_affiliate_commissions";
create policy "Users see own commissions" on "public"."growth_affiliate_commissions" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users see own payouts" on "public"."growth_affiliate_payouts";
create policy "Users see own payouts" on "public"."growth_affiliate_payouts" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users insert own affiliate" on "public"."growth_affiliates";
create policy "Users insert own affiliate" on "public"."growth_affiliates" for insert
  with check ((((select auth.uid()) = user_id) AND (status = 'pending'::text) AND (COALESCE(commission_rate_bps, 2000) = 2000) AND (COALESCE(total_clicks, 0) = 0) AND (COALESCE(total_referrals, 0) = 0) AND (COALESCE(total_earned_cents, 0) = 0) AND (COALESCE(total_paid_cents, 0) = 0)));

drop policy if exists "Users see own affiliate" on "public"."growth_affiliates";
create policy "Users see own affiliate" on "public"."growth_affiliates" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users update own affiliate profile" on "public"."growth_affiliates";
create policy "Users update own affiliate profile" on "public"."growth_affiliates" for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own automations" on "public"."growth_automations";
create policy "Users manage own automations" on "public"."growth_automations" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own contacts" on "public"."growth_contacts";
create policy "Users manage own contacts" on "public"."growth_contacts" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own deals" on "public"."growth_deals";
create policy "Users manage own deals" on "public"."growth_deals" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own campaigns" on "public"."growth_email_campaigns";
create policy "Users manage own campaigns" on "public"."growth_email_campaigns" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Anyone can insert growth events" on "public"."growth_events";
create policy "Anyone can insert growth events" on "public"."growth_events" for insert to "anon", "authenticated"
  with check (((user_id IS NULL) OR (user_id = (select auth.uid()))));

drop policy if exists "Users see own growth events" on "public"."growth_events";
create policy "Users see own growth events" on "public"."growth_events" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own experiments" on "public"."growth_experiments";
create policy "Users manage own experiments" on "public"."growth_experiments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own leads" on "public"."growth_leads";
create policy "Users manage own leads" on "public"."growth_leads" for all
  using (((select auth.uid()) = owner_user_id))
  with check (((select auth.uid()) = owner_user_id));

drop policy if exists "Users insert own referral code" on "public"."growth_referral_codes";
create policy "Users insert own referral code" on "public"."growth_referral_codes" for insert
  with check ((((select auth.uid()) = user_id) AND (COALESCE(reward_credits, 100) = 100) AND (COALESCE(invitee_reward_credits, 50) = 50) AND (COALESCE(total_invites, 0) = 0) AND (COALESCE(total_accepted, 0) = 0)));

drop policy if exists "Users see own referral code" on "public"."growth_referral_codes";
create policy "Users see own referral code" on "public"."growth_referral_codes" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users update own referral counters" on "public"."growth_referral_codes";
create policy "Users update own referral counters" on "public"."growth_referral_codes" for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own referral invites" on "public"."growth_referral_invites";
create policy "Users manage own referral invites" on "public"."growth_referral_invites" for all
  using (((select auth.uid()) = referrer_user_id))
  with check (((select auth.uid()) = referrer_user_id));

drop policy if exists "Users manage own segments" on "public"."growth_segments";
create policy "Users manage own segments" on "public"."growth_segments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own subscribers" on "public"."growth_subscribers";
create policy "Users manage own subscribers" on "public"."growth_subscribers" for all
  using (((select auth.uid()) = owner_user_id))
  with check (((select auth.uid()) = owner_user_id));

drop policy if exists "image_assets_owner_insert" on "public"."image_assets";
create policy "image_assets_owner_insert" on "public"."image_assets" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "image_assets_owner_select" on "public"."image_assets";
create policy "image_assets_owner_select" on "public"."image_assets" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own image generations" on "public"."image_generations";
create policy "Users can delete own image generations" on "public"."image_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own image generations" on "public"."image_generations";
create policy "Users can insert own image generations" on "public"."image_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own image generations" on "public"."image_generations";
create policy "Users can update own image generations" on "public"."image_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own image generations" on "public"."image_generations";
create policy "Users can view own image generations" on "public"."image_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "image_prompts_owner_insert" on "public"."image_prompts";
create policy "image_prompts_owner_insert" on "public"."image_prompts" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "image_prompts_owner_select" on "public"."image_prompts";
create policy "image_prompts_owner_select" on "public"."image_prompts" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "improvement_history_owner_insert" on "public"."improvement_history";
create policy "improvement_history_owner_insert" on "public"."improvement_history" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "improvement_history_owner_select" on "public"."improvement_history";
create policy "improvement_history_owner_select" on "public"."improvement_history" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own landing page generations" on "public"."landing_page_generations";
create policy "Users can delete own landing page generations" on "public"."landing_page_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own landing page generations" on "public"."landing_page_generations";
create policy "Users can insert own landing page generations" on "public"."landing_page_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can read own landing page generations" on "public"."landing_page_generations";
create policy "Users can read own landing page generations" on "public"."landing_page_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can update own landing page generations" on "public"."landing_page_generations";
create policy "Users can update own landing page generations" on "public"."landing_page_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own logo generations" on "public"."logo_generations";
create policy "Users can delete own logo generations" on "public"."logo_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own logo generations" on "public"."logo_generations";
create policy "Users can insert own logo generations" on "public"."logo_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own logo generations" on "public"."logo_generations";
create policy "Users can update own logo generations" on "public"."logo_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own logo generations" on "public"."logo_generations";
create policy "Users can view own logo generations" on "public"."logo_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own market analyses" on "public"."market_analyses";
create policy "Users can delete own market analyses" on "public"."market_analyses" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own market analyses" on "public"."market_analyses";
create policy "Users can insert own market analyses" on "public"."market_analyses" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own market analyses" on "public"."market_analyses";
create policy "Users can update own market analyses" on "public"."market_analyses" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own market analyses" on "public"."market_analyses";
create policy "Users can view own market analyses" on "public"."market_analyses" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own ads drafts" on "public"."marketing_ads_drafts";
create policy "Users can delete own ads drafts" on "public"."marketing_ads_drafts" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own ads drafts" on "public"."marketing_ads_drafts";
create policy "Users can insert own ads drafts" on "public"."marketing_ads_drafts" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own ads drafts" on "public"."marketing_ads_drafts";
create policy "Users can update own ads drafts" on "public"."marketing_ads_drafts" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own ads drafts" on "public"."marketing_ads_drafts";
create policy "Users can view own ads drafts" on "public"."marketing_ads_drafts" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing analytics" on "public"."marketing_analytics";
create policy "Users can delete own marketing analytics" on "public"."marketing_analytics" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing analytics" on "public"."marketing_analytics";
create policy "Users can insert own marketing analytics" on "public"."marketing_analytics" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing analytics" on "public"."marketing_analytics";
create policy "Users can update own marketing analytics" on "public"."marketing_analytics" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing analytics" on "public"."marketing_analytics";
create policy "Users can view own marketing analytics" on "public"."marketing_analytics" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own audience lists" on "public"."marketing_audience_lists";
create policy "Users can delete own audience lists" on "public"."marketing_audience_lists" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own audience lists" on "public"."marketing_audience_lists";
create policy "Users can insert own audience lists" on "public"."marketing_audience_lists" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own audience lists" on "public"."marketing_audience_lists";
create policy "Users can update own audience lists" on "public"."marketing_audience_lists" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own audience lists" on "public"."marketing_audience_lists";
create policy "Users can view own audience lists" on "public"."marketing_audience_lists" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing calendar" on "public"."marketing_calendar_events";
create policy "Users can delete own marketing calendar" on "public"."marketing_calendar_events" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing calendar" on "public"."marketing_calendar_events";
create policy "Users can insert own marketing calendar" on "public"."marketing_calendar_events" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing calendar" on "public"."marketing_calendar_events";
create policy "Users can update own marketing calendar" on "public"."marketing_calendar_events" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing calendar" on "public"."marketing_calendar_events";
create policy "Users can view own marketing calendar" on "public"."marketing_calendar_events" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing campaigns" on "public"."marketing_campaigns";
create policy "Users can delete own marketing campaigns" on "public"."marketing_campaigns" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing campaigns" on "public"."marketing_campaigns";
create policy "Users can insert own marketing campaigns" on "public"."marketing_campaigns" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing campaigns" on "public"."marketing_campaigns";
create policy "Users can update own marketing campaigns" on "public"."marketing_campaigns" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing campaigns" on "public"."marketing_campaigns";
create policy "Users can view own marketing campaigns" on "public"."marketing_campaigns" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own email campaigns" on "public"."marketing_email_campaigns";
create policy "Users can delete own email campaigns" on "public"."marketing_email_campaigns" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own email campaigns" on "public"."marketing_email_campaigns";
create policy "Users can insert own email campaigns" on "public"."marketing_email_campaigns" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own email campaigns" on "public"."marketing_email_campaigns";
create policy "Users can update own email campaigns" on "public"."marketing_email_campaigns" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own email campaigns" on "public"."marketing_email_campaigns";
create policy "Users can view own email campaigns" on "public"."marketing_email_campaigns" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own email queue" on "public"."marketing_email_queue";
create policy "Users can insert own email queue" on "public"."marketing_email_queue" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own email queue" on "public"."marketing_email_queue";
create policy "Users can update own email queue" on "public"."marketing_email_queue" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own email queue" on "public"."marketing_email_queue";
create policy "Users can view own email queue" on "public"."marketing_email_queue" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own email templates" on "public"."marketing_email_templates";
create policy "Users can delete own email templates" on "public"."marketing_email_templates" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own email templates" on "public"."marketing_email_templates";
create policy "Users can insert own email templates" on "public"."marketing_email_templates" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own email templates" on "public"."marketing_email_templates";
create policy "Users can update own email templates" on "public"."marketing_email_templates" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own email templates" on "public"."marketing_email_templates";
create policy "Users can view own email templates" on "public"."marketing_email_templates" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing integrations" on "public"."marketing_integrations";
create policy "Users can delete own marketing integrations" on "public"."marketing_integrations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing integrations" on "public"."marketing_integrations";
create policy "Users can insert own marketing integrations" on "public"."marketing_integrations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing integrations" on "public"."marketing_integrations";
create policy "Users can update own marketing integrations" on "public"."marketing_integrations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing integrations" on "public"."marketing_integrations";
create policy "Users can view own marketing integrations" on "public"."marketing_integrations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing personas" on "public"."marketing_personas";
create policy "Users can delete own marketing personas" on "public"."marketing_personas" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing personas" on "public"."marketing_personas";
create policy "Users can insert own marketing personas" on "public"."marketing_personas" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing personas" on "public"."marketing_personas";
create policy "Users can update own marketing personas" on "public"."marketing_personas" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing personas" on "public"."marketing_personas";
create policy "Users can view own marketing personas" on "public"."marketing_personas" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing plans" on "public"."marketing_plans";
create policy "Users can delete own marketing plans" on "public"."marketing_plans" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing plans" on "public"."marketing_plans";
create policy "Users can insert own marketing plans" on "public"."marketing_plans" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing plans" on "public"."marketing_plans";
create policy "Users can update own marketing plans" on "public"."marketing_plans" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing plans" on "public"."marketing_plans";
create policy "Users can view own marketing plans" on "public"."marketing_plans" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own marketing workflows" on "public"."marketing_workflows";
create policy "Users can delete own marketing workflows" on "public"."marketing_workflows" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own marketing workflows" on "public"."marketing_workflows";
create policy "Users can insert own marketing workflows" on "public"."marketing_workflows" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own marketing workflows" on "public"."marketing_workflows";
create policy "Users can update own marketing workflows" on "public"."marketing_workflows" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own marketing workflows" on "public"."marketing_workflows";
create policy "Users can view own marketing workflows" on "public"."marketing_workflows" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Owners manage creator private data" on "public"."marketplace_creator_private";
create policy "Owners manage creator private data" on "public"."marketplace_creator_private" for all
  using ((creator_id IN ( SELECT marketplace_creators.id
   FROM marketplace_creators
  WHERE (marketplace_creators.user_id = (select auth.uid())))))
  with check ((creator_id IN ( SELECT marketplace_creators.id
   FROM marketplace_creators
  WHERE (marketplace_creators.user_id = (select auth.uid())))));

drop policy if exists "Anyone can read creator public profile" on "public"."marketplace_creators";
create policy "Anyone can read creator public profile" on "public"."marketplace_creators" for select
  using (((user_id = (select auth.uid())) OR (id IN ( SELECT DISTINCT marketplace_template_listings.creator_id
   FROM marketplace_template_listings
  WHERE (marketplace_template_listings.status = 'published'::text)))));

drop policy if exists "Users delete own creator profile" on "public"."marketplace_creators";
create policy "Users delete own creator profile" on "public"."marketplace_creators" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users insert own creator profile" on "public"."marketplace_creators";
create policy "Users insert own creator profile" on "public"."marketplace_creators" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users update own creator profile" on "public"."marketplace_creators";
create policy "Users update own creator profile" on "public"."marketplace_creators" for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Creators view listing analytics" on "public"."marketplace_template_events";
create policy "Creators view listing analytics" on "public"."marketplace_template_events" for select
  using (((listing_id IN ( SELECT l.id
   FROM (marketplace_template_listings l
     JOIN marketplace_creators c ON ((c.id = l.creator_id)))
  WHERE (c.user_id = (select auth.uid())))) OR ((select auth.uid()) = user_id)));

drop policy if exists "Users insert analytics events" on "public"."marketplace_template_events";
create policy "Users insert analytics events" on "public"."marketplace_template_events" for insert
  with check ((((select auth.uid()) = user_id) OR (user_id IS NULL)));

drop policy if exists "Users manage own template favorites" on "public"."marketplace_template_favorites";
create policy "Users manage own template favorites" on "public"."marketplace_template_favorites" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Creators manage own listings" on "public"."marketplace_template_listings";
create policy "Creators manage own listings" on "public"."marketplace_template_listings" for all
  using ((creator_id IN ( SELECT marketplace_creators.id
   FROM marketplace_creators
  WHERE (marketplace_creators.user_id = (select auth.uid())))))
  with check ((creator_id IN ( SELECT marketplace_creators.id
   FROM marketplace_creators
  WHERE (marketplace_creators.user_id = (select auth.uid())))));

drop policy if exists "Public can view published listings" on "public"."marketplace_template_listings";
create policy "Public can view published listings" on "public"."marketplace_template_listings" for select
  using (((status = 'published'::text) OR (creator_id IN ( SELECT marketplace_creators.id
   FROM marketplace_creators
  WHERE (marketplace_creators.user_id = (select auth.uid()))))));

drop policy if exists "Buyers view own purchases" on "public"."marketplace_template_purchases";
create policy "Buyers view own purchases" on "public"."marketplace_template_purchases" for select
  using ((((select auth.uid()) = buyer_user_id) OR (creator_id IN ( SELECT marketplace_creators.id
   FROM marketplace_creators
  WHERE (marketplace_creators.user_id = (select auth.uid()))))));

drop policy if exists "Users manage own reviews" on "public"."marketplace_template_reviews";
create policy "Users manage own reviews" on "public"."marketplace_template_reviews" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Creators manage own versions" on "public"."marketplace_template_versions";
create policy "Creators manage own versions" on "public"."marketplace_template_versions" for all
  using ((listing_id IN ( SELECT l.id
   FROM (marketplace_template_listings l
     JOIN marketplace_creators c ON ((c.id = l.creator_id)))
  WHERE (c.user_id = (select auth.uid())))))
  with check ((listing_id IN ( SELECT l.id
   FROM (marketplace_template_listings l
     JOIN marketplace_creators c ON ((c.id = l.creator_id)))
  WHERE (c.user_id = (select auth.uid())))));

drop policy if exists "Public can view listing versions" on "public"."marketplace_template_versions";
create policy "Public can view listing versions" on "public"."marketplace_template_versions" for select
  using ((listing_id IN ( SELECT marketplace_template_listings.id
   FROM marketplace_template_listings
  WHERE ((marketplace_template_listings.status = 'published'::text) OR (marketplace_template_listings.creator_id IN ( SELECT marketplace_creators.id
           FROM marketplace_creators
          WHERE (marketplace_creators.user_id = (select auth.uid()))))))));

drop policy if exists "Service role inserts notifications" on "public"."notifications";
create policy "Service role inserts notifications" on "public"."notifications" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users see own notifications" on "public"."notifications";
create policy "Users see own notifications" on "public"."notifications" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users update own notifications" on "public"."notifications";
create policy "Users update own notifications" on "public"."notifications" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "optimization_reports_owner_insert" on "public"."optimization_reports";
create policy "optimization_reports_owner_insert" on "public"."optimization_reports" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "optimization_reports_owner_select" on "public"."optimization_reports";
create policy "optimization_reports_owner_select" on "public"."optimization_reports" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Members can be inserted by admins or first owner" on "public"."org_members";
create policy "Members can be inserted by admins or first owner" on "public"."org_members" for insert
  with check ((private.is_org_admin(organization_id) OR ((role = 'owner'::text) AND (user_id = (select auth.uid())) AND (NOT (EXISTS ( SELECT 1
   FROM org_members om
  WHERE (om.organization_id = org_members.organization_id)))))));

drop policy if exists "Org members and owners can view" on "public"."organizations";
create policy "Org members and owners can view" on "public"."organizations" for select
  using (((owner_id = (select auth.uid())) OR private.is_org_member(id)));

drop policy if exists "Org owners can update" on "public"."organizations";
create policy "Org owners can update" on "public"."organizations" for update
  using ((owner_id = (select auth.uid())));

drop policy if exists "Users can create organizations" on "public"."organizations";
create policy "Users can create organizations" on "public"."organizations" for insert
  with check ((owner_id = (select auth.uid())));

drop policy if exists "Users can insert own profile" on "public"."profiles";
create policy "Users can insert own profile" on "public"."profiles" for insert
  with check (((select auth.uid()) = id));

drop policy if exists "Users can update own profile" on "public"."profiles";
create policy "Users can update own profile" on "public"."profiles" for update
  using (((select auth.uid()) = id));

drop policy if exists "Users can view own profile" on "public"."profiles";
create policy "Users can view own profile" on "public"."profiles" for select
  using (((select auth.uid()) = id));

drop policy if exists "Users can delete own projects" on "public"."projects";
create policy "Users can delete own projects" on "public"."projects" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own projects" on "public"."projects";
create policy "Users can insert own projects" on "public"."projects" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own projects" on "public"."projects";
create policy "Users can update own projects" on "public"."projects" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own projects" on "public"."projects";
create policy "Users can view own projects" on "public"."projects" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users delete own private prompts" on "public"."prompt_library";
create policy "Users delete own private prompts" on "public"."prompt_library" for delete
  using ((((select auth.uid()) = user_id) AND (COALESCE(is_public, false) = false)));

drop policy if exists "Users insert own private prompts" on "public"."prompt_library";
create policy "Users insert own private prompts" on "public"."prompt_library" for insert
  with check ((((select auth.uid()) = user_id) AND (COALESCE(is_public, false) = false)));

drop policy if exists "Users select own or public prompts" on "public"."prompt_library";
create policy "Users select own or public prompts" on "public"."prompt_library" for select
  using ((((select auth.uid()) = user_id) OR (is_public = true)));

drop policy if exists "Users update own private prompts" on "public"."prompt_library";
create policy "Users update own private prompts" on "public"."prompt_library" for update
  using ((((select auth.uid()) = user_id) AND (COALESCE(is_public, false) = false)))
  with check ((((select auth.uid()) = user_id) AND (COALESCE(is_public, false) = false)));

drop policy if exists "Users can delete own reports" on "public"."reports";
create policy "Users can delete own reports" on "public"."reports" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own reports" on "public"."reports";
create policy "Users can insert own reports" on "public"."reports" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own reports" on "public"."reports";
create policy "Users can update own reports" on "public"."reports" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own reports" on "public"."reports";
create policy "Users can view own reports" on "public"."reports" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own jobs" on "public"."scheduled_jobs";
create policy "Users manage own jobs" on "public"."scheduled_jobs" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own social accounts" on "public"."social_accounts";
create policy "Users can delete own social accounts" on "public"."social_accounts" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own social accounts" on "public"."social_accounts";
create policy "Users can insert own social accounts" on "public"."social_accounts" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own social accounts" on "public"."social_accounts";
create policy "Users can update own social accounts" on "public"."social_accounts" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own social accounts" on "public"."social_accounts";
create policy "Users can view own social accounts" on "public"."social_accounts" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own social analytics" on "public"."social_analytics";
create policy "Users can delete own social analytics" on "public"."social_analytics" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own social analytics" on "public"."social_analytics";
create policy "Users can insert own social analytics" on "public"."social_analytics" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own social analytics" on "public"."social_analytics";
create policy "Users can update own social analytics" on "public"."social_analytics" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own social analytics" on "public"."social_analytics";
create policy "Users can view own social analytics" on "public"."social_analytics" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own social campaigns" on "public"."social_campaigns";
create policy "Users can delete own social campaigns" on "public"."social_campaigns" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own social campaigns" on "public"."social_campaigns";
create policy "Users can insert own social campaigns" on "public"."social_campaigns" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own social campaigns" on "public"."social_campaigns";
create policy "Users can update own social campaigns" on "public"."social_campaigns" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own social campaigns" on "public"."social_campaigns";
create policy "Users can view own social campaigns" on "public"."social_campaigns" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own social posts" on "public"."social_posts";
create policy "Users can delete own social posts" on "public"."social_posts" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own social posts" on "public"."social_posts";
create policy "Users can insert own social posts" on "public"."social_posts" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own social posts" on "public"."social_posts";
create policy "Users can update own social posts" on "public"."social_posts" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own social posts" on "public"."social_posts";
create policy "Users can view own social posts" on "public"."social_posts" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own social publish jobs" on "public"."social_publish_jobs";
create policy "Users can delete own social publish jobs" on "public"."social_publish_jobs" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own social publish jobs" on "public"."social_publish_jobs";
create policy "Users can insert own social publish jobs" on "public"."social_publish_jobs" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own social publish jobs" on "public"."social_publish_jobs";
create policy "Users can update own social publish jobs" on "public"."social_publish_jobs" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own social publish jobs" on "public"."social_publish_jobs";
create policy "Users can view own social publish jobs" on "public"."social_publish_jobs" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own social schedules" on "public"."social_schedules";
create policy "Users can delete own social schedules" on "public"."social_schedules" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own social schedules" on "public"."social_schedules";
create policy "Users can insert own social schedules" on "public"."social_schedules" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own social schedules" on "public"."social_schedules";
create policy "Users can update own social schedules" on "public"."social_schedules" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own social schedules" on "public"."social_schedules";
create policy "Users can view own social schedules" on "public"."social_schedules" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Org admins can manage invitations" on "public"."team_invitations";
create policy "Org admins can manage invitations" on "public"."team_invitations" for all
  using ((organization_id IN ( SELECT org_members.organization_id
   FROM org_members
  WHERE ((org_members.user_id = (select auth.uid())) AND (org_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));

drop policy if exists "Users insert own usage" on "public"."usage_records";
create policy "Users insert own usage" on "public"."usage_records" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users see own usage" on "public"."usage_records";
create policy "Users see own usage" on "public"."usage_records" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own preferences" on "public"."user_preferences";
create policy "Users can insert own preferences" on "public"."user_preferences" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own preferences" on "public"."user_preferences";
create policy "Users can update own preferences" on "public"."user_preferences" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own preferences" on "public"."user_preferences";
create policy "Users can view own preferences" on "public"."user_preferences" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video generations" on "public"."video_generations";
create policy "Users can delete own video generations" on "public"."video_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video generations" on "public"."video_generations";
create policy "Users can insert own video generations" on "public"."video_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video generations" on "public"."video_generations";
create policy "Users can update own video generations" on "public"."video_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own video generations" on "public"."video_generations";
create policy "Users can view own video generations" on "public"."video_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video media" on "public"."video_media";
create policy "Users can delete own video media" on "public"."video_media" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video media" on "public"."video_media";
create policy "Users can insert own video media" on "public"."video_media" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video media" on "public"."video_media";
create policy "Users can update own video media" on "public"."video_media" for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can view own video media" on "public"."video_media";
create policy "Users can view own video media" on "public"."video_media" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own render jobs" on "public"."video_render_jobs";
create policy "Users can insert own render jobs" on "public"."video_render_jobs" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own render jobs" on "public"."video_render_jobs";
create policy "Users can update own render jobs" on "public"."video_render_jobs" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own render jobs" on "public"."video_render_jobs";
create policy "Users can view own render jobs" on "public"."video_render_jobs" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own app deployments" on "public"."webapp_deployments";
create policy "Users can insert own app deployments" on "public"."webapp_deployments" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own app deployments" on "public"."webapp_deployments";
create policy "Users can update own app deployments" on "public"."webapp_deployments" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own app deployments" on "public"."webapp_deployments";
create policy "Users can view own app deployments" on "public"."webapp_deployments" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own webapp generations" on "public"."webapp_generations";
create policy "Users can delete own webapp generations" on "public"."webapp_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own webapp generations" on "public"."webapp_generations";
create policy "Users can insert own webapp generations" on "public"."webapp_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can read own webapp generations" on "public"."webapp_generations";
create policy "Users can read own webapp generations" on "public"."webapp_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can update own webapp generations" on "public"."webapp_generations";
create policy "Users can update own webapp generations" on "public"."webapp_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own webhooks" on "public"."webhooks";
create policy "Users manage own webhooks" on "public"."webhooks" for all
  using (((select auth.uid()) = user_id));

drop policy if exists "Owners read website analytics" on "public"."website_analytics_events";
create policy "Owners read website analytics" on "public"."website_analytics_events" for select
  using ((generation_id IN ( SELECT website_generations.id
   FROM website_generations
  WHERE (website_generations.user_id = (select auth.uid())))));

drop policy if exists "website_audits_owner_insert" on "public"."website_audits";
create policy "website_audits_owner_insert" on "public"."website_audits" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "website_audits_owner_select" on "public"."website_audits";
create policy "website_audits_owner_select" on "public"."website_audits" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "website_audits_owner_update" on "public"."website_audits";
create policy "website_audits_owner_update" on "public"."website_audits" for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Owners manage website builder snapshots" on "public"."website_builder_snapshots";
create policy "Owners manage website builder snapshots" on "public"."website_builder_snapshots" for all
  using ((EXISTS ( SELECT 1
   FROM website_generations wg
  WHERE ((wg.id = website_builder_snapshots.generation_id) AND (wg.user_id = (select auth.uid()))))))
  with check ((EXISTS ( SELECT 1
   FROM website_generations wg
  WHERE ((wg.id = website_builder_snapshots.generation_id) AND (wg.user_id = (select auth.uid()))))));

drop policy if exists "Owners manage website cms entries" on "public"."website_cms_entries";
create policy "Owners manage website cms entries" on "public"."website_cms_entries" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Owners insert website cms versions" on "public"."website_cms_versions";
create policy "Owners insert website cms versions" on "public"."website_cms_versions" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Owners read website cms versions" on "public"."website_cms_versions";
create policy "Owners read website cms versions" on "public"."website_cms_versions" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own deployment events" on "public"."website_deployment_events";
create policy "Users manage own deployment events" on "public"."website_deployment_events" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Owners read own website domains" on "public"."website_domains";
create policy "Owners read own website domains" on "public"."website_domains" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users manage own website domains" on "public"."website_domains";
create policy "Users manage own website domains" on "public"."website_domains" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users manage own website experiments" on "public"."website_experiments";
create policy "Users manage own website experiments" on "public"."website_experiments" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Collaborators and invitees can view membership" on "public"."website_generation_members";
create policy "Collaborators and invitees can view membership" on "public"."website_generation_members" for select
  using ((((select auth.uid()) = user_id) OR private.is_website_generation_member(generation_id, (select auth.uid())) OR ((status = 'pending'::text) AND (email IS NOT NULL) AND (lower(email) = lower(COALESCE(((select auth.jwt()) ->> 'email'::text), ''::text))))));

drop policy if exists "Generation owners manage members" on "public"."website_generation_members";
create policy "Generation owners manage members" on "public"."website_generation_members" for all
  using ((EXISTS ( SELECT 1
   FROM website_generations wg
  WHERE ((wg.id = website_generation_members.generation_id) AND (wg.user_id = (select auth.uid()))))))
  with check ((EXISTS ( SELECT 1
   FROM website_generations wg
  WHERE ((wg.id = website_generation_members.generation_id) AND (wg.user_id = (select auth.uid()))))));

drop policy if exists "Members can view shared website generations" on "public"."website_generations";
create policy "Members can view shared website generations" on "public"."website_generations" for select
  using (private.is_website_generation_member(id, (select auth.uid())));

drop policy if exists "Users can delete own website generations" on "public"."website_generations";
create policy "Users can delete own website generations" on "public"."website_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own website generations" on "public"."website_generations";
create policy "Users can insert own website generations" on "public"."website_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own website generations" on "public"."website_generations";
create policy "Users can update own website generations" on "public"."website_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own website generations" on "public"."website_generations";
create policy "Users can view own website generations" on "public"."website_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Owners manage website leads" on "public"."website_leads";
create policy "Owners manage website leads" on "public"."website_leads" for all
  using ((generation_id IN ( SELECT website_generations.id
   FROM website_generations
  WHERE (website_generations.user_id = (select auth.uid())))))
  with check ((generation_id IN ( SELECT website_generations.id
   FROM website_generations
  WHERE (website_generations.user_id = (select auth.uid())))));

drop policy if exists "Owners manage website media assets" on "public"."website_media_assets";
create policy "Owners manage website media assets" on "public"."website_media_assets" for all
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own website publications" on "public"."website_publications";
create policy "Users can delete own website publications" on "public"."website_publications" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own website publications" on "public"."website_publications";
create policy "Users can insert own website publications" on "public"."website_publications" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own website publications" on "public"."website_publications";
create policy "Users can update own website publications" on "public"."website_publications" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view published or own website publications" on "public"."website_publications";
create policy "Users can view published or own website publications" on "public"."website_publications" for select
  using (((status = 'published'::text) OR ((select auth.uid()) = user_id)));

drop policy if exists "Users can delete own workspace generations" on "public"."workspace_generations";
create policy "Users can delete own workspace generations" on "public"."workspace_generations" for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own workspace generations" on "public"."workspace_generations";
create policy "Users can insert own workspace generations" on "public"."workspace_generations" for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own workspace generations" on "public"."workspace_generations";
create policy "Users can update own workspace generations" on "public"."workspace_generations" for update
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can view own workspace generations" on "public"."workspace_generations";
create policy "Users can view own workspace generations" on "public"."workspace_generations" for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users delete own storage objects" on "storage"."objects";
create policy "Users delete own storage objects" on "storage"."objects" for delete
  using ((((select auth.role()) = 'authenticated'::text) AND (((bucket_id = 'brand-assets'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'generation-uploads'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'video-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'design-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'avatars'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = ANY (ARRAY['website-assets'::text, 'ai-assets'::text])) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text)))));

drop policy if exists "Users insert own storage objects" on "storage"."objects";
create policy "Users insert own storage objects" on "storage"."objects" for insert
  with check ((((select auth.role()) = 'authenticated'::text) AND (((bucket_id = 'brand-assets'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'generation-uploads'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'video-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'design-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'avatars'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = ANY (ARRAY['website-assets'::text, 'ai-assets'::text])) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text)))));

drop policy if exists "Users read own storage objects" on "storage"."objects";
create policy "Users read own storage objects" on "storage"."objects" for select
  using ((((bucket_id = 'brand-assets'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'generation-uploads'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'video-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'design-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'avatars'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = ANY (ARRAY['website-assets'::text, 'ai-assets'::text])) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text))));

drop policy if exists "Users update own storage objects" on "storage"."objects";
create policy "Users update own storage objects" on "storage"."objects" for update
  using ((((select auth.role()) = 'authenticated'::text) AND (((bucket_id = 'brand-assets'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'generation-uploads'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'video-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'design-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'avatars'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = ANY (ARRAY['website-assets'::text, 'ai-assets'::text])) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text)))))
  with check ((((select auth.role()) = 'authenticated'::text) AND (((bucket_id = 'brand-assets'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'generation-uploads'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'video-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'design-studio'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = 'avatars'::text) AND (((select auth.uid()))::text = (storage.foldername(name))[1])) OR ((bucket_id = ANY (ARRAY['website-assets'::text, 'ai-assets'::text])) AND ((storage.foldername(name))[1] = ((select auth.uid()))::text)))));
