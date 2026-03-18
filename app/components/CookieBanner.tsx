"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ConsentValue = "accepted" | "rejected";

const COOKIE_NAME = "ce_cookie_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  const hasChoice = useMemo(() => {
    const v = readCookie(COOKIE_NAME);
    return v === "accepted" || v === "rejected";
  }, []);

  useEffect(() => {
    if (!hasChoice) setVisible(true);
  }, [hasChoice]);

  function choose(v: ConsentValue) {
    writeCookie(COOKIE_NAME, v);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie voorkeuren">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <strong>Cookies</strong>
          <p>
            We gebruiken cookies om de website goed te laten werken en (optioneel) statistieken te
            verzamelen. Je kunt je voorkeur hieronder kiezen. Lees meer in onze{" "}
            <Link href="/privacy" className="cookie-banner__link">
              privacyverklaring
            </Link>
            .
          </p>
        </div>

        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--secondary"
            onClick={() => choose("rejected")}
          >
            Alleen noodzakelijk
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--primary"
            onClick={() => choose("accepted")}
          >
            Alles accepteren
          </button>
        </div>
      </div>
    </div>
  );
}

