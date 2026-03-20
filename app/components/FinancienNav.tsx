"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type FinancienNavProps = {
  primaryAction?: { href: string; label: string };
  children?: ReactNode;
};

function activeTab(pathname: string): "boekhouding" | "debiteuren" | "crediteuren" {
  if (pathname.startsWith("/beheer/boekhouding/crediteuren")) return "crediteuren";
  if (pathname.startsWith("/beheer/boekhouding")) return "boekhouding";
  if (pathname.startsWith("/beheer/facturen")) return "debiteuren";
  return "boekhouding";
}

/**
 * Tab-navigatie tussen Boekhouding, Debiteuren en Crediteuren (actief tabblad gemarkeerd).
 */
export function FinancienNav({ primaryAction, children }: FinancienNavProps) {
  const pathname = usePathname() ?? "";
  const tab = activeTab(pathname);

  return (
    <div className="facturen-app__toolbar financien-toolbar">
      <nav className="financien-tabs" aria-label="Boekhouding">
        <Link
          href="/beheer/boekhouding"
          className={`financien-tabs__tab${tab === "boekhouding" ? " is-active" : ""}`}
        >
          Boekhouding
        </Link>
        <Link
          href="/beheer/facturen"
          className={`financien-tabs__tab${tab === "debiteuren" ? " is-active" : ""}`}
        >
          Debiteuren
        </Link>
        <Link
          href="/beheer/boekhouding/crediteuren"
          className={`financien-tabs__tab${tab === "crediteuren" ? " is-active" : ""}`}
        >
          Crediteuren
        </Link>
      </nav>
      <div className="financien-toolbar__actions">
        {primaryAction && (
          <Link href={primaryAction.href} className="facturen-btn facturen-btn--primary">
            {primaryAction.label}
          </Link>
        )}
        {children}
        <form action="/beheer/logout" method="post" className="financien-logout-form">
          <button type="submit" className="facturen-btn facturen-btn--ghost facturen-btn--tiny">
            Uitloggen
          </button>
        </form>
      </div>
    </div>
  );
}
