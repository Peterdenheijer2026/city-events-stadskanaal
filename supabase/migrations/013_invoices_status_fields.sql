-- Facturen: statusvelden voor verstuurd/betaald
-- Voer uit in Supabase SQL Editor NA 011 en 012.

alter table public.invoices
  add column if not exists sent_at timestamptz,
  add column if not exists paid_at timestamptz;

create index if not exists invoices_sent_at_idx on public.invoices(sent_at);
create index if not exists invoices_paid_at_idx on public.invoices(paid_at);

