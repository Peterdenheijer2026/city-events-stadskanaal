"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendInvoiceByEmail, updateInvoiceCustomerContact } from "../actions";

export default function InvoiceEmailPanel({
  invoiceId,
  initialEmail,
  initialRecipientName,
  sentAt,
  emailConfigured,
}: {
  invoiceId: string;
  initialEmail: string | null;
  initialRecipientName: string | null;
  sentAt: string | null;
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [recipientName, setRecipientName] = useState(initialRecipientName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSend = !sentAt && email.trim().length > 0 && emailConfigured;

  function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateInvoiceCustomerContact(invoiceId, {
        email: email || null,
        recipientName: recipientName || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await sendInvoiceByEmail(invoiceId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="invoice-form__section facturen-panel">
      <h2 className="facturen-panel__h">E-mail</h2>
      <p className="facturen-panel__intro">
        Factuur als PDF versturen naar het e-mailadres van de betaler. Na verzenden wordt de factuur automatisch als{" "}
        <strong>verstuurd</strong> gemarkeerd.
      </p>
      {!emailConfigured && (
        <p className="facturen-alert facturen-alert--warn" role="status">
          <strong>Lokaal:</strong> zet <code>EMAIL_FROM</code> plus SMTP (<code>SMTP_HOST</code>,{" "}
          <code>SMTP_USER</code>, <code>SMTP_PASS</code>) in <code>.env.local</code> in de projectmap en herstart{" "}
          <code>npm run dev</code>.<br />
          <strong>Live (Vercel):</strong> hetzelfde toevoegen onder Project → <strong>Settings</strong> →{" "}
          <strong>Environment Variables</strong> — <code>.env.local</code> wordt niet mee gepusht.<br />
          Zie <strong>BOEKHOUDING-SETUP.md</strong>.
        </p>
      )}
      {error && (
        <p className="facturen-alert facturen-alert--error" role="alert">
          {error}
        </p>
      )}
      <form className="facturen-email-form" onSubmit={saveEmail}>
        <label className="facturen-email-form__label">
          E-mailadres betaler
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@voorbeeld.nl"
            disabled={pending}
          />
        </label>
        <label className="facturen-email-form__label">
          Naam voor aanhef in e-mail
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="bijv. Jan Jansen — leeg = naam betaler op factuur"
            disabled={pending}
          />
        </label>
        <div className="facturen-email-form__actions">
          <button type="submit" className="facturen-btn facturen-btn--ghost" disabled={pending}>
            Opslaan
          </button>
          <button
            type="button"
            className="facturen-btn facturen-btn--primary"
            disabled={pending || !canSend}
            onClick={send}
          >
            Factuur versturen
          </button>
        </div>
      </form>
      {sentAt && (
        <p className="facturen-table__muted" style={{ marginTop: "0.75rem" }}>
          Deze factuur is al gemarkeerd als verstuurd ({new Date(sentAt).toLocaleString("nl-NL")}). Versturen opnieuw
          is uitgeschakeld; gebruik anders PDF downloaden.
        </p>
      )}
    </section>
  );
}
