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
    <div className="beheer-page">
      <header className="beheer-page__header">
        <h1>Facturen</h1>
        <div className="beheer-page__actions">
          <Link href="/beheer">← Terug</Link>
          <Link href="/beheer/facturen/nieuw">Nieuwe factuur</Link>
        </div>
      </header>

      <main className="beheer-dashboard">
        {rows.length === 0 ? (
          <p className="beheer-dashboard__hint">Nog geen facturen. Klik op “Nieuwe factuur”.</p>
        ) : (
          <InvoiceListClient rows={rows} />
        )}
      </main>
    </div>
  );
}

