-- ============================================================
-- Jaligos Digital Campus: one-time setup for YOUR existing tables
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run
-- Safe to run more than once.
-- Assumes these tables already exist in the public schema:
--   user_roles, courses, applications, enrollments, materials
-- ============================================================

-- 1. Add created_at where it may be missing (used for dates and sorting)
alter table public.applications add column if not exists created_at timestamptz default now();
alter table public.enrollments  add column if not exists created_at timestamptz default now();
alter table public.materials    add column if not exists created_at timestamptz default now();

-- 2. If an "id" column is a uuid with no default, give it one so inserts work
do $$
declare
  t text;
  dt text;
  dflt text;
begin
  foreach t in array array['user_roles', 'courses', 'applications', 'enrollments', 'materials'] loop
    select data_type, column_default into dt, dflt
    from information_schema.columns
    where table_schema = 'public' and table_name = t and column_name = 'id';

    if dt = 'uuid' and dflt is null then
      execute format('alter table public.%I alter column id set default gen_random_uuid()', t);
    end if;
  end loop;
end $$;

-- 3. New table: assignment submissions from students
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student_email text not null,
  file_name text not null,
  file_url text not null
);

-- 4. LOCK DOWN all tables.
-- With row level security ON and no policies, the public "anon" key cannot read or write anything.
-- The website only touches data through server code (service role key), after checking the user's role.
alter table public.user_roles   enable row level security;
alter table public.courses      enable row level security;
alter table public.applications enable row level security;
alter table public.enrollments  enable row level security;
alter table public.materials    enable row level security;
alter table public.submissions  enable row level security;

-- The only thing a logged-in user may read directly: their own role row
-- (used by the login page and route protection).
drop policy if exists "read own role" on public.user_roles;
create policy "read own role" on public.user_roles
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

grant select on public.user_roles to authenticated;

-- 5. Make the documents bucket PRIVATE (it holds ID copies) and cap file size at 50MB.
-- The site creates short-lived signed links for downloads.
update storage.buckets
set public = false, file_size_limit = 52428800
where id = 'documents';
