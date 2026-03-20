import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FinancienNav } from "@/app/components/FinancienNav";
import { redirect } from "next/navigation";
import { listPurchaseInvoices } from "../actions";
import CrediteurenClient from "./CrediteurenClient";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function assertTreasurerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

export default async function CrediteurenPage() {
  await assertTreasurerPage();

  let rows: Awaited<ReturnType<typeof listPurchaseInvoices>> = [];
  try {
    rows = await listPurchaseInvoices();
  } catch {
    rows = [];
  }

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Financiën · Crediteuren</p>
            <h1 className="facturen-app__title">Crediteuren</h1>
            <p className="facturen-app__subtitle">
              Facturen van leveranciers: PDF, bedragen en betalingen bijhouden.
            </p>
          </div>
          <FinancienNav
            primaryAction={{
              href: "/beheer/boekhouding/crediteuren/nieuw",
              label: "+ Factuur inboeken",
            }}
          />
        </header>

        <main className="facturen-app__main">
          {rows.length === 0 ? (
            <div className="facturen-empty">
              <p className="facturen-empty__title">Nog geen crediteuren</p>
              <p className="facturen-empty__text">Boek je eerste leveranciersfactuur in om te beginnen.</p>
              <Link href="/beheer/boekhouding/crediteuren/nieuw" className="facturen-btn facturen-btn--primary">
                Factuur inboeken
              </Link>
            </div>
          ) : (
            <CrediteurenClient initialRows={rows} />
          )}
        </main>
      </div>
    </div>
  );
}
