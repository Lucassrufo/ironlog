create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('trainer', 'student')),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_students (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('active', 'archived')) default 'active',
  created_at timestamptz not null default now(),
  unique (trainer_id, student_id)
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text not null check (status in ('draft', 'active', 'archived')) default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  position int not null,
  title text not null,
  focus text,
  unique (routine_id, position)
);

create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  position int not null,
  exercise_name text not null,
  muscle_group text,
  sets int not null,
  reps int,
  duration_seconds int,
  load_kg numeric,
  notes text,
  unique (routine_day_id, position)
);

create table if not exists public.routine_assignments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  status text not null check (status in ('active', 'ended')) default 'active',
  assigned_at timestamptz not null default now()
);

create unique index if not exists routine_assignments_one_active_student
on public.routine_assignments(student_id)
where status = 'active';

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid references public.profiles(id) on delete set null,
  routine_id uuid references public.routines(id) on delete set null,
  routine_day_id uuid references public.routine_days(id) on delete set null,
  title text not null,
  started_at timestamptz,
  completed_at timestamptz not null default now(),
  duration_seconds int not null default 0,
  total_volume_kg numeric not null default 0,
  total_reps int not null default 0,
  work_seconds int not null default 0,
  client_session_id text unique
);

create table if not exists public.workout_session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,
  set_number int not null,
  reps int,
  duration_seconds int,
  load_kg numeric,
  completed boolean not null default true,
  notes text
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (trainer_id, student_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.trainer_students enable row level security;
alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.routine_assignments enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_session_sets enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles read own" on public.profiles for select using (id = auth.uid());
create policy "profiles read linked participants" on public.profiles for select using (
  exists (
    select 1 from public.trainer_students ts
    where ts.status = 'active'
      and (
        (ts.trainer_id = auth.uid() and ts.student_id = profiles.id)
        or (ts.student_id = auth.uid() and ts.trainer_id = profiles.id)
      )
  )
);
create policy "profiles insert own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles update own name" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.link_student_by_email(trainer uuid, student_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  student uuid;
  link_id uuid;
begin
  if trainer <> auth.uid() then
    raise exception 'trainer must be current user';
  end if;

  if not exists (select 1 from public.profiles where id = trainer and role = 'trainer') then
    raise exception 'current user is not a trainer';
  end if;

  select id into student
  from public.profiles
  where lower(email) = lower(student_email)
    and role = 'student'
  limit 1;

  if student is null then
    raise exception 'student not found';
  end if;

  insert into public.trainer_students (trainer_id, student_id, status)
  values (trainer, student, 'active')
  on conflict (trainer_id, student_id)
  do update set status = 'active'
  returning id into link_id;

  insert into public.chat_threads (trainer_id, student_id)
  values (trainer, student)
  on conflict (trainer_id, student_id) do nothing;

  return link_id;
end;
$$;

create policy "trainer students participants read" on public.trainer_students for select using (trainer_id = auth.uid() or student_id = auth.uid());
create policy "trainer links own students" on public.trainer_students for insert with check (trainer_id = auth.uid());
create policy "trainer updates own links" on public.trainer_students for update using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "trainer owns routines" on public.routines for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());
create policy "linked students read assigned routines" on public.routines for select using (
  exists (
    select 1 from public.routine_assignments ra
    where ra.routine_id = routines.id
      and ra.student_id = auth.uid()
      and ra.status = 'active'
  )
);

create policy "routine days trainer access" on public.routine_days for all using (
  exists (select 1 from public.routines r where r.id = routine_days.routine_id and r.trainer_id = auth.uid())
) with check (
  exists (select 1 from public.routines r where r.id = routine_days.routine_id and r.trainer_id = auth.uid())
);
create policy "routine days student read" on public.routine_days for select using (
  exists (
    select 1 from public.routine_assignments ra
    where ra.routine_id = routine_days.routine_id
      and ra.student_id = auth.uid()
      and ra.status = 'active'
  )
);

create policy "routine exercises trainer access" on public.routine_exercises for all using (
  exists (
    select 1 from public.routine_days rd
    join public.routines r on r.id = rd.routine_id
    where rd.id = routine_exercises.routine_day_id and r.trainer_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.routine_days rd
    join public.routines r on r.id = rd.routine_id
    where rd.id = routine_exercises.routine_day_id and r.trainer_id = auth.uid()
  )
);
create policy "routine exercises student read" on public.routine_exercises for select using (
  exists (
    select 1 from public.routine_days rd
    join public.routine_assignments ra on ra.routine_id = rd.routine_id
    where rd.id = routine_exercises.routine_day_id
      and ra.student_id = auth.uid()
      and ra.status = 'active'
  )
);

create policy "assignments participants read" on public.routine_assignments for select using (trainer_id = auth.uid() or student_id = auth.uid());
create policy "trainer manages assignments" on public.routine_assignments for all using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

create policy "students insert own sessions" on public.workout_sessions for insert with check (student_id = auth.uid());
create policy "students read own sessions" on public.workout_sessions for select using (student_id = auth.uid());
create policy "trainers read linked sessions" on public.workout_sessions for select using (
  exists (
    select 1 from public.trainer_students ts
    where ts.trainer_id = auth.uid()
      and ts.student_id = workout_sessions.student_id
      and ts.status = 'active'
  )
);

create policy "session sets participant read" on public.workout_session_sets for select using (
  exists (
    select 1 from public.workout_sessions ws
    left join public.trainer_students ts on ts.student_id = ws.student_id and ts.status = 'active'
    where ws.id = workout_session_sets.session_id
      and (ws.student_id = auth.uid() or ts.trainer_id = auth.uid())
  )
);
create policy "students insert own session sets" on public.workout_session_sets for insert with check (
  exists (select 1 from public.workout_sessions ws where ws.id = workout_session_sets.session_id and ws.student_id = auth.uid())
);

create policy "chat participants read threads" on public.chat_threads for select using (trainer_id = auth.uid() or student_id = auth.uid());
create policy "trainer creates own thread" on public.chat_threads for insert with check (trainer_id = auth.uid());

create policy "chat participants read messages" on public.chat_messages for select using (
  exists (
    select 1 from public.chat_threads ct
    where ct.id = chat_messages.thread_id
      and (ct.trainer_id = auth.uid() or ct.student_id = auth.uid())
  )
);
create policy "chat participants send messages" on public.chat_messages for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.chat_threads ct
    where ct.id = chat_messages.thread_id
      and (ct.trainer_id = auth.uid() or ct.student_id = auth.uid())
  )
);
