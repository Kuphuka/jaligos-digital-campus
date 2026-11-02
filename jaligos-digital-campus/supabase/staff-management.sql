-- Run in Supabase SQL Editor to enable lecturer accounts and course assignments.
alter table public.user_roles
  add column if not exists status text not null default 'active';

update public.user_roles
set status = 'active'
where status is null;

alter table public.user_roles
  alter column status set default 'active',
  alter column status set not null;

do $$
declare
  course_id_type text;
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

  execute format(
    'create table if not exists public.staff_courses (
      lecturer_email text not null,
      course_id %s not null references public.courses(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (lecturer_email, course_id)
    )',
    course_id_type
  );
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and conname = 'user_roles_status_check'
  ) then
    alter table public.user_roles
      add constraint user_roles_status_check
      check (status in ('active', 'suspended'));
  end if;
end $$;

create index if not exists staff_courses_lecturer_email_idx
  on public.staff_courses (lower(lecturer_email));

alter table public.staff_courses enable row level security;
revoke all on public.staff_courses from anon, authenticated;
grant all on public.staff_courses to service_role;

grant select on public.user_roles to authenticated;
