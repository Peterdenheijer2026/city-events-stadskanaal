import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { listPurchaseInvoices } from "../actions";
import InkomendeClient from "./InkomendeClient";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function assertTreasurerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

export default async function InkomendeFacturenPage() {
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
            <p className="facturen-app__eyebrow">Financiën · Inkomend</p>
            <h1 className="facturen-app__title">Inkomende facturen</h1>
            <p className="facturen-app__subtitle">
              PDF uploaden, bedrag registreren en betalingen bijhouden (nog te betalen aan leveranciers).
            </p>
          </div>
          <div className="facturen-app__toolbar facturen-app__toolbar--wrap">
            <Link href="/beheer/boekhouding" className="facturen-btn facturen-btn--ghost">
              ← Boekhouding
            </Link>
            <Link href="/beheer/facturen" className="facturen-btn facturen-btn--ghost">
              Uitgaande facturen
            </Link>
          </div>
        </header>

        <main className="facturen-app__main">
          <InkomendeClient initialRows={rows} />
        </main>
      </div>
    </div>
  );
}
