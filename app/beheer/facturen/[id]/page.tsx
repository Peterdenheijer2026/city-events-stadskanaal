import { createClient } from "@/lib/supabase/server";
import { FinancienNav } from "@/app/components/FinancienNav";
import { redirect } from "next/navigation";
import { getInvoice } from "../actions";
import { isInvoiceEmailConfigured } from "@/lib/send-invoice-email";
import DeleteInvoiceButton from "./DeleteInvoiceButton";
import InvoiceEmailPanel from "./InvoiceEmailPanel";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

export const dynamic = "force-dynamic";

async function assertTreasurer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

export default async function FactuurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await assertTreasurer();
  const { id } = await params;

  const data = await getInvoice(id);
  if (!data) redirect("/beheer/facturen");

  const { invoice, customer, lines } = data;

  function fmt(n: number) {
    return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
  }
  const totals = lines.reduce(
    (acc, l) => {
      const excl = l.unit_price_excl * l.quantity;
      const incl = Math.round((excl * (1 + l.vat_rate) + Number.EPSILON) * 100) / 100;
      acc.excl += excl;
      acc.incl += incl;
      acc.vat += incl - excl;
      return acc;
    },
    { excl: 0, vat: 0, incl: 0 }
  );

  const statusLabel =
    invoice.paid_at != null ? "Betaald" : invoice.sent_at != null ? "Openstaand" : "Onverstuurd";
  const statusTone = invoice.paid_at != null ? "paid" : invoice.sent_at != null ? "sent" : "unsent";
  const emailConfigured = isInvoiceEmailConfigured();

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Financiën · Debiteuren · Detail</p>
            <h1 className="facturen-app__title">{invoice.invoice_number}</h1>
            <p className="facturen-app__subtitle">
              {invoice.invoice_date}
              {invoice.subject ? ` · ${invoice.subject}` : ""}
            </p>
          </div>
          <FinancienNav>
            <a
              href={`/beheer/facturen/${id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="facturen-btn facturen-btn--primary"
            >
              PDF downloaden
            </a>
            <DeleteInvoiceButton id={id} />
          </FinancienNav>
        </header>

        <div className="facturen-detail-meta">
          <span className={`facturen-pill facturen-pill--${statusTone}`}>{statusLabel}</span>
          {invoice.sent_at && (
            <span className="facturen-detail-meta__item">
              Verstuurd: {new Date(invoice.sent_at).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}
            </span>
          )}
          {invoice.paid_at && (
            <span className="facturen-detail-meta__item">
              Betaald: {new Date(invoice.paid_at).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}
            </span>
          )}
        </div>

        <main className="facturen-app__main">
          <section className="invoice-form__section facturen-panel">
            <h2 className="facturen-panel__h">Betaler</h2>
            <div className="facturen-address">
              <strong>{customer.name}</strong>
              <span>
                {customer.street ? `${customer.street} ` : ""}
                {customer.house_number ?? ""}
                {customer.house_number_addition ? ` ${customer.house_number_addition}` : ""}
              </span>
              <span>
                {customer.postcode ?? ""} {customer.city ?? ""}
              </span>
              {customer.country ? <span>{customer.country}</span> : null}
              {customer.email ? (
                <span>
                  <strong>E-mail:</strong> {customer.email}
                </span>
              ) : null}
              {customer.recipient_name ? (
                <span>
                  <strong>Aanhef e-mail:</strong> {customer.recipient_name}
                </span>
              ) : null}
            </div>
          </section>

          <InvoiceEmailPanel
            invoiceId={id}
            initialEmail={customer.email}
            initialRecipientName={customer.recipient_name}
            sentAt={invoice.sent_at}
            emailConfigured={emailConfigured}
          />

          <section className="invoice-form__section facturen-panel">
            <h2 className="facturen-panel__h">Factuurregels</h2>
            <div className="facturen-table-wrap">
              <table className="facturen-table facturen-table--numeric">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Omschrijving</th>
                    <th className="facturen-table__right">Aantal</th>
                    <th className="facturen-table__right">BTW</th>
                    <th className="facturen-table__right">Excl.</th>
                    <th className="facturen-table__right">Incl.</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const excl = l.unit_price_excl * l.quantity;
                    const incl = Math.round((excl * (1 + l.vat_rate) + Number.EPSILON) * 100) / 100;
                    return (
                      <tr key={l.position}>
                        <td className="facturen-table__muted">{l.position}</td>
                        <td>{l.description}</td>
                        <td className="facturen-table__right">{l.quantity}</td>
                        <td className="facturen-table__right">{Math.round(l.vat_rate * 100)}%</td>
                        <td className="facturen-table__right">{fmt(excl)}</td>
                        <td className="facturen-table__right facturen-table__strong">{fmt(incl)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="invoice-totals facturen-totals-box">
              <div className="invoice-totals__row">
                <span>Totaal excl.</span>
                <strong>{fmt(totals.excl)}</strong>
              </div>
              <div className="invoice-totals__row invoice-totals__row--sub">
                <span>BTW</span>
                <strong>{fmt(totals.vat)}</strong>
              </div>
              <div className="invoice-totals__row invoice-totals__row--grand">
                <span>Totaal incl.</span>
                <strong>{fmt(totals.incl)}</strong>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

