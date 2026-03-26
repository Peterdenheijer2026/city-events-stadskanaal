"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAppOrigin } from "@/lib/app-origin";
import { loadInvoicePdfData } from "@/lib/invoice-pdf-data";
import { buildInvoicePdfBuffer, STICHTING } from "@/lib/invoice-pdf";
import { buildInvoiceEmailBodyHtml } from "@/lib/invoice-email-text";
import { sendInvoiceEmail } from "@/lib/send-invoice-email";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

type VatRate = 0 | 0.09 | 0.21;

export type InvoiceLineDraft = {
  description: string;
  quantity: number;
  vatRate: VatRate;
  unitExcl?: number | null;
  unitIncl?: number | null;
  lastEdited: "excl" | "incl";
};

export type InvoiceDraft = {
  invoiceDate: string; // yyyy-mm-dd
  subject: string;
  notes: string;
  customer: {
    id?: string | null;
    name: string;
    /** Optioneel: alleen voor aanhef in e-mail; anders wordt betaler-naam gebruikt. */
    recipientName?: string | null;
    email?: string | null;
    postcode: string;
    houseNumber: string;
    houseNumberAddition: string;
    street: string;
    city: string;
    country: string;
  };
  lines: InvoiceLineDraft[];
};

export type InvoiceCustomerListItem = {
  id: string;
  name: string;
  recipient_name: string | null;
  email: string | null;
  postcode: string | null;
  house_number: string | null;
  house_number_addition: string | null;
  street: string | null;
  city: string | null;
  country: string | null;
};

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function calcExclFromIncl(incl: number, rate: VatRate) {
  if (rate === 0) return incl;
  // Bewaar een nauwkeurige exclusief-prijs; afronding doen we pas bij weergave.
  return incl / (1 + rate);
}

async function assertTreasurer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
  return { supabase, user };
}

