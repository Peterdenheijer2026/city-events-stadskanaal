import { createClient } from "@/lib/supabase/server";
import { buildReminderPdfBuffer, type ReminderPdfData } from "@/lib/reminder-pdf";

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

  const { data: invoiceRow, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, subject, notes, customer_id, sent_at, paid_at")
    .eq("id", id)
    .single();
  if (invErr || !invoiceRow) return new Response("Not found", { status: 404 });

  if (!invoiceRow.sent_at || invoiceRow.paid_at) {
    return new Response("Not eligible for reminder", { status: 400 });
  }

  const sentAt = new Date(invoiceRow.sent_at);
  if (Number.isNaN(sentAt.getTime())) return new Response("Not eligible for reminder", { status: 400 });
  const days = Math.floor((Date.now() - sentAt.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 14) return new Response("Not eligible for reminder", { status: 400 });

  const { data: customerRow, error: custErr } = await supabase
    .from("invoice_customers")
    .select("name, postcode, house_number, house_number_addition, street, city, country")
    .eq("id", invoiceRow.customer_id)
    .single();
  if (custErr || !customerRow) return new Response("Not found", { status: 404 });

  const { data: lines, error: lineErr } = await supabase
    .from("invoice_lines")
    .select("position, description, quantity, unit_price_excl, vat_rate")
    .eq("invoice_id", id)
    .order("position", { ascending: true });
  if (lineErr || !lines) return new Response("Not found", { status: 404 });

  const data: ReminderPdfData = {
    invoice: {
      id: invoiceRow.id,
      invoice_number: invoiceRow.invoice_number,
      invoice_date: invoiceRow.invoice_date,
      subject: invoiceRow.subject ?? null,
      notes: invoiceRow.notes ?? null,
    },
    customer: customerRow as any,
    lines: lines as any,
  };

  const bytes = await buildReminderPdfBuffer(data, logoUrl);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"herinnering-${invoiceRow.invoice_number}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}

