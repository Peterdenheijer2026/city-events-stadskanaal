-- Verwijder RLS-policies die oneindige recursie veroorzaken
-- (ze keken naar profiles terwijl ze op profiles/plein_permissions stonden).
-- Voer uit in Supabase SQL Editor. De admin werkt daarna via current_user_is_admin().

drop policy if exists "profiles_select_super_admin" on public.profiles;
drop policy if exists "plein_permissions_super_admin" on public.plein_permissions;
