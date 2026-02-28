# City Events Stadskanaal – Next.js, Vercel, GitHub & Supabase

Deze site draait als **Next.js**-app en kan worden gekoppeld aan **GitHub**, **Vercel** en **Supabase**.

---

## Lokaal starten (Windows)

**Makkelijkste:** dubbelklik op **START-SITE.bat**. Er opent een venster; open daarna in je browser **http://localhost:3000**. Laat het venster open zolang je de site wilt gebruiken.

---

## 1. Lokaal draaien (met terminal)

**Wat heb je nodig?** Node.js ([nodejs.org](https://nodejs.org)).

**Commando’s in de projectmap:**

1. **Pakketten installeren** (eenmalig): `npm install`
2. **Server starten:** `npm run dev`
3. **Browser:** open [http://localhost:3000](http://localhost:3000)

**Stoppen:** Ctrl+C in de terminal.

---

## 2. GitHub

1. Maak een nieuw repository op [github.com](https://github.com).
2. In je projectmap: `git init`, `git add .`, `git commit -m "Next.js City Events site"`, `git branch -M main`, voeg remote toe en `git push -u origin main`.

---

## 3. Vercel (hosting)

1. Ga naar [vercel.com](https://vercel.com), log in met GitHub.
2. **Add New** → **Project** → import je repository.
3. Deploy. Voeg bij **Settings** → **Environment Variables** toe: `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` (zie Supabase).

---

## 4. Supabase

1. [supabase.com](https://supabase.com) → New project.
2. **Project Settings** → **API**: neem **Project URL** en **anon key** over naar `.env.local` (lokaal) en naar Vercel Environment Variables.

---

## Overzicht

| Onderdeel   | Rol |
|------------|-----|
| **GitHub** | Broncode; push naar main kan auto-deploy triggeren. |
| **Vercel** | Bouwt en host de Next.js-app. |
| **Supabase** | Database/API via `lib/supabase.ts`. |

## Handige commando’s

- `npm run dev` – development server
- `npm run build` – productie-build
- `npm run start` – productie lokaal na build
