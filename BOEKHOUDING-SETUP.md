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
