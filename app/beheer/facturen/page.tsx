import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { listInvoices } from "./actions";
import InvoiceListClient from "./InvoiceListClient";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function isTreasurer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  return { ok: user.email?.toLowerCase() === TREASURER_EMAIL };
}

export default async function FacturenPage() {
  const ok = await isTreasurer();
  if (!ok.ok) redirect("/beheer/no-access");

  const rows = await listInvoices();
  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Financiën · Debiteuren</p>
            <h1 className="facturen-app__title">Debiteuren</h1>
            <p className="facturen-app__subtitle">Openstaande vorderingen: overzicht, status en betalingen</p>
          </div>
          <div className="facturen-app__toolbar">
            <Link href="/beheer" className="facturen-btn facturen-btn--ghost">
              ← Beheer
            </Link>
            <Link href="/beheer/boekhouding" className="facturen-btn facturen-btn--ghost">
              Boekhouding
            </Link>
            <Link href="/beheer/facturen/nieuw" className="facturen-btn facturen-btn--primary">
              + Nieuwe factuur
            </Link>
          </div>
        </header>

        <main className="facturen-app__main">
          {rows.length === 0 ? (
            <div className="facturen-empty">
              <p className="facturen-empty__title">Nog geen debiteuren</p>
              <p className="facturen-empty__text">Maak je eerste debiteurfactuur aan om te beginnen.</p>
              <Link href="/beheer/facturen/nieuw" className="facturen-btn facturen-btn--primary">
                Nieuwe debiteurfactuur
              </Link>
            </div>
          ) : (
            <InvoiceListClient rows={rows} />
          )}
        </main>
      </div>
    </div>
  );
}

