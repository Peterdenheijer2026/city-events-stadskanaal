# Beheer: setup

Na het uitrollen van de beheerfunctie moet je het volgende eenmalig doen.

## 1. Database (Supabase)

In **Supabase Dashboard** → **SQL Editor**: voer het script uit dat in  
`supabase/migrations/001_admin_pleinen.sql` staat.  
Daarmee worden de tabellen `profiles`, `plein_permissions` en `plein_content` plus RLS aangemaakt.  
De gebruiker met e-mail **admin@cityeventsstadskanaal.nl** wordt automatisch als hoofdadministrator aangemerkt.

## 2. Storage buckets (Supabase)

In **Supabase Dashboard** → **Storage**:

1. **Nieuwe bucket** → naam: `plein-programmes` → **Public** (zodat programma-links op de site werken) → Create.
2. **Nieuwe bucket** → naam: `plein-images` → **Public** → Create.

Bij **Policies** voor beide buckets (of via SQL):

- **Select (read):** toegestaan voor iedereen (`true` of `bucket_id = ...`).
- **Insert / Update / Delete:** toegestaan voor ingelogde gebruikers (`auth.role() = 'authenticated'`),  
  of strikter: alleen voor gebruikers die in `plein_permissions` staan (vereist custom policy met join).

Voor een eenvoudige start: laat **Insert** toe voor `authenticated`; de app toont alleen het bewerkformulier voor pleinen waar de gebruiker rechten voor heeft.

## 3. Eerste inlog als hoofdadministrator

1. Ga op de site naar **Beheerders login** (onderaan de hoofdpagina).
2. Log in met **admin@cityeventsstadskanaal.nl** (maak eerst een account aan met “Account aanmaken” als dat nog niet bestaat).
3. In het beheeroverzicht kun je bij **Pleinrechten toewijzen** per gebruiker aanvinken welke pleinen zij mogen beheren.
4. Andere gebruikers kunnen een account aanmaken en zien daarna alleen de pleinen die jij voor hen hebt aangevinkt.

## Overzicht

- **Hoofdbeheerder:** admin@cityeventsstadskanaal.nl – ziet alle gebruikers en kan pleinrechten toewijzen.
- **Beheerders:** kunnen alleen hun toegewezen pleinpagina’s bewerken (algemene tekst, 1 programma-bestand, max. 4 afbeeldingen).
- **Pleinpagina’s** zijn publiek bereikbaar via **Pleinen** in het menu → kies een plein.
