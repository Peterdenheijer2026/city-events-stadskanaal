-- Admin-rechten laten werken via auth.users (betrouwbaarder dan JWT).
-- Voer dit uit in Supabase SQL Editor. Daarna kan admin@cityeventsstadskanaal.nl
-- altijd profielen lezen en pleinrechten beheren.

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
    and lower(email) = 'admin@cityeventsstadskanaal.nl'
  );
$$;

-- Verwijder de oude policies die op JWT leunden (anders dubbel)
drop policy if exists "profiles_select_admin_email" on public.profiles;
drop policy if exists "plein_permissions_admin_email" on public.plein_permissions;

-- Nieuwe policies met de functie
create policy "profiles_select_admin_email"
  on public.profiles for select
  using (public.current_user_is_admin());

create policy "plein_permissions_admin_email_select"
  on public.plein_permissions for select
  using (public.current_user_is_admin());

create policy "plein_permissions_admin_email_insert"
  on public.plein_permissions for insert
  with check (public.current_user_is_admin());

create policy "plein_permissions_admin_email_update"
  on public.plein_permissions for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "plein_permissions_admin_email_delete"
  on public.plein_permissions for delete
  using (public.current_user_is_admin());
