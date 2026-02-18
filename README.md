# Visual Notes Board

Visual, Miro-like notes board with nested folders, soft animations, Google OAuth via Supabase, and SaaS-ready architecture.

## Stack

- **Next.js (App Router)** + **TypeScript**
- **TailwindCSS** + **shadcn/ui-inspired components**
- **Framer Motion** for soft spring animations
- **Zustand** for client state
- **Supabase** (PostgreSQL + Auth + Storage)
- **Google OAuth** via Supabase

## Features

- Fixed-size canvas equal to viewport, no zoom or infinite scroll
- Draggable + resizable blocks
- Block types: text, image, checklist, likes, list, folder
- Unlimited nested blocks via `parent_block_id` (folder inner boards)
- Soft transitions, hover effects, rounded cards, modern SaaS-style UI
- Google login with Supabase, per-user boards/blocks isolation
- JSON export of current board (`Export JSON` button)
- Subscription-ready model with `subscription_status` on `app_users` and middleware hook

## Project structure

- `app/` – App Router routes (auth, app, API)
- `components/` – Shared UI components (shell, shadcn-style primitives)
- `features/` – Feature modules: `auth/`, `board/`
- `store/` – Zustand board store
- `lib/` – Supabase clients, utilities
- `services/` – Business logic for boards/blocks
- `types/` – Supabase types
- `supabase/` – SQL schema for Supabase

## Environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY"
```

On Vercel, set the same variables in **Project → Settings → Environment Variables**.

## Supabase setup

1. **Create project**

   - Go to Supabase, create a new project.
   - Copy the project URL and anon public key into `.env.local` as above.

2. **Apply SQL schema**

   - Open Supabase SQL editor.
   - Paste contents of `supabase/schema.sql`.
   - Run the script to create:
     - `app_users` (linked to `auth.users`)
     - `boards`
     - `blocks`
     - All required RLS policies.

3. **Storage bucket for images**

   - In **Storage → Buckets**, create a new bucket:
     - Name: `visual-notes-images`
     - Public: **enabled**
   - In bucket **Policies**, add a policy for authenticated users:

     ```sql
     create policy "Authenticated can manage images"
       on storage.objects for all
       using (auth.role() = 'authenticated')
       with check (auth.role() = 'authenticated');
     ```

4. **Google OAuth provider**

   - In Supabase project, go to **Authentication → Providers → Google**.
   - Enable the provider.
   - Set callback URL:
     - For local dev: `http://localhost:3000/auth/callback`
     - For production (Vercel): `https://YOUR_DOMAIN/auth/callback`
   - Fill in Google OAuth credentials:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create a new project or select existing one
     - Enable Google+ API
     - Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
     - Application type: **Web application**
     - Authorized redirect URIs: Add your Supabase callback URL (found in Supabase → Authentication → URL Configuration)
     - Copy **Client ID** and **Client Secret** to Supabase Google provider settings

## Local development

```bash
npm install
npm run dev
```

The app is available at `http://localhost:3000`.

- Opening `/` redirects you to `/app` or `/login` depending on auth state.
- `/login` shows Google login; successful login redirects to `/app`.
- `/app` loads (or creates) the default board and all blocks for the current user.

**Note:** Make sure to copy `.env.example` to `.env.local` and fill in your Supabase credentials before running locally.

## Deployment (Vercel + Supabase)

1. **Push code to Git repository** (GitHub, GitLab, etc.).
2. In Vercel, **Import Project** from your repo.
3. Set environment variables in Vercel:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Ensure your Supabase Google provider has callback:

   ```text
   https://YOUR_VERCEL_DOMAIN/auth/callback
   ```

5. Deploy. After deployment:

   - Visiting the site should show `/login`, then redirect to `/app` after Google auth.
   - Boards/blocks are isolated per Supabase user.

## Future monetization hook

- `app_users.subscription_status` is `free | pro`.
- `middleware.ts` authenticates requests to `/app` and `/api/boards`/`/api/blocks`.
- You can extend middleware to:
  - Fetch `subscription_status` from `app_users`.
  - Enforce limits (e.g., number of blocks or folders) for `free` tier.

## Notes

- All block mutations are routed through `/api/blocks` and synced to Supabase.
- Nested boards (folders) are implemented via `parent_block_id` and `FolderOverlay` with Framer Motion.
- Canvas is constrained to the viewport; dragging is bounded within the visible area.

