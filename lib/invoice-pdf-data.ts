import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceData } from "./invoice-pdf";

/** Laadt factuurgegevens voor PDF (zelfde structuur als download-route). */
export async function loadInvoicePdfData(
  supabase: SupabaseClient,
  id: string
): Promise<InvoiceData | null> {
  const { data: invoiceRow, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, subject, notes, customer_id")
    .eq("id", id)
    .single();
  if (invErr || !invoiceRow) return null;

  const { data: customerRow, error: custErr } = await supabase
    .from("invoice_customers")
    .select("name, postcode, house_number, house_number_addition, street, city, country")
    .eq("id", invoiceRow.customer_id)
    .single();
  if (custErr || !customerRow) return null;

  const { data: lines, error: lineErr } = await supabase
    .from("invoice_lines")
    .select("position, description, quantity, unit_price_excl, vat_rate")
    .eq("invoice_id", id)
    .order("position", { ascending: true });
  if (lineErr || !lines) return null;

  return {
    invoice: {
      id: invoiceRow.id,
      invoice_number: invoiceRow.invoice_number,
      invoice_date: invoiceRow.invoice_date,
      subject: invoiceRow.subject ?? null,
      notes: invoiceRow.notes ?? null,
    },
    customer: customerRow as InvoiceData["customer"],
    lines: lines as InvoiceData["lines"],
  };
}
