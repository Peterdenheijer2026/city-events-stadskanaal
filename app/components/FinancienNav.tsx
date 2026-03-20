import Link from "next/link";
import type { ReactNode } from "react";

export type FinancienNavProps = {
  /** Alleen op `/beheer/boekhouding` (hub): geen dubbele knop "Boekhouding" */
  hub?: boolean;
  primaryAction?: { href: string; label: string };
  children?: ReactNode;
};

/**
 * Vaste navigatie tussen Beheer, Boekhouding, Debiteuren en Crediteuren.
 * Op de boekhouding-hub (`hub`) wordt alleen "Boekhouding" weggelaten als aparte link.
 */
export function FinancienNav({ hub = false, primaryAction, children }: FinancienNavProps) {
  return (
    <div className="facturen-app__toolbar facturen-app__toolbar--wrap">
      <Link href="/beheer" className="facturen-btn facturen-btn--ghost">
        ← Beheer
      </Link>
      {!hub && (
        <Link href="/beheer/boekhouding" className="facturen-btn facturen-btn--ghost">
          Boekhouding
        </Link>
      )}
      <Link href="/beheer/facturen" className="facturen-btn facturen-btn--ghost">
        Debiteuren
      </Link>
      <Link href="/beheer/boekhouding/crediteuren" className="facturen-btn facturen-btn--ghost">
        Crediteuren
      </Link>
      {primaryAction && (
        <Link href={primaryAction.href} className="facturen-btn facturen-btn--primary">
          {primaryAction.label}
        </Link>
      )}
      {children}
    </div>
  );
}
