create unique index if not exists profiles_email_lower_unique
on public.profiles (lower(email));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_name_length') then
    alter table public.profiles
      add constraint profiles_name_length
      check (char_length(trim(name)) between 2 and 80)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_email_shape') then
    alter table public.profiles
      add constraint profiles_email_shape
      check (email = lower(trim(email)) and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'trainer_students_no_self_link') then
    alter table public.trainer_students
      add constraint trainer_students_no_self_link
      check (trainer_id <> student_id)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'routines_title_length') then
    alter table public.routines
      add constraint routines_title_length
      check (char_length(trim(title)) between 2 and 120)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'routine_exercises_positive_work') then
    alter table public.routine_exercises
      add constraint routine_exercises_positive_work
      check (
        sets > 0
        and (reps is null or reps >= 0)
        and (duration_seconds is null or duration_seconds >= 0)
        and (load_kg is null or load_kg >= 0)
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'workout_sessions_non_negative_totals') then
    alter table public.workout_sessions
      add constraint workout_sessions_non_negative_totals
      check (
        duration_seconds >= 0
        and total_volume_kg >= 0
        and total_reps >= 0
        and work_seconds >= 0
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'workout_session_sets_non_negative_values') then
    alter table public.workout_session_sets
      add constraint workout_session_sets_non_negative_values
      check (
        set_number > 0
        and (reps is null or reps >= 0)
        and (duration_seconds is null or duration_seconds >= 0)
        and (load_kg is null or load_kg >= 0)
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chat_messages_body_length') then
    alter table public.chat_messages
      add constraint chat_messages_body_length
      check (char_length(trim(body)) between 1 and 4000)
      not valid;
  end if;
end $$;

revoke all on function public.link_student_by_email(uuid, text) from public;
grant execute on function public.link_student_by_email(uuid, text) to authenticated;

drop policy if exists "trainer links own students" on public.trainer_students;
create policy "trainer links own students" on public.trainer_students
for insert
with check (
  trainer_id = auth.uid()
  and trainer_id <> student_id
  and exists (
    select 1 from public.profiles p
    where p.id = trainer_id and p.role = 'trainer'
  )
  and exists (
    select 1 from public.profiles p
    where p.id = student_id and p.role = 'student'
  )
);

drop policy if exists "trainer updates own links" on public.trainer_students;
create policy "trainer updates own links" on public.trainer_students
for update
using (
  trainer_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = trainer_id and p.role = 'trainer'
  )
)
with check (
  trainer_id = auth.uid()
  and status in ('active', 'archived')
);

drop policy if exists "trainer manages assignments" on public.routine_assignments;
create policy "trainer manages assignments" on public.routine_assignments
for all
using (
  trainer_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = trainer_id and p.role = 'trainer'
  )
)
with check (
  trainer_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = trainer_id and p.role = 'trainer'
  )
  and exists (
    select 1 from public.trainer_students ts
    where ts.trainer_id = trainer_id
      and ts.student_id = student_id
      and ts.status = 'active'
  )
  and exists (
    select 1 from public.routines r
    where r.id = routine_id
      and r.trainer_id = trainer_id
      and r.status in ('draft', 'active')
  )
);

drop policy if exists "trainer creates own thread" on public.chat_threads;
create policy "trainer creates linked thread" on public.chat_threads
for insert
with check (
  trainer_id = auth.uid()
  and exists (
    select 1 from public.trainer_students ts
    where ts.trainer_id = chat_threads.trainer_id
      and ts.student_id = chat_threads.student_id
      and ts.status = 'active'
  )
);

drop policy if exists "students insert own sessions" on public.workout_sessions;
create policy "students insert own sessions" on public.workout_sessions
for insert
with check (
  student_id = auth.uid()
  and (
    trainer_id is null
    or exists (
      select 1 from public.trainer_students ts
      where ts.trainer_id = workout_sessions.trainer_id
        and ts.student_id = auth.uid()
        and ts.status = 'active'
    )
  )
  and (
    routine_id is null
    or exists (
      select 1 from public.routine_assignments ra
      where ra.routine_id = workout_sessions.routine_id
        and ra.student_id = auth.uid()
        and ra.status = 'active'
    )
  )
);

drop policy if exists "chat participants send messages" on public.chat_messages;
create policy "chat participants send messages" on public.chat_messages
for insert
with check (
  sender_id = auth.uid()
  and char_length(trim(body)) between 1 and 4000
  and exists (
    select 1 from public.chat_threads ct
    where ct.id = chat_messages.thread_id
      and (ct.trainer_id = auth.uid() or ct.student_id = auth.uid())
  )
);
