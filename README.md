# Trend Business AI

A modern SaaS platform for AI-powered business intelligence — generate startup ideas, analyze markets, and create strategic reports.

## Tech Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript** — Full type safety
- **Tailwind CSS 4** — Utility-first styling with dark mode
- **Supabase** — Authentication and database
- **shadcn/ui** — Accessible UI components

## Features

- Modern landing page with features and pricing
- Supabase authentication (sign up, sign in, sign out)
- Protected dashboard with sidebar navigation
- Business ideas generator (AI-powered)
- Market analysis tool
- AI reports generator with download
- User profile management
- Responsive design
- Dark / light mode toggle

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a project at [supabase.com](https://supabase.com), then copy your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the SQL schema in the Supabase SQL Editor (optional, for profile storage):

```
supabase/schema.sql
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── (auth)/           # Login & signup pages
├── (dashboard)/      # Protected dashboard routes
├── api/              # API routes for AI features
├── auth/callback/    # Supabase OAuth callback
components/
├── auth/             # Auth forms
├── dashboard/        # Dashboard UI components
├── hero/             # Landing page hero
├── landing/          # Features & pricing sections
├── theme/            # Dark mode provider
└── ui/               # shadcn UI primitives
lib/
├── actions/          # Server actions
├── ai/               # AI generation logic
├── constants/        # Navigation & config
└── supabase/         # Supabase clients
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Overview |
| `/dashboard/ideas` | Business ideas generator |
| `/dashboard/market-analysis` | Market analysis |
| `/dashboard/reports` | AI reports |
| `/dashboard/profile` | User profile |

## License

MIT
