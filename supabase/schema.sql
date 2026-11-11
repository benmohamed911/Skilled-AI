-- Skilld AI database setup. Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- One row per user: their name and plan (free or pro).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- One row per finished exam.
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  mode text not null check (mode in ('practice', 'full')),
  total int not null,
  correct int not null,
  pct int not null,
  passed boolean not null,
  seconds int not null,
  domains jsonb not null,
  gaps jsonb not null,
  review jsonb not null,
  plan jsonb
);
create index attempts_user_date on public.attempts (user_id, created_at desc);

-- Privacy rules: each user can only see their own data.
alter table public.profiles enable row level security;
alter table public.attempts enable row level security;

create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
-- No insert/update rule on profiles: users cannot change their own plan.

create policy "read own attempts" on public.attempts
  for select using (auth.uid() = user_id);
create policy "add own attempts" on public.attempts
  for insert with check (auth.uid() = user_id);
-- No update/delete rule on attempts: results cannot be edited or removed by users.

-- Create the profile automatically when someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
