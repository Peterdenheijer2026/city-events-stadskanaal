# Koppeling: GitHub → Vercel → Supabase

Volg deze stappen in volgorde. Je hebt nodig: een **GitHub-account**, een **Vercel-account** (gratis, kan met GitHub) en een **Supabase-account** (gratis).

---

## Stap A: GitHub-repository aanmaken

1. Ga naar **https://github.com** en log in.
2. Klik rechtsboven op het **+**-icoon → **New repository**.
3. Vul in:
   - **Repository name:** `city-events-stadskanaal` (of een andere naam)
   - **Public**
   - **Niet** "Add a README" aanvinken (je hebt al code)
4. Klik op **Create repository**.
5. Laat het tabblad open; je ziet straks iets als: `https://github.com/JOUW-NAAM/city-events-stadskanaal.git`

---

## Stap B: Code naar GitHub pushen

Open **PowerShell** of **Command Prompt** en voer uit (pas `JOUW-NAAM` aan naar je GitHub-gebruikersnaam):

```powershell
cd C:\xampp\htdocs\buidlingsite
git init
git add .
git commit -m "Eerste versie Next.js City Events site"
git branch -M main
git remote add origin https://github.com/JOUW-NAAM/city-events-stadskanaal.git
git push -u origin main
```

- Bij `git push` wordt om je **GitHub-gebruikersnaam en wachtwoord** gevraagd.  
  Wachtwoord: gebruik een **Personal Access Token** (zie onderaan dit document), niet je gewone wachtwoord.

**Als Git nog niet geïnstalleerd is:** download van https://git-scm.com en installeer, daarna opnieuw proberen.

---

## Stap C: Vercel koppelen

1. Ga naar **https://vercel.com** en log in (kies **Continue with GitHub**).
2. Klik op **Add New…** → **Project**.
3. Je ziet je GitHub-repositories. Klik bij **city-events-stadskanaal** op **Import**.
4. Laat alle instellingen staan (Framework: Next.js) en klik op **Deploy**.
5. Wacht tot de build klaar is. Je krijgt een URL zoals:  
   `https://city-events-stadskanaal.vercel.app`  
   Daar staat je site online.

**Vanaf nu:** elke keer als je `git push` doet naar GitHub, bouwt Vercel automatisch opnieuw en update de live site.

---

## Stap D: Supabase-project aanmaken

1. Ga naar **https://supabase.com** en maak een account (of log in).
2. Klik op **New project**.
3. Kies een **Organization** (of maak er een), vul een **Project name** in (bijv. `city-events`), kies een **Database password** (bewaar die) en een **Region**. Klik op **Create new project**.
4. Wacht tot het project klaar is (een paar minuten).
5. Ga in het menu links naar **Project Settings** (tandwiel) → **API**.
6. Noteer:
   - **Project URL** (bijv. `https://xxxxx.supabase.co`)
   - **anon public** key (lang stuk tekst onder "Project API keys")

---

## Stap E: Supabase-gegevens in Vercel zetten

1. Ga terug naar **Vercel** → je project **city-events-stadskanaal**.
2. Klik op **Settings** → **Environment Variables**.
3. Voeg twee variabelen toe:

   | Name                         | Value                    |
   |-----------------------------|--------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL`  | je Project URL uit Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | je anon public key uit Supabase |

   Bij "Environment" kun je **Production**, **Preview** en **Development** aanvinken.

4. Klik op **Save**.
5. Ga naar **Deployments** → bij de laatste deployment op de drie puntjes → **Redeploy**.  
   Zo wordt de site opnieuw gebouwd met de nieuwe variabelen.

---

## Stap F: Lokaal ook Supabase gebruiken (optioneel)

Als je lokaal (localhost) ook met Supabase wilt werken:

1. In de map `C:\xampp\htdocs\buidlingsite`: kopieer het bestand **.env.example** en noem de kopie **.env.local**.
2. Open **.env.local** in een teksteditor en vul in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jouw-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key
   ```
   (dezelfde waarden als in Vercel)

De app leest deze in via `lib/supabase.ts`. Je kunt later in Supabase tabellen aanmaken (bijv. voor nieuws of contact) en die in je Next.js-code gebruiken.

---

## GitHub: Personal Access Token (als wachtwoord niet werkt)

1. GitHub → rechtsboven je profielfoto → **Settings**.
2. Links onderaan: **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
3. **Generate new token (classic)**. Geef een naam, vink o.a. **repo** aan.
4. **Generate token** en **kopieer de token** (eenmalig zichtbaar).
5. Gebruik bij `git push` bij "Password" deze **token** in plaats van je wachtwoord.

---

## Overzicht

| Stap | Wat je doet |
|------|-------------|
| A | GitHub: nieuw repository aanmaken |
| B | Lokaal: `git init`, `git add .`, `git commit`, `git remote`, `git push` |
| C | Vercel: project importeren vanuit GitHub → Deploy |
| D | Supabase: nieuw project → Project Settings → API → URL + anon key noteren |
| E | Vercel: Environment Variables invullen → Redeploy |
| F | (Optioneel) Lokaal: `.env.local` met dezelfde Supabase-waarden |

Daarna: **code op GitHub → automatische deploy op Vercel → site kan Supabase gebruiken.**
