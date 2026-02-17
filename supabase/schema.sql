-- Users table (linked to Supabase auth.users)
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  telegram_id text,
  username text,
  avatar text,
  subscription_status text not null default 'free' check (subscription_status in ('free', 'pro')),
  created_at timestamp with time zone default now()
);

alter table public.app_users enable row level security;

create policy "Users can view own app_user" on public.app_users
  for select using (auth.uid() = auth_user_id);

create policy "Users can insert own app_user" on public.app_users
  for insert with check (auth.uid() = auth_user_id);

create policy "Users can update own app_user" on public.app_users
  for update using (auth.uid() = auth_user_id);

-- Boards
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default now()
);

alter table public.boards enable row level security;

create policy "Users can view their boards" on public.boards
  for select using (auth.uid() = user_id);

create policy "Users can insert their boards" on public.boards
  for insert with check (auth.uid() = user_id);

create policy "Users can update their boards" on public.boards
  for update using (auth.uid() = user_id);

create policy "Users can delete their boards" on public.boards
  for delete using (auth.uid() = user_id);

-- Blocks
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  parent_block_id uuid references public.blocks(id) on delete cascade,
  type text not null check (type in ('text','image','checklist','likes','list','folder')),
  x integer not null,
  y integer not null,
  width integer not null,
  height integer not null,
  color text not null default 'slate',
  content jsonb not null default '{}'::jsonb,
  z_index integer not null default 0,
  created_at timestamp with time zone default now()
);

alter table public.blocks enable row level security;

create policy "Users can view their blocks" on public.blocks
  for select using (
    exists (
      select 1 from public.boards b
      where b.id = board_id and b.user_id = auth.uid()
    )
  );

create policy "Users can insert their blocks" on public.blocks
  for insert with check (
    exists (
      select 1 from public.boards b
      where b.id = board_id and b.user_id = auth.uid()
    )
  );

create policy "Users can update their blocks" on public.blocks
  for update using (
    exists (
      select 1 from public.boards b
      where b.id = board_id and b.user_id = auth.uid()
    )
  );

create policy "Users can delete their blocks" on public.blocks
  for delete using (
    exists (
      select 1 from public.boards b
      where b.id = board_id and b.user_id = auth.uid()
    )
  );

-- Storage bucket for images (configure via Supabase UI)
-- 1. Create bucket "visual-notes-images" (public)
-- 2. Add RLS policy to allow authenticated users to upload and read:
--    using (auth.role() = 'authenticated')
--    with check (auth.role() = 'authenticated')

