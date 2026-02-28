# Stap voor stap: beheer aan de praat krijgen

Volg deze stappen in volgorde.

---

## Stap 1: Dependencies installeren (npm)

Zodat de build slaagt en `@supabase/ssr` beschikbaar is:

1. Open **Command Prompt** of **PowerShell** (of de terminal in Cursor waar je normaal `npm` gebruikt).
2. Ga naar de projectmap:
   ```text
   cd c:\xampp\htdocs\buidlingsite
   ```
3. Voer uit:
   ```text
   npm install
   ```
4. Wacht tot het klaar is. Daarna zou `npm run build` of `npm run dev` moeten werken.

---

## Stap 2: Database in Supabase aanmaken

1. Ga naar **https://supabase.com** en open je project **city events**.
2. Klik links op **SQL Editor**.
3. Klik op **New query**.
4. Open op je pc het bestand:  
   `c:\xampp\htdocs\buidlingsite\supabase\migrations\001_admin_pleinen.sql`  
   Kopieer de **hele** inhoud.
5. Plak die inhoud in het query-venster in Supabase.
6. Klik op **Run** (of Ctrl+Enter).
7. Controleer of er onderaan “Success” of geen foutmelding staat.  
   Dan bestaan de tabellen `profiles`, `plein_permissions` en `plein_content`.
8. **Zie je als admin geen overzicht van e-mailadressen?** Voer dan ook het bestand  
   `supabase/migrations/003_admin_email_rls.sql` uit in de SQL Editor.

---

## Stap 3: Storage buckets in Supabase aanmaken

1. In Supabase: links op **Storage** klikken.
2. Klik op **New bucket**.
   - **Name:** `plein-programmes`
   - **Public bucket:** aan (aanvinken).
   - Klik **Create bucket**.
3. Nogmaals **New bucket**.
   - **Name:** `plein-images`
   - **Public bucket:** aan.
   - Klik **Create bucket**.

Klaar. Verdere policies hoef je nu niet aan te passen als je wilt beginnen.

---

## Stap 4: Eerste keer inloggen als hoofdadministrator

1. Start je site lokaal (bijv. `npm run dev`) of open de live site.
2. Ga naar de **hoofdpagina** en scroll helemaal naar beneden.
3. Klik op **Beheerders login** (kleine link onderaan).
4. Op de inlogpagina:
   - Klik op het tabblad **Account aanmaken**.
   - E-mail: `admin@cityeventsstadskanaal.nl`
   - Wachtwoord: kies een sterk wachtwoord (min. 6 tekens).
   - Klik **Account aanmaken**.
5. Controleer je e-mail en klik op de bevestigingslink (als Supabase e-mailbevestiging aan heeft staan).
6. Log daarna in met dat e-mailadres en wachtwoord.
7. Je komt in het **beheeroverzicht**. Daar kun je:
   - Bij **Pleinrechten toewijzen** per gebruiker aanvinken welke pleinen zij mogen beheren.
   - Zelf op **Bewerken** bij een plein klikken om tekst, programma en afbeeldingen in te vullen.

---

## Kort overzicht

| Stap | Wat je doet |
|------|-------------|
| 1 | In de projectmap: `npm install` |
| 2 | Supabase → SQL Editor → script uit `001_admin_pleinen.sql` uitvoeren |
| 3 | Supabase → Storage → buckets `plein-programmes` en `plein-images` (public) aanmaken |
| 4 | Op de site: Beheerders login → account aanmaken met admin@cityeventsstadskanaal.nl → inloggen |

Daarna kun je pleinen beheren en rechten toewijzen.
