# Site updaten op Vercel

Vercel bouwt automatisch opnieuw zodra je **pusht naar GitHub** (branch `main`). Zorg dus dat je laatste wijzigingen op GitHub staan.

## Stappen

### 1. Wijzigingen vastleggen (commit)

Open **Command Prompt** of **PowerShell** in de map van het project (`c:\xampp\htdocs\buidlingsite`) en voer uit:

```bash
git add .
git status
git commit -m "Update: mobiel, OG-image, plein-header, favicon, etc."
```

(Je mag de commit-bericht aanpassen.)

### 2. Naar GitHub pushen

**Optie A – Met het bestaande script**

- Dubbelklik op **`push-naar-github.bat`** (in de projectmap).
- Het script haalt eerst de laatste wijzigingen van GitHub op en pusht daarna jouw commits.

**Optie B – Handmatig**

```bash
git pull origin main --no-rebase
git push origin main
```

### 3. Vercel

- Na een geslaagde push start Vercel automatisch een **nieuwe deployment**.
- Ga in [vercel.com](https://vercel.com) naar je project → **Deployments** om de voortgang te zien.
- Na een paar minuten is de live site bijgewerkt.

---

## Als Git niet in je PATH staat

- Gebruik **GitHub Desktop**: open het project, maak een commit met je wijzigingen en klik op **Push origin**.
- Of installeer Git van [git-scm.com](https://git-scm.com) en herstart de terminal; daarna werken de commando’s hierboven.

## Handmatige deploy in Vercel

Als de code al op GitHub staat maar Vercel niet opnieuw heeft gebouwd:

- Ga in Vercel naar je project → **Deployments**.
- Klik op de drie puntjes bij de laatste deployment → **Redeploy**.