async function nextInvoiceNumber(supabase: Awaited<ReturnType<typeof createClient>>, year: string) {
  const prefix = `${year}-`;
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);
  if (error) throw error;
  const last = data?.[0]?.invoice_number as string | undefined;
  const next = last ? (Number(last.split("-")[1]) || 0) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function createInvoice(draft: InvoiceDraft): Promise<{ id: string | null; error: string | null }> {
  try {
    const { supabase, user } = await assertTreasurer();

    if (!draft.customer?.name?.trim()) return { id: null, error: "Naam van betaler is verplicht." };
    if (!draft.invoiceDate) return { id: null, error: "Factuurdatum is verplicht." };
    if (!Array.isArray(draft.lines) || draft.lines.length === 0) return { id: null, error: "Minstens 1 regel is verplicht." };

    const year = String(draft.invoiceDate).slice(0, 4);
    if (!/^\d{4}$/.test(year)) return { id: null, error: "Ongeldige datum." };

    const invoiceNumber = await nextInvoiceNumber(supabase, year);

    const emailRaw = (draft.customer.email ?? "").trim();
    let customerEmail: string | null = null;
    if (emailRaw) {
      if (!isValidEmail(emailRaw)) return { id: null, error: "Ongeldig e-mailadres." };
      customerEmail = emailRaw.toLowerCase();
    }

    const recipientRaw = (draft.customer.recipientName ?? "").trim();
    const recipientName = recipientRaw || null;

    let customerId: string | null = null;
    const selectedCustomerId = (draft.customer.id ?? "").trim();

    if (selectedCustomerId) {
      const { data: existingCustomer, error: existingErr } = await supabase
        .from("invoice_customers")
        .select("id")
        .eq("id", selectedCustomerId)
        .single();
      if (existingErr || !existingCustomer) return { id: null, error: "Geselecteerde klant bestaat niet meer." };
      customerId = existingCustomer.id;
    } else {
      const { data: customerRow, error: custErr } = await supabase
        .from("invoice_customers")
        .insert({
          name: draft.customer.name.trim(),
          recipient_name: recipientName,
          email: customerEmail,
          postcode: draft.customer.postcode?.trim() || null,
          house_number: draft.customer.houseNumber?.trim() || null,
          house_number_addition: draft.customer.houseNumberAddition?.trim() || null,
          street: draft.customer.street?.trim() || null,
          city: draft.customer.city?.trim() || null,
          country: (draft.customer.country?.trim() || "NL").toUpperCase(),
        })
        .select("id")
        .single();
      if (custErr) return { id: null, error: custErr.message };
      customerId = customerRow.id;
    }

    const { data: invoiceRow, error: invErr } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        invoice_date: draft.invoiceDate,
        customer_id: customerId,
        subject: draft.subject?.trim() || null,
        notes: draft.notes?.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (invErr) return { id: null, error: invErr.message };

    const linesPayload = draft.lines.map((l, i) => {
      const qty = Number.isFinite(l.quantity) && l.quantity > 0 ? l.quantity : 1;
      const rate = l.vatRate;
      const desc = l.description?.trim() || "";
      if (!desc) throw new Error(`Regel ${i + 1}: omschrijving is verplicht.`);

      let unitExcl = l.unitExcl ?? null;
      let unitIncl = l.unitIncl ?? null;
      if (l.lastEdited === "incl" && typeof unitIncl === "number") {
        unitExcl = calcExclFromIncl(unitIncl, rate);
      } else if (l.lastEdited === "excl" && typeof unitExcl === "number") {
        unitExcl = round2(unitExcl);
      } else if (typeof unitExcl === "number") {
        unitExcl = round2(unitExcl);
      } else if (typeof unitIncl === "number") {
        unitExcl = calcExclFromIncl(unitIncl, rate);
      }

      if (typeof unitExcl !== "number" || !Number.isFinite(unitExcl) || unitExcl < 0) {
        throw new Error(`Regel ${i + 1}: bedrag is ongeldig.`);
      }

      return {
        invoice_id: invoiceRow.id,
        position: i + 1,
        description: desc,
        quantity: qty,
        unit_price_excl: unitExcl,
        vat_rate: rate,
      };
    });

    const { error: lineErr } = await supabase.from("invoice_lines").insert(linesPayload);
    if (lineErr) return { id: null, error: lineErr.message };

    revalidatePath("/beheer/facturen");
    revalidatePath(`/beheer/facturen/${invoiceRow.id}`);
    return { id: invoiceRow.id, error: null };
  } catch (e) {
    return { id: null, error: e instanceof Error ? e.message : "Opslaan mislukt." };
  }
}

export async function listInvoiceCustomers(): Promise<InvoiceCustomerListItem[]> {
  const { supabase } = await assertTreasurer();
  const { data, error } = await supabase
    .from("invoice_customers")
    .select("id, name, recipient_name, email, postcode, house_number, house_number_addition, street, city, country")
    .order("name", { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as InvoiceCustomerListItem[];
}

export async function listInvoices(): Promise<
  {
    id: string;
    invoice_number: string;
    invoice_date: string;
    subject: string | null;
    customer_name: string | null;
    customer_email: string | null;
    sent_at: string | null;
    paid_at: string | null;
  }[]
> {
  const { supabase } = await assertTreasurer();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, subject, sent_at, paid_at, invoice_customers(name, email)")
    .order("invoice_date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    invoice_number: r.invoice_number,
    invoice_date: r.invoice_date,
    subject: r.subject ?? null,
    sent_at: r.sent_at ?? null,
    paid_at: r.paid_at ?? null,
    customer_name: r.invoice_customers?.name ?? null,
    customer_email: r.invoice_customers?.email ?? null,
  }));
}

