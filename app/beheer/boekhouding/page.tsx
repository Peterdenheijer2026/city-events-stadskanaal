import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBookkeepingSummary } from "./actions";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function assertTreasurerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

function eur(n: number) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

export default async function BoekhoudingPage() {
  await assertTreasurerPage();

  let summary: Awaited<ReturnType<typeof getBookkeepingSummary>> | null = null;
  let loadError: string | null = null;
  try {
    summary = await getBookkeepingSummary();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Gegevens laden mislukt.";
  }

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Financiën</p>
            <h1 className="facturen-app__title">Boekhouding</h1>
            <p className="facturen-app__subtitle">
              Overzicht van geldstromen: openstaande vorderingen, te betalen inkomende facturen, en mutaties per maand.
            </p>
          </div>
          <div className="facturen-app__toolbar facturen-app__toolbar--wrap">
            <Link href="/beheer" className="facturen-btn facturen-btn--ghost">
              ← Beheer
            </Link>
            <Link href="/beheer/facturen" className="facturen-btn facturen-btn--ghost">
              Uitgaande facturen
            </Link>
            <Link href="/beheer/boekhouding/inkomende" className="facturen-btn facturen-btn--primary">
              Inkomende facturen
            </Link>
          </div>
        </header>

        <main className="facturen-app__main">
          {loadError && (
            <p className="facturen-alert facturen-alert--error" role="alert">
              {loadError}
              {loadError.includes("relation") || loadError.includes("purchase_invoices") ? (
                <span>
                  {" "}
                  Voer migratie 014 uit in Supabase en maak de bucket <code>purchase-invoices</code> aan (zie README).
                </span>
              ) : null}
            </p>
          )}

          {summary && (
            <>
              <div className="boekhoud-kpi">
                <div className="boekhoud-kpi__card boekhoud-kpi__card--in">
                  <span className="boekhoud-kpi__label">Te ontvangen (debiteuren)</span>
                  <span className="boekhoud-kpi__value">{eur(summary.debiteurenOpen)}</span>
                  <span className="boekhoud-kpi__hint">Uitgaande facturen verstuurd, nog niet betaald</span>
                </div>
                <div className="boekhoud-kpi__card boekhoud-kpi__card--out">
                  <span className="boekhoud-kpi__label">Te betalen (crediteuren)</span>
                  <span className="boekhoud-kpi__value">{eur(summary.crediteurenOpen)}</span>
                  <span className="boekhoud-kpi__hint">Inkomende facturen nog niet voldaan</span>
                </div>
                <div className="boekhoud-kpi__card boekhoud-kpi__card--net">
                  <span className="boekhoud-kpi__label">Netto (openstaand)</span>
                  <span className="boekhoud-kpi__value">{eur(summary.nettoLiquide)}</span>
                  <span className="boekhoud-kpi__hint">Ontvangen min te betalen</span>
                </div>
                <div className="boekhoud-kpi__card boekhoud-kpi__card--ytd">
                  <span className="boekhoud-kpi__label">Dit jaar betaald</span>
                  <span className="boekhoud-kpi__sub">
                    Uitgaand: <strong>{eur(summary.uitgaandBetaaldYtd)}</strong>
                  </span>
                  <span className="boekhoud-kpi__sub">
                    Inkomend: <strong>{eur(summary.inkomendBetaaldYtd)}</strong>
                  </span>
                </div>
              </div>

              <section className="boekhoud-section">
                <h2 className="boekhoud-section__title">Mutaties per maand (betaald)</h2>
                <p className="boekhoud-section__intro">
                  Gebaseerd op de datum waarop een uitgaande factuur als betaald is gezet, en op de betaaldatum van inkomende facturen.
                </p>
                <div className="facturen-table-wrap">
                  <table className="facturen-table facturen-table--numeric">
                    <thead>
                      <tr>
                        <th>Periode</th>
                        <th className="facturen-table__right">Uitgaand ontvangen</th>
                        <th className="facturen-table__right">Inkomend betaald</th>
                        <th className="facturen-table__right">Netto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.maandOverzicht.map((m) => (
                        <tr key={m.maandKey}>
                          <td>{m.maandLabel}</td>
                          <td className="facturen-table__right">{eur(m.uitgaandBetaald)}</td>
                          <td className="facturen-table__right">{eur(m.inkomendBetaald)}</td>
                          <td className="facturen-table__right facturen-table__strong">{eur(m.netto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
