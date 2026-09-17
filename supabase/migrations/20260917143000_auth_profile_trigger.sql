create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  metadata_role text;
  metadata_name text;
  normalized_email text;
begin
  metadata_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  if metadata_role not in ('trainer', 'student') then
    metadata_role := 'student';
  end if;

  metadata_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), '');
  normalized_email := lower(trim(coalesce(new.email, '')));

  if metadata_name is not null and char_length(metadata_name) < 2 then
    metadata_name := null;
  end if;

  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    metadata_role,
    case
      when metadata_name is not null then metadata_name
      when char_length(split_part(normalized_email, '@', 1)) >= 2 then split_part(normalized_email, '@', 1)
      else 'Usuario IronLog'
    end,
    normalized_email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

revoke all on function public.handle_new_auth_user_profile() from public;
grant execute on function public.handle_new_auth_user_profile() to service_role;

insert into public.profiles (id, role, name, email)
select
  users.id,
  case
    when users.raw_user_meta_data ->> 'role' in ('trainer', 'student') then users.raw_user_meta_data ->> 'role'
    else 'student'
  end as role,
  coalesce(
    nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name', '')), ''),
    case
      when char_length(split_part(lower(trim(coalesce(users.email, ''))), '@', 1)) >= 2
      then split_part(lower(trim(coalesce(users.email, ''))), '@', 1)
      else null
    end,
    'Usuario IronLog'
  ) as name,
  lower(trim(coalesce(users.email, ''))) as email
from auth.users users
where users.email is not null
  and not exists (
    select 1 from public.profiles profiles
    where profiles.id = users.id
  )
on conflict (id) do nothing;
