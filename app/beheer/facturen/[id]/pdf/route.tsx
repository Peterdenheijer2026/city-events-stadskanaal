import { createClient } from "@/lib/supabase/server";
import { loadInvoicePdfData } from "@/lib/invoice-pdf-data";
import { buildInvoicePdfBuffer } from "@/lib/invoice-pdf";

export const runtime = "nodejs";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const origin = new URL(req.url).origin;
  const logoUrl = `${origin}/assets/logo.png`;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return new Response("Not authenticated", { status: 401 });
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) return new Response("Forbidden", { status: 403 });

  const data = await loadInvoicePdfData(supabase, id);
  if (!data) return new Response("Not found", { status: 404 });

  const bytes = await buildInvoicePdfBuffer(data, logoUrl);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"factuur-${data.invoice.invoice_number}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}
