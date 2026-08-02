-- Migration 087: Consolidate overlapping permissive RLS policies
-- Split FOR ALL policies that duplicate SELECT/INSERT coverage (Splinter 0006).

-- design_templates_v2
drop policy if exists "Users manage own templates v2" on public.design_templates_v2;
create policy "Users insert own templates v2"
  on public.design_templates_v2 for insert
  with check ((select auth.uid()) = user_id);
create policy "Users update own templates v2"
  on public.design_templates_v2 for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete own templates v2"
  on public.design_templates_v2 for delete
  using ((select auth.uid()) = user_id);

-- growth_leads
drop policy if exists "Users manage own leads" on public.growth_leads;
create policy "Users read own leads"
  on public.growth_leads for select
  using ((select auth.uid()) = owner_user_id);
create policy "Users update own leads"
  on public.growth_leads for update
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);
create policy "Users delete own leads"
  on public.growth_leads for delete
  using ((select auth.uid()) = owner_user_id);

-- growth_subscribers
drop policy if exists "Users manage own subscribers" on public.growth_subscribers;
create policy "Users read own subscribers"
  on public.growth_subscribers for select
  using ((select auth.uid()) = owner_user_id);
create policy "Users update own subscribers"
  on public.growth_subscribers for update
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);
create policy "Users delete own subscribers"
  on public.growth_subscribers for delete
  using ((select auth.uid()) = owner_user_id);

-- marketplace_template_listings
drop policy if exists "Creators manage own listings" on public.marketplace_template_listings;
create policy "Creators insert own listings"
  on public.marketplace_template_listings for insert
  with check (
    creator_id in (
      select id from public.marketplace_creators where user_id = (select auth.uid())
    )
  );
create policy "Creators update own listings"
  on public.marketplace_template_listings for update
  using (
    creator_id in (
      select id from public.marketplace_creators where user_id = (select auth.uid())
    )
  )
  with check (
    creator_id in (
      select id from public.marketplace_creators where user_id = (select auth.uid())
    )
  );
create policy "Creators delete own listings"
  on public.marketplace_template_listings for delete
  using (
    creator_id in (
      select id from public.marketplace_creators where user_id = (select auth.uid())
    )
  );

-- marketplace_template_reviews
drop policy if exists "Users manage own reviews" on public.marketplace_template_reviews;
create policy "Users insert own reviews"
  on public.marketplace_template_reviews for insert
  with check ((select auth.uid()) = user_id);
create policy "Users update own reviews"
  on public.marketplace_template_reviews for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete own reviews"
  on public.marketplace_template_reviews for delete
  using ((select auth.uid()) = user_id);

-- marketplace_template_versions
drop policy if exists "Creators manage own versions" on public.marketplace_template_versions;
create policy "Creators insert own versions"
  on public.marketplace_template_versions for insert
  with check (
    listing_id in (
      select l.id
      from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = (select auth.uid())
    )
  );
create policy "Creators update own versions"
  on public.marketplace_template_versions for update
  using (
    listing_id in (
      select l.id
      from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = (select auth.uid())
    )
  )
  with check (
    listing_id in (
      select l.id
      from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = (select auth.uid())
    )
  );
create policy "Creators delete own versions"
  on public.marketplace_template_versions for delete
  using (
    listing_id in (
      select l.id
      from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = (select auth.uid())
    )
  );

-- website_domains
drop policy if exists "Users manage own website domains" on public.website_domains;
drop policy if exists "Owners read own website domains" on public.website_domains;
create policy "Owners read own website domains"
  on public.website_domains for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Owners insert own website domains"
  on public.website_domains for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Owners update own website domains"
  on public.website_domains for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners delete own website domains"
  on public.website_domains for delete to authenticated
  using ((select auth.uid()) = user_id);

-- website_generation_members
drop policy if exists "Generation owners manage members" on public.website_generation_members;
create policy "Generation owners insert members"
  on public.website_generation_members for insert
  with check (
    exists (
      select 1 from public.website_generations wg
      where wg.id = website_generation_members.generation_id
        and wg.user_id = (select auth.uid())
    )
  );
create policy "Generation owners update members"
  on public.website_generation_members for update
  using (
    exists (
      select 1 from public.website_generations wg
      where wg.id = website_generation_members.generation_id
        and wg.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.website_generations wg
      where wg.id = website_generation_members.generation_id
        and wg.user_id = (select auth.uid())
    )
  );
create policy "Generation owners delete members"
  on public.website_generation_members for delete
  using (
    exists (
      select 1 from public.website_generations wg
      where wg.id = website_generation_members.generation_id
        and wg.user_id = (select auth.uid())
    )
  );

-- website_generations
drop policy if exists "Members can view shared website generations" on public.website_generations;
drop policy if exists "Users can view own website generations" on public.website_generations;
create policy "Users can view own or shared website generations"
  on public.website_generations for select
  using (
    (select auth.uid()) = user_id
    or private.is_website_generation_member(id, (select auth.uid()))
  );

-- website_leads
drop policy if exists "Owners manage website leads" on public.website_leads;
create policy "Owners read website leads"
  on public.website_leads for select
  using (
    generation_id in (
      select id from public.website_generations where user_id = (select auth.uid())
    )
  );
create policy "Owners update website leads"
  on public.website_leads for update
  using (
    generation_id in (
      select id from public.website_generations where user_id = (select auth.uid())
    )
  )
  with check (
    generation_id in (
      select id from public.website_generations where user_id = (select auth.uid())
    )
  );
create policy "Owners delete website leads"
  on public.website_leads for delete
  using (
    generation_id in (
      select id from public.website_generations where user_id = (select auth.uid())
    )
  );
