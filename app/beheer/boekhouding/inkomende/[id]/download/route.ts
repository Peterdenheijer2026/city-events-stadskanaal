import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";
const BUCKET = "purchase-invoices";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return new Response("Not authenticated", { status: 401 });
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) return new Response("Forbidden", { status: 403 });

  const { data: row, error } = await supabase
    .from("purchase_invoices")
    .select("file_path, file_name")
    .eq("id", id)
    .single();
  if (error || !row?.file_path) return new Response("Not found", { status: 404 });

  const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(row.file_path);
  if (dlErr || !blob) return new Response("Bestand niet gevonden", { status: 404 });

  const buf = await blob.arrayBuffer();
  const name = (row.file_name && row.file_name.endsWith(".pdf") ? row.file_name : `${row.file_name || "inkomend"}.pdf`).replace(
    /[^\w.\- ()]/g,
    "_"
  );

  return new Response(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
