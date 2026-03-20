"use client";

import { useMemo, useState, useTransition } from "react";
import { createPurchaseInvoice, deletePurchaseInvoice, listPurchaseInvoices, setPurchasePaid, type PurchaseRow } from "../actions";

function eur(n: number) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

export default function InkomendeClient({ initialRows }: { initialRows: PurchaseRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.supplier_name, r.supplier_reference ?? "", r.invoice_date].join(" ").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const open = filtered.filter((r) => !r.paid_at);
  const done = filtered.filter((r) => r.paid_at);

  function refresh() {
    startTransition(async () => {
      const next = await listPurchaseInvoices();
      setRows(next);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createPurchaseInvoice(fd);
      if (res.error) setFormError(res.error);
      else {
        (e.target as HTMLFormElement).reset();
        refresh();
      }
    });
  }

  function RowTable({ title, items, tone }: { title: string; items: PurchaseRow[]; tone: "open" | "paid" }) {
    const countClass = tone === "paid" ? "facturen-section__count--paid" : "facturen-section__count--sent";
    return (
      <section className="facturen-section">
        <div className="facturen-section__head">
          <h2 className="facturen-section__title">{title}</h2>
          <span className={`facturen-section__count ${countClass}`}>{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="facturen-section__empty">Geen regels.</p>
        ) : (
          <div className="facturen-table-wrap">
            <table className="facturen-table facturen-table--numeric">
              <thead>
                <tr>
                  <th>Leverancier</th>
                  <th>Ref.</th>
                  <th>Datum</th>
                  <th className="facturen-table__right">Bedrag incl.</th>
                  <th>Bestand</th>
                  <th>Betaald</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.supplier_name}</td>
                    <td className="facturen-table__muted">{r.supplier_reference ?? "—"}</td>
                    <td className="facturen-table__muted">{r.invoice_date}</td>
                    <td className="facturen-table__right">{eur(r.amount_incl)}</td>
                    <td>
                      {r.file_path ? (
                        <a
                          href={`/beheer/boekhouding/inkomende/${r.id}/download`}
                          className="facturen-table__link facturen-table__link--small"
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <label className="invoice-toggle">
                        <input
                          type="checkbox"
                          checked={!!r.paid_at}
                          disabled={pending}
                          onChange={(e) => {
                            startTransition(async () => {
                              const res = await setPurchasePaid(r.id, e.target.checked);
                              if (!res.error) refresh();
                            });
                          }}
                        />
                      </label>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="facturen-btn facturen-btn--danger facturen-btn--tiny"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm("Deze inkomende factuur verwijderen?")) return;
                          startTransition(async () => {
                            await deletePurchaseInvoice(r.id);
                            refresh();
                          });
                        }}
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      {formError && (
        <p className="facturen-alert facturen-alert--error" role="alert">
          {formError}
        </p>
      )}

      <section className="invoice-form__section facturen-panel boekhoud-form-card">
        <h2 className="facturen-panel__h">Nieuwe inkomende factuur (te betalen)</h2>
        <p className="boekhoud-form-card__intro">
          Vul leverancier en bedrag in. PDF uploaden is optioneel maar aanbevolen voor je administratie. Markeer later wanneer betaald is.
        </p>
        <form onSubmit={onSubmit} className="boekhoud-inkomend-form facturen-form">
          <div className="invoice-form__grid">
            <label>
              Leverancier *
              <input name="supplier_name" required placeholder="Bedrijfsnaam" />
            </label>
            <label>
              Factuurnr. leverancier
              <input name="supplier_reference" placeholder="Optioneel" />
            </label>
            <label>
              Factuurdatum *
              <input name="invoice_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
            <label>
              Vervaldatum
              <input name="due_date" type="date" />
            </label>
            <label>
              Bedrag incl. BTW *
              <input name="amount_incl" inputMode="decimal" placeholder="0,00" required />
            </label>
            <label>
              BTW-tarief
              <select name="vat_rate" defaultValue="0.21">
                <option value="0.21">21%</option>
                <option value="0.09">9%</option>
                <option value="0">0%</option>
              </select>
            </label>
            <label className="invoice-form__span2">
              PDF-factuur
              <input name="file" type="file" accept="application/pdf,.pdf" />
            </label>
            <label className="invoice-form__span2">
              Opmerking
              <textarea name="notes" rows={2} placeholder="Optioneel" />
            </label>
          </div>
          <div className="invoice-form__actions">
            <button type="submit" className="facturen-btn facturen-btn--primary" disabled={pending}>
              {pending ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </form>
      </section>

      <div className="facturen-search">
        <label className="facturen-search__label" htmlFor="inkomende-zoek">
          Zoeken
        </label>
        <input
          id="inkomende-zoek"
          className="facturen-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leverancier of referentie…"
        />
      </div>

      <RowTable title="Nog te betalen" items={open} tone="open" />
      <RowTable title="Betaald" items={done} tone="paid" />
    </>
  );
}
