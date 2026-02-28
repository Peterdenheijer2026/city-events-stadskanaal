-- Admin-gegevens ophalen via RPC (omzeilt RLS). Synchroniseert ook auth.users -> profiles.
-- Voer uit in Supabase SQL Editor.

create or replace function public.get_admin_profiles_and_permissions()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  -- Alleen admin@cityeventsstadskanaal.nl mag dit aanroepen
  if not exists (
    select 1 from auth.users
    where id = auth.uid()
    and lower(email) = 'admin@cityeventsstadskanaal.nl'
  ) then
    return '{"profiles": [], "permissions": []}'::json;
  end if;

  -- Zorg dat alle gebruikers uit auth.users een profiel hebben
  insert into public.profiles (id, email, is_super_admin)
  select
    u.id,
    u.email,
    (lower(u.email) = 'admin@cityeventsstadskanaal.nl')
  from auth.users u
  on conflict (id) do update set
    email = excluded.email,
    is_super_admin = (lower(excluded.email) = 'admin@cityeventsstadskanaal.nl'),
    updated_at = now();

  select json_build_object(
    'profiles', (
      select coalesce(json_agg(row_to_json(p) order by p.email), '[]'::json)
      from public.profiles p
    ),
    'permissions', (
      select coalesce(json_agg(json_build_object('user_id', pp.user_id, 'plein_slug', pp.plein_slug)), '[]'::json)
      from public.plein_permissions pp
    )
  ) into result;

  return result;
end;
$$;

-- Toegang tot de functie: alleen aangemelde gebruikers mogen hem aanroepen
grant execute on function public.get_admin_profiles_and_permissions() to authenticated;
grant execute on function public.get_admin_profiles_and_permissions() to service_role;
