"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BeheerNoAccessPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      setDone(true);
      window.location.href = "/beheer/login?error=no_access";
    });
  }, []);

  return (
    <div className="beheer-login">
      <div className="beheer-login__card">
        <h1>Geen toegang</h1>
        <p className="beheer-login__sub">
          {done
            ? "Je wordt doorgestuurd naar het inlogscherm…"
            : "Je hebt nog geen rechten om de beheeromgeving te gebruiken. De beheerder moet je eerst minstens één plein toewijzen. Je wordt nu uitgelogd."}
        </p>
        {!done && (
          <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--color-gray)" }}>
            Even geduld…
          </p>
        )}
        <p className="beheer-login__back" style={{ marginTop: "1.5rem" }}>
          <Link href="/beheer/login">Naar inloggen</Link>
        </p>
      </div>
    </div>
  );
}
