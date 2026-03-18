# Wachtwoord reset werkend krijgen in Supabase

Volg deze stappen **exact**. Supabase accepteert alleen redirects naar URLs die in de lijst staan.

---

## Stap 1: Redirect URLs in Supabase

1. Ga naar **https://supabase.com/dashboard** en open je project.
2. Links: **Authentication** → **URL Configuration**.
3. Scroll naar **Redirect URLs**.
4. Voeg **beide** regels toe (één per regel):
   ```text
   https://www.cityeventsstadskanaal.nl/beheer/wachtwoord-reset
   https://cityeventsstadskanaal.nl/beheer/wachtwoord-reset
   ```
   (De tweede alleen als bezoekers ook zonder www op je site kunnen.)
5. Klik **Save**.

---

## Stap 2: Site URL

Op dezelfde pagina (**URL Configuration**):

- **Site URL** zet je op: `https://www.cityeventsstadskanaal.nl`  
  (of op je echte domein als dat anders is.)

---

## Stap 3: Testen

1. Ga op je **live site** naar:  
   **https://www.cityeventsstadskanaal.nl/beheer/login**
2. Klik **Wachtwoord vergeten?**
3. Vul het e-mailadres in van een bestaand account en klik **Stuur resetlink**.
4. Controleer je e-mail (en spammap). Open de link in de mail.
5. Je zou op **Nieuw wachtwoord** moeten landen; vul twee keer een nieuw wachtwoord in en sla op.

---

## Werkt het nog niet?

- **Geen e-mail ontvangen?**  
  Supabase → **Authentication** → **Providers** → **Email**: controleer of e-mail aan staat.  
  Voor eigen SMTP: **Project Settings** → **Auth** → **SMTP**.

- **Link opent wel maar je komt niet op “Nieuw wachtwoord”?**  
  De URL waar je wél op uitkomt moet **exact** in **Redirect URLs** staan (zelfde https, met of zonder www).

- **“Invalid redirect URL” of vergelijkbare fout?**  
  De redirect-URL in de mail moet overeenkomen met een van de URLs in **Redirect URLs**. Controleer op spaties, http vs https en www.

- **Logs bekijken:**  
  Supabase → **Authentication** → **Logs**: kijk of er een fout bij de resetpoging staat.
