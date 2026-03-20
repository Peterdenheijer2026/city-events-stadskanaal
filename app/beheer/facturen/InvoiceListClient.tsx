"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendInvoiceByEmail, setInvoicePaid, setInvoiceSent } from "./actions";

type Row = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string | null;
  customer_email: string | null;
  subject: string | null;
  sent_at: string | null;
  paid_at: string | null;
};

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function InvoiceListClient({
  rows,
  emailConfigured,
}: {
  rows: Row[];
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.invoice_number, r.invoice_date, r.customer_name ?? "", r.subject ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  const onverstuurd = filtered.filter((r) => !r.sent_at && !r.paid_at);
  const sent = filtered.filter((r) => !!r.sent_at && !r.paid_at);
  const paid = filtered.filter((r) => !!r.paid_at);
  const totalAll = filtered.length;

  function fmtDateTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
  }

  function renderTable(title: string, items: Row[], tone: "unsent" | "sent" | "paid") {
    return (
      <section className="facturen-section">
        <div className="facturen-section__head">
          <h2 className="facturen-section__title">{title}</h2>
          <span className={`facturen-section__count facturen-section__count--${tone}`}>{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="facturen-section__empty">Geen facturen in deze lijst.</p>
        ) : (
          <div className="facturen-table-wrap">
            <table className="facturen-table">
              <thead>
                <tr>
                  <th>Nummer</th>
                  <th>Datum</th>
                  <th>Klant</th>
                  <th>Onderwerp</th>
                  {tone === "unsent" && <th>E-mail</th>}
                  <th>Verstuurd</th>
                  <th>Betaald</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const overdue =
                    !!r.sent_at && !r.paid_at && daysBetween(new Date(r.sent_at), new Date()) >= 14;
                  return (
                    <tr key={r.id}>
                      <td className="facturen-table__num">
                        <Link href={`/beheer/facturen/${r.id}`} className="facturen-table__link">
                          {r.invoice_number}
                        </Link>
                        {overdue && <span className="invoice-badge invoice-badge--overdue">Te laat</span>}
                      </td>
                      <td className="facturen-table__muted">{r.invoice_date}</td>
                      <td>{r.customer_name ?? "—"}</td>
                      <td className="facturen-table__clip">{r.subject ?? "—"}</td>
                      {tone === "unsent" && (
                        <td>
                          {r.customer_email && emailConfigured ? (
                            <button
                              type="button"
                              className="facturen-btn facturen-btn--ghost facturen-btn--tiny"
                              disabled={pending}
                              onClick={() => {
                                setError(null);
                                startTransition(async () => {
                                  const res = await sendInvoiceByEmail(r.id);
                                  if (res.error) setError(res.error);
                                  else router.refresh();
                                });
                              }}
                            >
                              Verstuur
                            </button>
                          ) : r.customer_email && !emailConfigured ? (
                            <span className="facturen-table__muted" title="E-mail niet geconfigureerd">
                              —
                            </span>
                          ) : (
                            <span className="facturen-table__muted">—</span>
                          )}
                        </td>
                      )}
                      <td>
                        <label className="invoice-toggle">
                          <input
                            type="checkbox"
                            checked={!!r.sent_at}
                            disabled={pending}
                            onChange={(e) => {
                              setError(null);
                              startTransition(async () => {
                                const res = await setInvoiceSent(r.id, e.target.checked);
                                if (res.error) setError(res.error);
                              });
                            }}
                          />
                          <span className="facturen-table__muted">{fmtDateTime(r.sent_at)}</span>
                        </label>
                      </td>
                      <td>
                        <label className="invoice-toggle">
                          <input
                            type="checkbox"
                            checked={!!r.paid_at}
                            disabled={pending}
                            onChange={(e) => {
                              setError(null);
                              startTransition(async () => {
                                const res = await setInvoicePaid(r.id, e.target.checked);
                                if (res.error) setError(res.error);
                              });
                            }}
                          />
                          <span className="facturen-table__muted">{fmtDateTime(r.paid_at)}</span>
                        </label>
                        {overdue && (
                          <div className="facturen-table__remind">
                            <a
                              href={`/beheer/facturen/${r.id}/herinnering.pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="facturen-table__link facturen-table__link--small"
                            >
                              Herinnering PDF
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      {error && (
        <p className="facturen-alert facturen-alert--error" role="alert">
          {error}
        </p>
      )}

      <div className="facturen-kpi">
        <div className="facturen-kpi__card">
          <span className="facturen-kpi__value">{totalAll}</span>
          <span className="facturen-kpi__label">Totaal facturen</span>
        </div>
        <div className="facturen-kpi__card facturen-kpi__card--unsent">
          <span className="facturen-kpi__value">{onverstuurd.length}</span>
          <span className="facturen-kpi__label">Onverstuurd</span>
        </div>
        <div className="facturen-kpi__card facturen-kpi__card--sent">
          <span className="facturen-kpi__value">{sent.length}</span>
          <span className="facturen-kpi__label">Openstaand</span>
        </div>
        <div className="facturen-kpi__card facturen-kpi__card--paid">
          <span className="facturen-kpi__value">{paid.length}</span>
          <span className="facturen-kpi__label">Betaald</span>
        </div>
      </div>

      <div className="facturen-search">
        <label className="facturen-search__label" htmlFor="facturen-zoek">
          Zoeken
        </label>
        <input
          id="facturen-zoek"
          className="facturen-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nummer, datum, klant of onderwerp…"
          aria-label="Zoeken in facturen"
        />
      </div>

      {renderTable("Onverstuurd", onverstuurd, "unsent")}
      {renderTable("Openstaand", sent, "sent")}
      {renderTable("Betaald", paid, "paid")}
    </>
  );
}

