import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvoiceForm from "./InvoiceForm";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function assertTreasurer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

export default async function NieuweFactuurPage() {
  await assertTreasurer();

  return (
    <div className="beheer-page">
      <header className="beheer-page__header">
        <h1>Nieuwe factuur</h1>
        <div className="beheer-page__actions">
          <Link href="/beheer/facturen">← Terug</Link>
        </div>
      </header>

      <main className="beheer-dashboard">
        <InvoiceForm />
      </main>
    </div>
  );
}

