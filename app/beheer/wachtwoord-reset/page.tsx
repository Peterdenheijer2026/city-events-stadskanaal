"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WachtwoordResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const hasRecoveryHash = typeof window !== "undefined" && window.location.hash.includes("type=recovery");
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !hasRecoveryHash) {
        router.replace("/beheer/login?error=auth");
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Wachtwoord moet minstens 6 tekens zijn.");
      return;
    }
    if (password !== confirm) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => {
        router.push("/beheer");
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="beheer-login">
        <div className="beheer-login__card">
          <h1>Wachtwoord bijgewerkt</h1>
          <p className="beheer-login__sub">
            Je wachtwoord is gewijzigd. Je wordt doorgestuurd naar het beheer…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="beheer-login">
      <div className="beheer-login__card">
        <h1>Nieuw wachtwoord</h1>
        <p className="beheer-login__sub">
          Kies een nieuw wachtwoord voor je account.
        </p>

        {error && (
          <p className="beheer-login__msg beheer-login__msg--err">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="beheer-login__form">
          <label>
            Nieuw wachtwoord
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="min. 6 tekens"
            />
          </label>
          <label>
            Wachtwoord bevestigen
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="herhaal wachtwoord"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Opslaan…" : "Wachtwoord opslaan"}
          </button>
        </form>

        <p className="beheer-login__back" style={{ marginTop: "1.5rem" }}>
          <Link href="/beheer/login">← Terug naar inloggen</Link>
        </p>
      </div>
    </div>
  );
}
