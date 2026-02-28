# Juiste volgorde – stap voor stap

Voer de stappen **in deze volgorde** uit in Supabase (Dashboard → [jouw project]).

---

## Deel 1: Database (SQL Editor)

Open **SQL Editor** en voer de bestanden **één voor één** uit, van laag naar hoog nummer.

| Stap | Bestand | Wat het doet |
|------|---------|--------------|
| 1 | `001_admin_pleinen.sql` | Tabellen: profiles, plein_permissions, plein_content, triggers, RLS |
| 2 | `002_programma_als_tekst.sql` | Optioneel: voegt kolom program_text toe (de site gebruikt nu program_data) |
| 3 | `003_admin_email_rls.sql` | Admin herkend op e-mail voor RLS |
| 4 | `004_sync_profiles_from_auth.sql` | Sync profielen uit auth.users |
| 5 | `005_admin_check_via_function.sql` | Functie current_user_is_admin() |
| 6 | `006_admin_get_all_via_rpc.sql` | RPC voor gebruikersoverzicht en rechten |
| 7 | `007_fix_recursion_profiles.sql` | Verwijdert recursie in RLS (profiles/plein_permissions) |
| 8 | `008_programma_per_datum.sql` | Kolom program_data + admin mag altijd plein_content bewerken |
| 9 | **Nog niet** | 009 is voor Storage – zie Deel 2 |

**Hoe:** SQL Editor → New query → inhoud van het bestand plakken → Run. Ga daarna door naar het volgende bestand.

---

## Deel 2: Storage bucket

1. Ga in Supabase naar **Storage** (linkermenu).
2. Klik op **New bucket**.
3. **Name:** `plein-images` (exact zo).
4. Zet **Public bucket** aan (aanvinken).
5. Klik **Create bucket**.

---

## Deel 3: Storage-rechten (SQL Editor)

Nu mag 009 uitgevoerd worden:

| Stap | Bestand | Wat het doet |
|------|---------|--------------|
| 10 | `009_storage_plein_images_public.sql` | Iedereen mag afbeeldingen bekijken; ingelogde gebruikers mogen uploaden |

**Hoe:** SQL Editor → New query → inhoud van `009_storage_plein_images_public.sql` plakken → Run.

---

## Samenvatting volgorde

1. **001** t/m **008** in de SQL Editor (in nummerorde).
2. Bucket **plein-images** aanmaken in Storage (public).
3. **009** in de SQL Editor.

Daarna zou beheer (login, pleinen bewerken, programma, afbeeldingen) moeten werken.
