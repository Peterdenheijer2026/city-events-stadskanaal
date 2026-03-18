"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { setInvoicePaid, setInvoiceSent } from "./actions";

type Row = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string | null;
  subject: string | null;
  sent_at: string | null;
  paid_at: string | null;
};

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function InvoiceListClient({ rows }: { rows: Row[] }) {
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

  const concept = filtered.filter((r) => !r.sent_at && !r.paid_at);
  const sent = filtered.filter((r) => !!r.sent_at && !r.paid_at);
  const paid = filtered.filter((r) => !!r.paid_at);

  function fmtDateTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
  }

  function renderTable(title: string, items: Row[]) {
    return (
      <section className="beheer-dashboard__section">
        <h2>{title}</h2>
        {items.length === 0 ? (
          <p className="beheer-dashboard__hint">Geen facturen.</p>
        ) : (
          <div className="beheer-dashboard__table-wrap">
            <table className="beheer-dashboard__table">
              <thead>
                <tr>
                  <th>Nummer</th>
                  <th>Datum</th>
                  <th>Klant</th>
                  <th>Onderwerp</th>
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
                      <td>
                        <Link href={`/beheer/facturen/${r.id}`} className="beheer-dashboard__link">
                          {r.invoice_number}
                        </Link>
                        {overdue && <span className="invoice-badge invoice-badge--overdue">te laat</span>}
                      </td>
                      <td>{r.invoice_date}</td>
                      <td>{r.customer_name ?? "—"}</td>
                      <td>{r.subject ?? "—"}</td>
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
                          <span>{fmtDateTime(r.sent_at)}</span>
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
                          <span>{fmtDateTime(r.paid_at)}</span>
                        </label>
                        {overdue && (
                          <div style={{ marginTop: "0.35rem" }}>
                            <a
                              href={`/beheer/facturen/${r.id}/herinnering.pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="beheer-dashboard__link"
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
        <p className="beheer-dashboard__error" role="alert">
          {error}
        </p>
      )}

      <div className="invoice-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoeken op nummer, klant, onderwerp…"
          aria-label="Zoeken"
        />
      </div>

      {renderTable("Concept", concept)}
      {renderTable("Verstuurd", sent)}
      {renderTable("Betaald", paid)}
    </>
  );
}

