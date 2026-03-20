# Boekhouding-module (debiteuren + crediteuren)

## Supabase

1. Voer **014_purchase_invoices.sql** uit in de SQL Editor.
2. Maak in **Storage** een **private** bucket met de naam: **`purchase-invoices`**  
   (Public uit, File size limit bijv. 15 MB).
3. Voer **015_storage_purchase_invoices.sql** uit (rechten voor penningmeester + super admin).

Zonder bucket mislukt uploaden van PDF’s bij **crediteuren**; de rest van de boekhoudpagina’s werkt wel.

## Wat er bij komt

- **`/beheer/boekhouding`** – Overzicht: te ontvangen (debiteuren), te betalen (crediteuren), netto, YTD betaald, tabel per maand.
- **`/beheer/boekhouding/crediteuren`** – Crediteuren registreren (optioneel PDF), markeren als betaald, verwijderen.

Oude URL’s **`/beheer/boekhouding/inkoop`** en **`/beheer/boekhouding/inkomende`** worden automatisch doorgestuurd naar **`/beheer/boekhouding/crediteuren`**.

Alleen **penningmeester@cityeventsstadskanaal.nl** (en super admin) hebben toegang, gelijk aan **debiteuren** (`/beheer/facturen`).

## Debiteurfactuur per e-mail (SMTP of Resend)

### 1. Database

Voer **`016_invoice_customer_email.sql`** uit in de SQL Editor (kolom `email` op `invoice_customers`).

### 2. Keuze: SMTP (eigen mailbox) of Resend

- **SMTP** (aanbevolen als je al een mailbox bij je provider hebt): gebruik dezelfde server/gegevens als in Outlook, Apple Mail of je telefoon (vaak poort **587** met STARTTLS, of **465** voor SSL).
- **Resend** (alternatief): API-key + geverifieerd domein; zie onderaan.

Als **SMTP** is ingevuld (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`), wordt dat gebruikt. Anders, als **`RESEND_API_KEY`** staat, wordt Resend gebruikt.

### 3. SMTP instellen (`.env.local`)

Vul minimaal:

```env
EMAIL_FROM="Facturen <penningmeester@cityeventsstadskanaal.nl>"
SMTP_HOST=smtp.jouwprovider.nl
SMTP_PORT=587
SMTP_USER=penningmeester@cityeventsstadskanaal.nl
SMTP_PASS=je_wachtwoord_of_app_wachtwoord
```

- **`EMAIL_FROM`**: het adres dat de ontvanger ziet (meestal hetzelfde als `SMTP_USER` of een alias op hetzelfde domein).
- **`SMTP_PORT`**: meestal `587` (STARTTLS) of `465` (SSL).
- **`SMTP_SECURE`**: `true` voor poort **465**, `false` of weglaten voor **587** (standaard).

```env
SMTP_SECURE=false
```

- **`NEXT_PUBLIC_SITE_URL`**: basis-URL van de site (logo in PDF), lokaal `http://localhost:3000`, live `https://jouwdomein.nl`.

**Let op:** bij Gmail/Microsoft 365 gebruik je vaak een **app-wachtwoord** i.p.v. je normale wachtwoord. Bij je host (TransIP, Hostnet, etc.) vind je de SMTP-server in de helppagina’s.

Herstart **`npm run dev`** na het wijzigen van `.env.local`.

### 4. Resend (optioneel, als je géén SMTP gebruikt)

1. Account op **[resend.com](https://resend.com)** → **API Keys** → key kopiëren (`re_...`).
2. **Domains** → domein verifiëren (DNS-records).
3. In `.env.local` o.a.:

```env
EMAIL_FROM="Facturen <facturen@jouwdomein.nl>"
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=https://jouwdomein.nl
```

(Zonder SMTP-variabelen gebruikt de app automatisch Resend.)

### 5. Productie (bijv. Vercel)

Zet dezelfde variabelen in **Environment Variables** en deploy opnieuw.

### 6. Controleren in de app

Als **`EMAIL_FROM`** én SMTP **of** Resend is gezet, verdwijnt de waarschuwing op de factuurpagina. Test met een debiteurfactuur met een **geldig e-mailadres** → **Factuur versturen**.

---

Zonder e-mailconfiguratie blijven **PDF-download** en het **verstuurd**-vinkje werken; alleen automatisch **mailen** is uit.

Bij een nieuwe factuur kun je een **e-mailadres bij de betaler** invullen. Op de factuurpagina en bij **onverstuurd** in het overzicht staat **Versturen**: PDF als bijlage, factuur krijgt **`sent_at`**.
