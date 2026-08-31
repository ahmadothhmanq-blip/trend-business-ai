import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import pg from "pg";

type PgClient = InstanceType<typeof pg.Client>;
type PgQueryResultRow = Record<string, unknown>;

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

function skipDb(): boolean {
  if (dbUrl) return false;
  console.log("skip: SUPABASE_DB_URL unset");
  return true;
}

async function expectSqlFailure(
  client: PgClient,
  fn: () => Promise<unknown>,
  pattern: RegExp,
): Promise<void> {
  await client.query("savepoint sp_fail");
  try {
    await fn();
    await client.query("rollback to savepoint sp_fail");
    assert.fail("expected SQL failure");
  } catch (error) {
    try {
      await client.query("rollback to savepoint sp_fail");
    } catch {
      /* transaction already closed */
    }
    if (error instanceof assert.AssertionError) throw error;
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    const message = error instanceof Error ? error.message : String(error);
    assert.match(`${code} ${message}`, pattern);
  }
}

async function withClient<T>(fn: (client: PgClient) => Promise<T>): Promise<T> {
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

test("db: schema tables exist", async (t) => {
  if (skipDb()) return t.skip();
  await withClient(async (client) => {
    for (const table of [
      "video_generations",
      "video_plans",
      "video_scenes",
      "video_provider_jobs",
      "video_media",
      "video_quality_reports",
      "video_render_jobs",
      "video_artifacts",
      "video_audio_plans",
      "video_audio_tracks",
      "video_audio_jobs",
    ]) {
      const { rows } = await client.query(`select to_regclass('public.${table}') as reg`);
      assert.ok(rows[0]?.reg, `missing ${table}`);
    }
  });
});

test("db: foreign keys, indexes, unique, rls", async (t) => {
  if (skipDb()) return t.skip();
  await withClient(async (client) => {
    const fks = await client.query(`
      select conrelid::regclass::text as tbl, conname
      from pg_constraint
      where contype = 'f'
        and conrelid::regclass::text in (
          'video_plans', 'video_scenes', 'video_provider_jobs',
          'video_quality_reports', 'video_media', 'video_render_jobs',
          'public.video_plans', 'public.video_scenes', 'public.video_provider_jobs',
          'public.video_quality_reports', 'public.video_media', 'public.video_render_jobs'
        )
    `);
    const names = fks.rows.map((r: PgQueryResultRow) => String(r.conname));
    assert.ok(names.some((n: string) => n.includes("video_plans") && n.includes("project")));
    assert.ok(names.some((n: string) => n.includes("video_scenes") && n.includes("project")));
    assert.ok(names.some((n: string) => n.includes("provider_jobs")));
    assert.ok(names.some((n: string) => n.includes("quality_reports")));

    const uniqueNames = [
      "video_provider_jobs_idempotency_key_key",
      "video_provider_jobs_scene_provider_key",
      "video_scenes_plan_order_key",
      "video_plans_project_version_key",
      "video_audio_jobs_idempotency_key_key",
    ];
    const uniq = await client.query(
      `select name from (
         select conname as name from pg_constraint where contype = 'u' and conname = any($1::text[])
         union
         select indexname as name from pg_indexes where schemaname = 'public' and indexname = any($1::text[])
       ) t`,
      [uniqueNames],
    );
    assert.equal(uniq.rowCount, uniqueNames.length);

    const idx = await client.query(`
      select indexname from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'idx_video_scenes_project_status',
          'idx_video_provider_jobs_project_status',
          'idx_video_provider_jobs_scene_status',
          'idx_video_media_generation_kind',
          'idx_video_media_scene_id',
          'idx_video_quality_reports_project_id',
          'idx_video_audio_plans_project',
          'idx_video_audio_tracks_plan',
          'idx_video_audio_jobs_project_status'
        )
    `);
    assert.equal(idx.rowCount, 9);

    const rls = await client.query(`
      select c.relname, c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('video_plans', 'video_scenes', 'video_provider_jobs', 'video_quality_reports', 'video_audio_plans', 'video_audio_tracks', 'video_audio_jobs')
    `);
    assert.equal(rls.rows.length, 7);
    assert.ok(rls.rows.every((row: PgQueryResultRow) => row.relrowsecurity === true));
  });
});

test("db: domain write path + guards", async (t) => {
  if (skipDb()) return t.skip();
  await withClient(async (client) => {
    const users = await client.query(`select id from auth.users limit 2`);
    if (users.rowCount === 0) {
      t.skip("no auth.users for FK");
      return;
    }
    const userA = users.rows[0]!.id as string;
    const userB = (users.rows[1]?.id as string | undefined) || userA;

    const before = await client.query(`
      select
        (select count(*)::int from public.video_generations) as generations,
        (select count(*)::int from public.video_plans) as plans,
        (select count(*)::int from public.video_scenes) as scenes
    `);

    await client.query("begin");
    try {
      const project = await client.query(
        `insert into public.video_generations (
           user_id, video_name, video_type, description, style, aspect_ratio,
           duration, options, prompt, blueprint, status, domain_state, mode
         ) values (
           $1, 'Phase 2 Domain Project', 'storyboard', '', 'Cinematic', '16:9',
           '10s', '[]'::jsonb, 'domain persist', '{}'::jsonb, 'storyboard_ready', 'planning', 'generate'
         ) returning id`,
        [userA],
      );
      const projectId = project.rows[0]!.id as string;

      const plan = await client.query(
        `insert into public.video_plans (
           user_id, project_id, version, objective, language, aspect_ratio,
           duration_sec, style, pacing, preferred_provider
         ) values ($1, $2, 1, 'Launch film', 'en', '16:9', 10, 'Cinematic', 'measured', 'auto')
         returning id`,
        [userA, projectId],
      );
      const planId = plan.rows[0]!.id as string;

      const sceneA = await client.query(
        `insert into public.video_scenes (
           user_id, project_id, plan_id, scene_order, duration_sec, prompt, camera,
           visual_style, scene_references, characters, products, dialogue, audio, transition,
           provider_preference, fallback_provider, status
         ) values (
           $1, $2, $3, 0, 5, 'Cinematic product hero shot in a controlled studio',
           '{"move":"Slow push-in"}'::jsonb, 'Cinematic', '[]'::jsonb, '[]'::jsonb,
           '["product-1"]'::jsonb, '{"text":"Built for operators.","language":"en"}'::jsonb,
           '{"sfx":[]}'::jsonb, 'cut', 'auto', 'kling', 'planned'
         ) returning id`,
        [userA, projectId, planId],
      );
      const sceneB = await client.query(
        `insert into public.video_scenes (
           user_id, project_id, plan_id, scene_order, duration_sec, prompt, camera,
           visual_style, scene_references, characters, products, dialogue, audio, transition,
           provider_preference, status
         ) values (
           $1, $2, $3, 1, 5, 'Studio lighting pass over the product table',
           '{"move":"Static"}'::jsonb, 'Cinematic', '[]'::jsonb, '[]'::jsonb,
           '[]'::jsonb, '{"text":"Next.","language":"en"}'::jsonb,
           '{"sfx":[]}'::jsonb, 'cut', 'auto', 'planned'
         ) returning id`,
        [userA, projectId, planId],
      );
      const sceneId = sceneA.rows[0]!.id as string;
      const sceneIdB = sceneB.rows[0]!.id as string;

      await expectSqlFailure(
        client,
        () =>
          client.query(
            `insert into public.video_scenes (
               user_id, project_id, plan_id, scene_order, duration_sec, prompt, camera,
               visual_style, dialogue, audio, transition, provider_preference, status
             ) values (
               $1, $2, $3, 2, 0, 'Zero duration must fail',
               '{"move":"Static"}'::jsonb, 'Cinematic',
               '{"text":"x","language":"en"}'::jsonb, '{}'::jsonb, 'cut', 'auto', 'planned'
             )`,
            [userA, projectId, planId],
          ),
        /duration|23514/,
      );

      await client.query(
        `update public.video_scenes set scene_order = scene_order + 1000 where project_id = $1`,
        [projectId],
      );
      await client.query(`update public.video_scenes set scene_order = 0 where id = $1`, [sceneIdB]);
      await client.query(`update public.video_scenes set scene_order = 1 where id = $1`, [sceneId]);
      const ordered = await client.query(
        `select id from public.video_scenes where project_id = $1 order by scene_order`,
        [projectId],
      );
      assert.equal(ordered.rows[0]!.id, sceneIdB);
      assert.equal(ordered.rows[1]!.id, sceneId);

      const idempotencyKey = `${projectId}:${sceneId}:kling:prompt-hash-aa`;
      await client.query(
        `insert into public.video_provider_jobs (
           user_id, project_id, scene_id, provider, status, attempt, idempotency_key
         ) values ($1, $2, $3, 'kling', 'queued', 1, $4)`,
        [userA, projectId, sceneId, idempotencyKey],
      );
      await expectSqlFailure(
        client,
        () =>
          client.query(
            `insert into public.video_provider_jobs (
               user_id, project_id, scene_id, provider, status, attempt, idempotency_key
             ) values ($1, $2, $3, 'kling', 'queued', 1, $4)`,
            [userA, projectId, sceneId, idempotencyKey],
          ),
        /duplicate|unique|23505/i,
      );

      await expectSqlFailure(
        client,
        () =>
          client.query(
            `insert into public.video_media (
               id, user_id, generation_id, kind, mime_type, storage_path, size_bytes, duration_sec, provider
             ) values ($1, $2, $3, 'composite', 'image/svg+xml', $4, 10, 8, 'kling')`,
            [`svg-${Date.now()}`, userA, projectId, `${userA}/${projectId}/bad.svg`],
          ),
        /SVG|23514/,
      );

      await expectSqlFailure(
        client,
        () =>
          client.query(
            `update public.video_generations set status = 'video_rendered', domain_state = 'video_rendered' where id = $1`,
            [projectId],
          ),
        /playable|23514/,
      );

      const artifactId = `art-${Date.now()}`;
      await client.query(
        `insert into public.video_media (
           id, user_id, generation_id, scene_id, kind, mime_type, storage_path, size_bytes,
           duration_sec, provider
         ) values ($1, $2, $3, $4, 'composite', 'video/mp4', $5, 2048, 8, 'kling')`,
        [artifactId, userA, projectId, sceneId, `${userA}/${projectId}/out.mp4`],
      );

      const report = await client.query(
        `insert into public.video_quality_reports (
           user_id, project_id, scene_id, artifact_id, score, blockers, warnings, report
         ) values ($1, $2, $3, $4, 91, '[]'::jsonb, '[]'::jsonb, '{"summary":"Ready"}'::jsonb)
         returning id, artifact_id, scene_id`,
        [userA, projectId, sceneId, artifactId],
      );
      assert.equal(report.rows[0]!.artifact_id, artifactId);
      assert.equal(report.rows[0]!.scene_id, sceneId);

      await expectSqlFailure(
        client,
        () =>
          client.query(
            `insert into public.video_provider_jobs (
               user_id, project_id, scene_id, provider, status, attempt, idempotency_key
             ) values ($1, $2, $3, 'kling', 'queued', 1, $4)`,
            [userA, projectId, "00000000-0000-4000-8000-000000000000", `${projectId}:missing:kling:x`],
          ),
        /foreign key|23503/i,
      );

      await client.query(
        `update public.video_generations
         set status = 'video_rendered', domain_state = 'video_rendered'
         where id = $1`,
        [projectId],
      );

      await client.query(
        `update public.video_generations set domain_state = 'published' where id = $1`,
        [projectId],
      );

      await expectSqlFailure(
        client,
        () =>
          client.query(
            `update public.video_generations set status = 'completed' where id = $1`,
            [projectId],
          ),
        /completed|23514/,
      );

      if (userB !== userA) {
        try {
          await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userB]);
          await client.query(
            `select set_config('request.jwt.claims', $1, true)`,
            [JSON.stringify({ sub: userB, role: "authenticated" })],
          );
          await client.query("set local role authenticated");
          const hidden = await client.query(
            `select id from public.video_scenes where project_id = $1`,
            [projectId],
          );
          assert.equal(hidden.rowCount, 0);
          const hiddenPlans = await client.query(
            `select id from public.video_plans where project_id = $1`,
            [projectId],
          );
          assert.equal(hiddenPlans.rowCount, 0);
          const hiddenArt = await client.query(
            `select id from public.video_media where generation_id = $1`,
            [projectId],
          );
          assert.equal(hiddenArt.rowCount, 0);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (/permission denied|role .* does not exist/i.test(message)) {
            t.diagnostic(`RLS role probe skipped: ${message}`);
          } else {
            throw error;
          }
        }
      }
    } finally {
      await client.query("rollback");
    }

    const after = await client.query(`
      select
        (select count(*)::int from public.video_generations) as generations,
        (select count(*)::int from public.video_plans) as plans,
        (select count(*)::int from public.video_scenes) as scenes
    `);
    assert.deepEqual(after.rows[0], before.rows[0]);
  });
});

