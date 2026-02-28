"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/beheer/wachtwoord-reset`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="beheer-login">
        <div className="beheer-login__card">
          <h1>E-mail verzonden</h1>
          <p className="beheer-login__sub">
            Als er een account bestaat voor dit e-mailadres, heb je een e-mail ontvangen met een link om je wachtwoord opnieuw in te stellen. Controleer ook je spammap.
          </p>
          <p className="beheer-login__back" style={{ marginTop: "1.5rem" }}>
            <Link href="/beheer/login">Terug naar inloggen</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="beheer-login">
      <div className="beheer-login__card">
        <h1>Wachtwoord vergeten</h1>
        <p className="beheer-login__sub">
          Vul je e-mailadres in. We sturen je een link om een nieuw wachtwoord te kiezen.
        </p>

        {error && (
          <p className="beheer-login__msg beheer-login__msg--err">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="beheer-login__form">
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="jouw@email.nl"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Versturen…" : "Stuur resetlink"}
          </button>
        </form>

        <p className="beheer-login__back" style={{ marginTop: "1.5rem" }}>
          <Link href="/beheer/login">Terug naar inloggen</Link>
        </p>
      </div>
    </div>
  );
}
