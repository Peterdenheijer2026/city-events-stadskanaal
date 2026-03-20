-- E-mailadres bij debiteur (factuur per e-mail versturen)
alter table public.invoice_customers
  add column if not exists email text;

comment on column public.invoice_customers.email is 'Optioneel: ontvanger voor factuur per e-mail';