test("db: existing projects still readable including legacy completed", async (t) => {
  if (skipDb()) return t.skip();
  await withClient(async (client) => {
    const { rows } = await client.query(`
      select id, status, domain_state, blueprint is not null as has_blueprint
      from public.video_generations
      order by created_at desc
      limit 20
    `);
    for (const row of rows) {
      assert.ok(row.id);
      assert.ok(typeof row.status === "string");
      if (row.status === "completed") {
        assert.equal(row.domain_state, "storyboard_ready");
      }
    }
  });
});

test("db: audio engine tables persist jobs and reject duplicate idempotency", async (t) => {
  if (skipDb()) return t.skip();
  await withClient(async (client) => {
    const users = await client.query(`select id from auth.users limit 1`);
    if (users.rowCount === 0) {
      t.skip("no auth.users for FK");
      return;
    }
    const userId = users.rows[0]!.id as string;
    const policies = await client.query(`
      select c.relname, count(p.polname)::int as policies
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      join pg_policy p on p.polrelid = c.oid
      where n.nspname = 'public'
        and c.relname in ('video_audio_plans', 'video_audio_tracks', 'video_audio_jobs')
      group by c.relname
    `);
    assert.equal(policies.rowCount, 3);
    assert.ok(policies.rows.every((row: PgQueryResultRow) => Number(row.policies) >= 4));

    await client.query("begin");
    try {
      const project = await client.query(
        `insert into public.video_generations (
           user_id, video_name, video_type, description, style, aspect_ratio,
           duration, options, prompt, blueprint, status, domain_state, mode
         ) values (
           $1, 'Phase 7A Audio', 'storyboard', '', 'Cinematic', '16:9',
           '8s', '[]'::jsonb, 'audio persist', '{}'::jsonb, 'storyboard_ready', 'planning', 'generate'
         ) returning id`,
        [userId],
      );
      const projectId = project.rows[0]!.id as string;
      const plan = await client.query(
        `insert into public.video_audio_plans (
           user_id, project_id, language, voice_script, target_duration_sec, status
         ) values ($1, $2, 'en', 'Built for operators.', 8, 'queued')
         returning id`,
        [userId, projectId],
      );
      const audioPlanId = plan.rows[0]!.id as string;
      const track = await client.query(
        `insert into public.video_audio_tracks (
           user_id, project_id, audio_plan_id, kind, metadata, status
         ) values ($1, $2, $3, 'voice', '{"speaker":"alloy"}'::jsonb, 'queued')
         returning id`,
        [userId, projectId, audioPlanId],
      );
      const trackId = track.rows[0]!.id as string;
      const key = `7a-${projectId}-tts-openai-dup`;
      await client.query(
        `insert into public.video_audio_jobs (
           user_id, project_id, audio_plan_id, track_id, kind, provider, status,
           attempt, idempotency_key, estimated_cost, actual_cost
         ) values ($1, $2, $3, $4, 'tts', 'openai', 'queued', 1, $5, 2, null)`,
        [userId, projectId, audioPlanId, trackId, key],
      );
      await expectSqlFailure(
        client,
        () =>
          client.query(
            `insert into public.video_audio_jobs (
               user_id, project_id, audio_plan_id, track_id, kind, provider, status,
               attempt, idempotency_key, estimated_cost
             ) values ($1, $2, $3, $4, 'tts', 'openai', 'queued', 1, $5, 2)`,
            [userId, projectId, audioPlanId, trackId, key],
          ),
        /23505|duplicate|unique/i,
      );
    } finally {
      await client.query("rollback");
    }
  });
});
