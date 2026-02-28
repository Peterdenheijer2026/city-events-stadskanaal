-- Programma per datum (26-04 en 27-04) met vinkje en rijen tijd + act.
-- Zorg ook dat admin altijd kan opslaan (voorkomt "opslaan mislukt").
-- Voer uit in Supabase SQL Editor.

alter table public.plein_content
  add column if not exists program_data jsonb default '{}';

comment on column public.plein_content.program_data is 'Structuur: { "2026-04-26": { "enabled": true, "items": [{ "time": "14:00", "act": "Band X" }] }, "2026-04-27": { ... } }';

-- Admin mag altijd plein_content bewerken (als huidige policies falen)
create policy "plein_content_admin_all"
  on public.plein_content for all
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());
