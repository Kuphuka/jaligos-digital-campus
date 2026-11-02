-- Run once in Supabase SQL Editor to enable lecturer grading and controlled release.
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  course_id text not null,
  mark numeric(5, 2) not null check (mark >= 0 and mark <= 100),
  status text not null default 'pending_release'
    check (status in ('pending_release', 'released')),
  created_at timestamptz not null default now(),
  unique (student_email, course_id)
);

-- Match both course_id columns to the actual courses.id type, then enforce
-- that results and submissions always refer to an existing course.
do $$
declare
  course_id_type text;
  results_course_id_type text;
  submissions_course_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into course_id_type
  from pg_attribute a
  where a.attrelid = 'public.courses'::regclass
    and a.attname = 'id'
    and not a.attisdropped;

  if course_id_type is null then
    raise exception 'Could not determine public.courses.id type';
  end if;

  select format_type(a.atttypid, a.atttypmod)
    into results_course_id_type
  from pg_attribute a
  where a.attrelid = 'public.results'::regclass
    and a.attname = 'course_id'
    and not a.attisdropped;

  if results_course_id_type is distinct from course_id_type then
    execute format(
      'alter table public.results alter column course_id type %s using course_id::%s',
      course_id_type,
      course_id_type
    );
  end if;

  execute format(
    'alter table public.submissions add column if not exists course_id %s',
    course_id_type
  );

  select format_type(a.atttypid, a.atttypmod)
    into submissions_course_id_type
  from pg_attribute a
  where a.attrelid = 'public.submissions'::regclass
    and a.attname = 'course_id'
    and not a.attisdropped;

  if submissions_course_id_type is distinct from course_id_type then
    execute format(
      'alter table public.submissions alter column course_id type %s using course_id::%s',
      course_id_type,
      course_id_type
    );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.results'::regclass
      and conname = 'results_course_id_fkey'
  ) then
    alter table public.results
      add constraint results_course_id_fkey
      foreign key (course_id) references public.courses(id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.submissions'::regclass
      and conname = 'submissions_course_id_fkey'
  ) then
    alter table public.submissions
      add constraint submissions_course_id_fkey
      foreign key (course_id) references public.courses(id)
      on delete set null;
  end if;
end $$;

create index if not exists results_course_status_idx
  on public.results (course_id, status);
create index if not exists submissions_course_created_idx
  on public.submissions (course_id, created_at desc);

alter table public.results enable row level security;

drop policy if exists "Students read own released results" on public.results;
create policy "Students read own released results"
  on public.results
  for select
  to authenticated
  using (
    status = 'released'
    and lower(student_email) = lower(auth.jwt() ->> 'email')
  );

drop policy if exists "Staff read results" on public.results;
create policy "Staff read results"
  on public.results
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where lower(ur.email) = lower(auth.jwt() ->> 'email')
        and ur.role in ('admin', 'lecturer')
    )
  );

drop policy if exists "Staff insert pending results" on public.results;
create policy "Staff insert pending results"
  on public.results
  for insert
  to authenticated
  with check (
    status = 'pending_release'
    and exists (
      select 1
      from public.user_roles ur
      where lower(ur.email) = lower(auth.jwt() ->> 'email')
        and ur.role in ('admin', 'lecturer')
    )
  );

drop policy if exists "Lecturers update pending results" on public.results;
create policy "Lecturers update pending results"
  on public.results
  for update
  to authenticated
  using (
    status = 'pending_release'
    and exists (
      select 1
      from public.user_roles ur
      where lower(ur.email) = lower(auth.jwt() ->> 'email')
        and ur.role in ('admin', 'lecturer')
    )
  )
  with check (
    status = 'pending_release'
    and exists (
      select 1
      from public.user_roles ur
      where lower(ur.email) = lower(auth.jwt() ->> 'email')
        and ur.role in ('admin', 'lecturer')
    )
  );

drop policy if exists "Admins release results" on public.results;
create policy "Admins release results"
  on public.results
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where lower(ur.email) = lower(auth.jwt() ->> 'email')
        and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where lower(ur.email) = lower(auth.jwt() ->> 'email')
        and ur.role = 'admin'
    )
  );

grant select, insert, update on public.results to authenticated;