export async function setInvoiceSent(id: string, sent: boolean): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();
    const { error } = await supabase
      .from("invoices")
      .update({ sent_at: sent ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/beheer/facturen");
    revalidatePath(`/beheer/facturen/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Opslaan mislukt." };
  }
}

export async function setInvoicePaid(id: string, paid: boolean): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();
    const { error } = await supabase
      .from("invoices")
      .update({ paid_at: paid ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/beheer/facturen");
    revalidatePath(`/beheer/facturen/${id}`);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Opslaan mislukt." };
  }
}

export async function deleteInvoice(id: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/beheer/facturen");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Verwijderen mislukt." };
  }
}

export async function getInvoice(id: string): Promise<{
  invoice: { id: string; invoice_number: string; invoice_date: string; subject: string | null; notes: string | null; sent_at: string | null; paid_at: string | null };
  customer: {
    name: string;
    recipient_name: string | null;
    email: string | null;
    postcode: string | null;
    house_number: string | null;
    house_number_addition: string | null;
    street: string | null;
    city: string | null;
    country: string;
  };
  lines: { position: number; description: string; quantity: number; unit_price_excl: number; vat_rate: VatRate }[];
} | null> {
  const { supabase } = await assertTreasurer();

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, subject, notes, sent_at, paid_at, customer_id")
    .eq("id", id)
    .single();
  if (invErr) return null;

  const { data: customer, error: custErr } = await supabase
    .from("invoice_customers")
    .select("name, recipient_name, email, postcode, house_number, house_number_addition, street, city, country")
    .eq("id", invoice.customer_id)
    .single();
  if (custErr) return null;

  const { data: lines, error: lineErr } = await supabase
    .from("invoice_lines")
    .select("position, description, quantity, unit_price_excl, vat_rate")
    .eq("invoice_id", id)
    .order("position", { ascending: true });
  if (lineErr) return null;

  return {
    invoice: {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      subject: invoice.subject ?? null,
      notes: invoice.notes ?? null,
      sent_at: invoice.sent_at ?? null,
      paid_at: invoice.paid_at ?? null,
    },
    customer: customer as any,
    lines: (lines ?? []) as any,
  };
}

export async function updateInvoiceCustomerContact(
  invoiceId: string,
  input: { email: string | null; recipientName: string | null }
): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();
    const trimmed = input.email?.trim() ?? "";
    let emailValue: string | null = null;
    if (trimmed) {
      if (!isValidEmail(trimmed)) return { error: "Ongeldig e-mailadres." };
      emailValue = trimmed.toLowerCase();
    }

    const recipientName = (input.recipientName ?? "").trim() || null;

    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("customer_id")
      .eq("id", invoiceId)
      .single();
    if (invErr || !inv) return { error: "Factuur niet gevonden." };

    const { error } = await supabase
      .from("invoice_customers")
      .update({ email: emailValue, recipient_name: recipientName })
      .eq("id", inv.customer_id);
    if (error) return { error: error.message };
    revalidatePath("/beheer/facturen");
    revalidatePath(`/beheer/facturen/${invoiceId}`);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Opslaan mislukt." };
  }
}

/**
 * Verstuurt de factuur-PDF per e-mail (Resend) en zet sent_at als de mail is verzonden.
 */
export async function sendInvoiceByEmail(invoiceId: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();

    const data = await getInvoice(invoiceId);
    if (!data) return { error: "Factuur niet gevonden." };

    const to = data.customer.email?.trim();
    if (!to) return { error: "Geen e-mailadres bij deze betaler. Vul eerst een e-mailadres in." };
    if (!isValidEmail(to)) return { error: "Ongeldig e-mailadres bij deze betaler." };

    const pdfData = await loadInvoicePdfData(supabase, invoiceId);
    if (!pdfData) return { error: "Factuur niet gevonden." };

    const origin = getAppOrigin();
    const logoUrl = `${origin}/assets/logo.png`;
    const pdfBytes = await buildInvoicePdfBuffer(pdfData, logoUrl);

    const num = pdfData.invoice.invoice_number;
    const recipientName = data.customer.recipient_name ?? null;
    const html = buildInvoiceEmailBodyHtml({
      invoiceNumber: num,
      invoiceDate: pdfData.invoice.invoice_date,
      payerName: data.customer.name,
      recipientName,
    });

    const sent = await sendInvoiceEmail({
      to,
      subject: `Factuur ${num} – ${STICHTING.name}`,
      html,
      pdfFilename: `factuur-${num}.pdf`,
      pdfBytes,
    });

    if (!sent.ok) return { error: sent.error };

    const { error: upErr } = await supabase
      .from("invoices")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", invoiceId);
    if (upErr) return { error: upErr.message };

    revalidatePath("/beheer/facturen");
    revalidatePath(`/beheer/facturen/${invoiceId}`);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Versturen mislukt." };
  }
}

