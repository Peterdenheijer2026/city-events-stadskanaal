import { createClient } from "@/lib/supabase/server";
import { FinancienNav } from "@/app/components/FinancienNav";
import { redirect } from "next/navigation";
import CrediteurenInboekForm from "../CrediteurenInboekForm";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

async function assertTreasurerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
}

export default async function CrediteurenInboekenPage() {
  await assertTreasurerPage();

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Financiën · Crediteuren · Inboeken</p>
            <h1 className="facturen-app__title">Factuur inboeken</h1>
            <p className="facturen-app__subtitle">Leveranciersfactuur registreren voor het crediteurenoverzicht.</p>
          </div>
          <FinancienNav />
        </header>

        <main className="facturen-app__main">
          <CrediteurenInboekForm />
        </main>
      </div>
    </div>
  );
}
