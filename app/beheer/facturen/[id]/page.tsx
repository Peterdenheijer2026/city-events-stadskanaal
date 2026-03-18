import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getInvoice } from "../actions";
import DeleteInvoiceButton from "./DeleteInvoiceButton";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

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

  return (
    <div className="beheer-page">
      <header className="beheer-page__header">
        <h1>Factuur {invoice.invoice_number}</h1>
        <div className="beheer-page__actions">
          <Link href="/beheer/facturen">← Terug</Link>
          <a href={`/beheer/facturen/${id}/pdf`} target="_blank" rel="noreferrer">
            Download PDF
          </a>
          <DeleteInvoiceButton id={id} />
        </div>
      </header>

      <main className="beheer-dashboard">
        <section className="invoice-form__section">
          <h2>Factuur aan</h2>
          <p className="beheer-dashboard__hint" style={{ marginBottom: 0 }}>
            <strong>{customer.name}</strong>
            <br />
            {customer.street ? `${customer.street} ` : ""}
            {customer.house_number ?? ""}{customer.house_number_addition ? ` ${customer.house_number_addition}` : ""}
            <br />
            {customer.postcode ?? ""} {customer.city ?? ""}
            <br />
            {customer.country}
          </p>
        </section>

        <section className="invoice-form__section">
          <h2>Regels</h2>
          <div className="beheer-dashboard__table-wrap">
            <table className="beheer-dashboard__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Omschrijving</th>
                  <th>Aantal</th>
                  <th>BTW</th>
                  <th>Excl.</th>
                  <th>Incl.</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const excl = l.unit_price_excl * l.quantity;
                  const incl = Math.round((excl * (1 + l.vat_rate) + Number.EPSILON) * 100) / 100;
                  return (
                    <tr key={l.position}>
                      <td>{l.position}</td>
                      <td>{l.description}</td>
                      <td>{l.quantity}</td>
                      <td>{Math.round(l.vat_rate * 100)}%</td>
                      <td>{fmt(excl)}</td>
                      <td>{fmt(incl)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals">
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
  );
}

