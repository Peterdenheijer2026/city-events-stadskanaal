"use client";

import { useMemo, useState, useTransition } from "react";
import { createInvoice } from "../actions";

type VatRate = 0 | 0.09 | 0.21;

type Line = {
  id: string;
  description: string;
  quantity: string; // keep as string for inputs
  vatRate: VatRate;
  unitExcl: string;
  unitIncl: string;
  lastEdited: "excl" | "incl";
};

type Customer = {
  name: string;
  postcode: string;
  houseNumber: string;
  houseNumberAddition: string;
  street: string;
  city: string;
  country: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function toNumber(v: string): number | null {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatEUR(n: number) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function calcFromExcl(excl: number, rate: VatRate) {
  const incl = excl * (1 + rate);
  const vat = incl - excl;
  return { excl: round2(excl), incl: round2(incl), vat: round2(vat) };
}

function calcFromIncl(incl: number, rate: VatRate) {
  const excl = rate === 0 ? incl : incl / (1 + rate);
  const vat = incl - excl;
  return { excl: round2(excl), incl: round2(incl), vat: round2(vat) };
}

export default function InvoiceForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(null);
  const [addressLookupPending, setAddressLookupPending] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    postcode: "",
    houseNumber: "",
    houseNumberAddition: "",
    street: "",
    city: "",
    country: "NL",
  });

  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [lines, setLines] = useState<Line[]>([
    {
      id: uid(),
      description: "",
      quantity: "1",
      vatRate: 0.21,
      unitExcl: "",
      unitIncl: "",
      lastEdited: "excl",
    },
  ]);

  const computed = useMemo(() => {
    let totalExcl = 0;
    let totalVat = 0;
    let totalIncl = 0;
    const vatBuckets: Record<string, { rate: VatRate; excl: number; vat: number; incl: number }> = {};

    const perLine = lines.map((l) => {
      const q = toNumber(l.quantity) ?? 0;
      const rate = l.vatRate;
      const inclInput = toNumber(l.unitIncl);
      const exclInput = toNumber(l.unitExcl);

      const base =
        l.lastEdited === "incl"
          ? calcFromIncl(inclInput ?? 0, rate)
          : calcFromExcl(exclInput ?? 0, rate);

      const unitIncl =
        l.lastEdited === "incl" && inclInput !== null ? round2(inclInput) : base.incl;
      const unitExcl = base.excl;

      const lineExcl = round2(unitExcl * q);
      const lineIncl = round2(unitIncl * q);
      const lineVat = round2(lineIncl - lineExcl);

      totalExcl = round2(totalExcl + lineExcl);
      totalVat = round2(totalVat + lineVat);
      totalIncl = round2(totalIncl + lineIncl);

      const key = String(rate);
      if (!vatBuckets[key]) vatBuckets[key] = { rate, excl: 0, vat: 0, incl: 0 };
      vatBuckets[key].excl = round2(vatBuckets[key].excl + lineExcl);
      vatBuckets[key].vat = round2(vatBuckets[key].vat + lineVat);
      vatBuckets[key].incl = round2(vatBuckets[key].incl + lineIncl);

      return {
        unitExcl,
        unitIncl,
        unitVat: round2(unitIncl - unitExcl),
        lineExcl,
        lineVat,
        lineIncl,
      };
    });

    const vats = Object.values(vatBuckets).sort((a, b) => b.rate - a.rate);
    return { perLine, totalExcl, totalVat, totalIncl, vats };
  }, [lines]);

  function setLine(id: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        id: uid(),
        description: "",
        quantity: "1",
        vatRate: 0.21,
        unitExcl: "",
        unitIncl: "",
        lastEdited: "excl",
      },
    ]);
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)));
  }

  function syncAmounts(id: string, mode: "excl" | "incl", value: string) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const rate = l.vatRate;
        const n = toNumber(value);
        if (n === null) {
          return {
            ...l,
            lastEdited: mode,
            unitExcl: mode === "excl" ? value : l.unitExcl,
            unitIncl: mode === "incl" ? value : l.unitIncl,
          };
        }
        const base = mode === "excl" ? calcFromExcl(n, rate) : calcFromIncl(n, rate);
        return {
          ...l,
          lastEdited: mode,
          unitExcl: String(base.excl).replace(".", ","),
          unitIncl: String(base.incl).replace(".", ","),
        };
      })
    );
  }

  function onVatChange(id: string, rate: VatRate) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        // Recompute the other field based on lastEdited
        const editedValue = l.lastEdited === "incl" ? l.unitIncl : l.unitExcl;
        const n = toNumber(editedValue);
        if (n === null) return { ...l, vatRate: rate };
        const base = l.lastEdited === "incl" ? calcFromIncl(n, rate) : calcFromExcl(n, rate);
        return {
          ...l,
          vatRate: rate,
          unitExcl: String(base.excl).replace(".", ","),
          unitIncl: String(base.incl).replace(".", ","),
        };
      })
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      invoiceDate,
      subject,
      notes,
      customer,
      lines: lines.map((l) => ({
        description: l.description,
        quantity: toNumber(l.quantity) ?? 1,
        vatRate: l.vatRate,
        unitExcl: toNumber(l.unitExcl),
        unitIncl: toNumber(l.unitIncl),
        lastEdited: l.lastEdited,
      })),
    };

    startTransition(async () => {
      const res = await createInvoice(payload as any);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.id) {
        window.location.href = `/beheer/facturen/${res.id}`;
      }
    });
  }

  async function lookupAddress() {
    setAddressLookupError(null);
    const pc = customer.postcode.replace(/\s+/g, "").toUpperCase();
    const nr = customer.houseNumber.trim();
    if (!pc || !nr) return;

    setAddressLookupPending(true);
    try {
      const res = await fetch("/api/postcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode: pc, houseNumber: nr }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          setAddressLookupError("Adres niet gevonden. Vul straat en plaats handmatig in.");
        } else if (res.status === 500) {
          setAddressLookupError("Postcode-service niet geconfigureerd. Vul adres handmatig in.");
        } else {
          setAddressLookupError("Adres ophalen mislukt. Vul adres handmatig in.");
        }
        return;
      }
      const data = (await res.json()) as { street?: string; city?: string };
      setCustomer((c) => ({
        ...c,
        street: data.street ?? c.street,
        city: data.city ?? c.city,
      }));
    } catch {
      setAddressLookupError("Adres ophalen mislukt. Vul adres handmatig in.");
    } finally {
      setAddressLookupPending(false);
    }
  }

  return (
    <form className="invoice-form facturen-form" onSubmit={handleSubmit}>
      {error && (
        <p className="beheer-dashboard__error" role="alert">
          {error}
        </p>
      )}
      <section className="invoice-form__section">
        <h2>Betaler</h2>
        <div className="invoice-form__grid">
          <label>
            Naam
            <input
              value={customer.name}
              onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              required
            />
          </label>
          <label>
            Postcode
            <input
              value={customer.postcode}
              onChange={(e) => setCustomer((c) => ({ ...c, postcode: e.target.value.toUpperCase() }))}
              onBlur={lookupAddress}
              placeholder="1234AB"
              inputMode="text"
            />
          </label>
          <label>
            Huisnr
            <input
              value={customer.houseNumber}
              onChange={(e) => setCustomer((c) => ({ ...c, houseNumber: e.target.value }))}
              onBlur={lookupAddress}
              inputMode="numeric"
              placeholder="12"
            />
          </label>
          <label>
            Toevoeging
            <input
              value={customer.houseNumberAddition}
              onChange={(e) => setCustomer((c) => ({ ...c, houseNumberAddition: e.target.value }))}
              placeholder="A"
            />
          </label>
          <label>
            Straat
            <input
              value={customer.street}
              onChange={(e) => setCustomer((c) => ({ ...c, street: e.target.value }))}
              placeholder="Straatnaam"
              readOnly={!manualAddress}
            />
          </label>
          <label>
            Plaats
            <input
              value={customer.city}
              onChange={(e) => setCustomer((c) => ({ ...c, city: e.target.value }))}
              placeholder="Stadskanaal"
              readOnly={!manualAddress}
            />
          </label>
          <label>
            Land
            <input
              value={customer.country}
              onChange={(e) => setCustomer((c) => ({ ...c, country: e.target.value.toUpperCase() }))}
              placeholder="NL"
            />
          </label>
        </div>
        {addressLookupError && (
          <p className="beheer-dashboard__hint" style={{ color: "#ef9a9a", marginTop: "0.5rem" }}>
            {addressLookupError}
          </p>
        )}
        {!manualAddress && (
          <div className="invoice-form__actions" style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className="invoice-form__btn"
              onClick={() => setManualAddress(true)}
              disabled={addressLookupPending}
            >
              Adres handmatig invullen
            </button>
          </div>
        )}
      </section>

      <section className="invoice-form__section">
        <h2>Factuur</h2>
        <div className="invoice-form__grid">
          <label>
            Datum
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </label>
          <label className="invoice-form__span2">
            Onderwerp
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Bijv. Sponsoring" />
          </label>
          <label className="invoice-form__span2">
            Opmerking
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </label>
        </div>
      </section>

      <section className="invoice-form__section">
        <h2>Regels</h2>

        <div className="invoice-lines">
          <div className="invoice-lines__head">
            <div>Omschrijving</div>
            <div>Aantal</div>
            <div>BTW</div>
            <div>Excl.</div>
            <div>Incl.</div>
            <div>BTW</div>
            <div>Totaal incl.</div>
            <div />
          </div>

          {lines.map((l, idx) => {
            const c = computed.perLine[idx];
            return (
              <div key={l.id} className="invoice-lines__row">
                <input
                  value={l.description}
                  onChange={(e) => setLine(l.id, { description: e.target.value })}
                  placeholder="Bijv. Sponsorbijdrage"
                  required
                />
                <input
                  value={l.quantity}
                  onChange={(e) => setLine(l.id, { quantity: e.target.value })}
                  inputMode="decimal"
                  placeholder="1"
                />
                <select
                  value={String(l.vatRate)}
                  onChange={(e) => onVatChange(l.id, Number(e.target.value) as VatRate)}
                >
                  <option value="0.21">21%</option>
                  <option value="0.09">9%</option>
                  <option value="0">0%</option>
                </select>
                <input
                  value={l.unitExcl}
                  onChange={(e) => syncAmounts(l.id, "excl", e.target.value)}
                  inputMode="decimal"
                  placeholder="0,00"
                />
                <input
                  value={l.unitIncl}
                  onChange={(e) => syncAmounts(l.id, "incl", e.target.value)}
                  inputMode="decimal"
                  placeholder="0,00"
                />
                <div className="invoice-lines__calc">{formatEUR(c?.unitVat ?? 0)}</div>
                <div className="invoice-lines__calc">{formatEUR(c?.lineIncl ?? 0)}</div>
                <button
                  type="button"
                  className="invoice-lines__remove"
                  onClick={() => removeLine(l.id)}
                  disabled={lines.length <= 1}
                  aria-label="Regel verwijderen"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="invoice-form__actions">
          <button type="button" className="invoice-form__btn" onClick={addLine}>
            Regel toevoegen
          </button>
        </div>

        <div className="invoice-totals">
          <div className="invoice-totals__row">
            <span>Totaal excl.</span>
            <strong>{formatEUR(computed.totalExcl)}</strong>
          </div>
          {computed.vats.map((v) => (
            <div key={String(v.rate)} className="invoice-totals__row invoice-totals__row--sub">
              <span>BTW {Math.round(v.rate * 100)}%</span>
              <strong>{formatEUR(v.vat)}</strong>
            </div>
          ))}
          <div className="invoice-totals__row invoice-totals__row--grand">
            <span>Totaal incl.</span>
            <strong>{formatEUR(computed.totalIncl)}</strong>
          </div>
        </div>
      </section>

      <div className="invoice-form__footer">
        <button type="submit" className="invoice-form__submit facturen-btn facturen-btn--primary" disabled={pending}>
          {pending ? "Opslaan…" : "Factuur opslaan"}
        </button>
      </div>
    </form>
  );
}

