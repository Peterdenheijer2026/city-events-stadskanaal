-- Naam voor aanhef in factuur-e-mail (optioneel; anders valt terug op betaler-naam)
alter table public.invoice_customers
  add column if not exists recipient_name text;

comment on column public.invoice_customers.recipient_name is 'Optioneel: aanhef in e-mail, bijv. Jan Jansen of Bedrijfsnaam BV';
