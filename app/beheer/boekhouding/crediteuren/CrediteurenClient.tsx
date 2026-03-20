"use client";

import { useMemo, useState, useTransition } from "react";
import { deletePurchaseInvoice, listPurchaseInvoices, setPurchasePaid, type PurchaseRow } from "../actions";

function eur(n: number) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

export default function CrediteurenClient({ initialRows }: { initialRows: PurchaseRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [pending, startTransition] = useTransition();
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
  const totalAll = filtered.length;

  function refresh() {
    startTransition(async () => {
      const next = await listPurchaseInvoices();
      setRows(next);
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
                          href={`/beheer/boekhouding/crediteuren/${r.id}/download`}
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
                          if (!confirm("Dit crediteurenitem verwijderen?")) return;
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
      <div className="facturen-kpi">
        <div className="facturen-kpi__card">
          <span className="facturen-kpi__value">{totalAll}</span>
          <span className="facturen-kpi__label">Totaal crediteuren</span>
        </div>
        <div className="facturen-kpi__card facturen-kpi__card--unsent">
          <span className="facturen-kpi__value">{open.length}</span>
          <span className="facturen-kpi__label">Openstaand</span>
        </div>
        <div className="facturen-kpi__card facturen-kpi__card--paid">
          <span className="facturen-kpi__value">{done.length}</span>
          <span className="facturen-kpi__label">Betaald</span>
        </div>
      </div>

      <div className="facturen-search">
        <label className="facturen-search__label" htmlFor="crediteuren-zoek">
          Zoeken
        </label>
        <input
          id="crediteuren-zoek"
          className="facturen-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leverancier of referentie…"
        />
      </div>

      <RowTable title="Openstaand" items={open} tone="open" />
      <RowTable title="Betaald" items={done} tone="paid" />
    </>
  );
}
