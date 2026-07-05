# Supabase migrations (execution order)

Run these files in order against your Supabase project (SQL Editor or CLI).

| Order | File | Creates |
| ----- | ---- | ------- |
| 1 | `001_profiles.sql` | `profiles` table, RLS, `handle_new_user` trigger |
| 2 | `002_business_ideas.sql` | `business_ideas` table + RLS |
| 3 | `003_market_analyses.sql` | `market_analyses` table + RLS |
| 4 | `004_reports.sql` | `reports` table + RLS |
| 5 | `005_favorites.sql` | `favorites` table + RLS |
| 6 | `006_user_preferences.sql` | `user_preferences` table + RLS, extends `handle_new_user` |
| 7 | `007_storage_avatars.sql` | `avatars` storage bucket + RLS |
| 8 | `008_website_generations.sql` | `website_generations` table + RLS |
| 9 | `009_website_favorites.sql` | Website favorite column, index, update RLS, and favorite type constraint |

Alternatively, run the consolidated `supabase/schema.sql` once on a fresh project.

Verify with: `npm run verify`
