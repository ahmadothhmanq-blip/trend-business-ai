-- Link brand identity generations to projects
alter table public.brand_identity_generations
  drop constraint if exists brand_identity_generations_project_id_fkey;

alter table public.brand_identity_generations
  add constraint brand_identity_generations_project_id_fkey
  foreign key (project_id) references public.projects(id) on delete set null;

create index if not exists idx_brand_identity_generations_project
  on public.brand_identity_generations(project_id);
