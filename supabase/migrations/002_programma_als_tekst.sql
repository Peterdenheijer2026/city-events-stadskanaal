-- Als je 001 al had gedraaid: programma als invulveld i.p.v. upload
-- Voer dit uit in Supabase SQL Editor als plein_content al bestond met program_file_path.

alter table public.plein_content add column if not exists program_text text;

-- Optioneel: oude kolom verwijderen (mag ook blijven staan)
-- alter table public.plein_content drop column if exists program_file_path;
