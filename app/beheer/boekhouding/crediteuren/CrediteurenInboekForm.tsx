"use client";

import { useState, useTransition } from "react";
import { createPurchaseInvoice } from "../actions";

export default function CrediteurenInboekForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createPurchaseInvoice(fd);
      if (res.error) setError(res.error);
      else if (res.id) {
        window.location.href = "/beheer/boekhouding/crediteuren";
      }
    });
  }

  return (
    <>
      {error && (
        <p className="facturen-alert facturen-alert--error" role="alert">
          {error}
        </p>
      )}

      <section className="invoice-form__section facturen-panel boekhoud-form-card">
        <h2 className="facturen-panel__h">Factuur inboeken</h2>
        <p className="boekhoud-form-card__intro">
          Vul leverancier en bedrag in. PDF uploaden is optioneel maar aanbevolen voor je administratie. Na opslaan verschijn je weer op het crediteurenoverzicht.
        </p>
        <form onSubmit={onSubmit} className="boekhoud-crediteuren-form facturen-form">
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
              {pending ? "Opslaan…" : "Inboeken"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
