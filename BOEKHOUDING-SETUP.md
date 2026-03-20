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

## Debiteurfactuur per e-mail (optioneel)

1. Voer **`016_invoice_customer_email.sql`** uit in de SQL Editor (kolom `email` op `invoice_customers`).
2. Maak een account op **[Resend](https://resend.com)** en verifieer je domein (of gebruik de test-afzender alleen voor ontwikkeling).
3. Zet in **`.env.local`** (of hosting-omgeving):

   - `RESEND_API_KEY` – API key van Resend  
   - `EMAIL_FROM` – zichtbare afzender, bijv. `"Facturen <facturen@jouwdomein.nl>"` (moet overeenkomen met een geverifieerd domein)  
   - `NEXT_PUBLIC_SITE_URL` – volledige basis-URL van de site (voor het logo in de PDF), bijv. `https://jouwdomein.nl`

Zonder deze variabelen kun je facturen nog steeds aanmaken en **PDF downloaden**; alleen **automatisch versturen per e-mail** blijft dan uitgeschakeld (er verschijnt een melding in beheer).

Bij een nieuwe factuur kun je een **e-mailadres bij de betaler** invullen. Op de factuurpagina en bij **onverstuurd** in het overzicht kun je **Versturen** gebruiken: de PDF wordt als bijlage gemaild en de factuur wordt **verstuurd** gemarkeerd (`sent_at`).
