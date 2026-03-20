# Boekhouding-module (inkomende facturen + overzicht)

## Supabase

1. Voer **014_purchase_invoices.sql** uit in de SQL Editor.
2. Maak in **Storage** een **private** bucket met de naam: **`purchase-invoices`**  
   (Public uit, File size limit bijv. 15 MB).
3. Voer **015_storage_purchase_invoices.sql** uit (rechten voor penningmeester + super admin).

Zonder bucket mislukt uploaden van PDF’s bij **inkomende facturen**; de rest van de boekhoudpagina’s werkt wel.

## Wat er bij komt

- **`/beheer/boekhouding`** – Overzicht: te ontvangen (debiteuren), te betalen (crediteuren), netto, YTD betaald uitgaand/inkomend, tabel per maand.
- **`/beheer/boekhouding/inkomende`** – Inkomende facturen registreren (optioneel PDF), markeren als betaald, verwijderen.

Oude URL **`/beheer/boekhouding/inkoop`** wordt automatisch doorgestuurd naar **`/beheer/boekhouding/inkomende`**.

Alleen **penningmeester@cityeventsstadskanaal.nl** (en super admin) hebben toegang, gelijk aan de uitgaande facturen.
