import { createClient } from "@/lib/supabase/server";
import { FinancienNav } from "@/app/components/FinancienNav";
import { redirect } from "next/navigation";
import InvoiceForm from "./InvoiceForm";
import { listInvoiceCustomers } from "../actions";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function assertTreasurer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

export default async function NieuweFactuurPage() {
  await assertTreasurer();
  const customers = await listInvoiceCustomers();

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Financiën · Debiteuren · Nieuw</p>
            <h1 className="facturen-app__title">Nieuwe debiteurfactuur</h1>
            <p className="facturen-app__subtitle">Betaler, regels en bedragen invoeren</p>
          </div>
          <FinancienNav />
        </header>

        <main className="facturen-app__main">
          <InvoiceForm customers={customers} />
        </main>
      </div>
    </div>
  );
}

