import { buildBookkeepingCsv } from "@/lib/bookkeeping";
import { createClient } from "@/lib/supabase/server";
import { getBookkeepingSummary } from "../actions";

export const runtime = "nodejs";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return new Response("Not authenticated", { status: 401 });
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) return new Response("Forbidden", { status: 403 });

  try {
    const summary = await getBookkeepingSummary();
    const csv = buildBookkeepingCsv(summary);
    const d = new Date();
    const fname = `boekhouding-export-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.csv`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fname}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export mislukt.";
    return new Response(msg, { status: 500 });
  }
}
