# Migraties voor Supabase

## Eén bestand om te plakken (facturen + boekhouding)

Open in je project:

**`supabase/KOPIEER-NAAR-SUPABASE-facturen-en-boekhouding.sql`**

1. Supabase Dashboard → **SQL Editor** → nieuwe query.
2. Plak de **volledige** inhoud van dat bestand.
3. **Let op:** halverwege staat een opmerking: na het blok t/m `014` moet je eerst in **Storage** een **private** bucket **`purchase-invoices`** aanmaken (naam exact zo, public uit).
4. Voer daarna het **onderste deel** (015) uit, of voer het hele bestand in één keer uit als de bucket al bestaat.

## Losse bestanden (zelfde inhoud, in stukken)

| Bestand | Inhoud |
|--------|--------|
| `011_invoices.sql` | Tabellen debiteuren (facturen naar betalers) |
| `012_invoices_treasurer_access.sql` | RLS penningmeester |
| `013_invoices_status_fields.sql` | `sent_at` / `paid_at` |
| `014_purchase_invoices.sql` | Tabel crediteuren (`purchase_invoices`) |
| `015_storage_purchase_invoices.sql` | Storage-rechten (bucket `purchase-invoices` vereist) |

Volgorde: **011 → 012 → 013 → 014 → bucket aanmaken → 015**.

## Overige migraties (site / beheer)

De andere bestanden in `supabase/migrations/` (001–010, enz.) horen bij het algemene project (profielen, pleinen, enz.). Die voer je uit volgens de volgorde van de nummers, of zoals je project eerder al heeft ingesteld.
