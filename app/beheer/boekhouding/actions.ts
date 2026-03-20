"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";
const BUCKET = "purchase-invoices";

async function assertTreasurer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) redirect("/beheer/no-access");
  return { supabase, user };
}

function lineIncl(excl: number, qty: number, vat: number) {
  const t = excl * qty * (1 + vat);
  return Math.round((t + Number.EPSILON) * 100) / 100;
}

function sumInvoiceLines(lines: { unit_price_excl: number; quantity: number; vat_rate: number }[]) {
  return lines.reduce((s, l) => s + lineIncl(l.unit_price_excl, l.quantity, l.vat_rate), 0);
}

export type BookkeepingSummary = {
  /** Debiteuren: nog te ontvangen (verstuurd, niet betaald) */
  debiteurenOpen: number;
  /** Crediteuren: nog te betalen */
  crediteurenOpen: number;
  /** debiteurenOpen - crediteurenOpen */
  nettoLiquide: number;
  /** Debiteuren YTD betaald (dit kalenderjaar) */
  debiteurenBetaaldYtd: number;
  /** Crediteuren YTD betaald */
  crediteurenBetaaldYtd: number;
  /** Per maand laatste 6 maanden */
  maandOverzicht: {
    maandKey: string;
    maandLabel: string;
    debiteurenBetaald: number;
    crediteurenBetaald: number;
    netto: number;
  }[];
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}

export async function getBookkeepingSummary(): Promise<BookkeepingSummary> {
  const { supabase } = await assertTreasurer();
  const now = new Date();

  const { data: openSales, error: e1 } = await supabase
    .from("invoices")
    .select("id, invoice_lines(unit_price_excl, quantity, vat_rate)")
    .not("sent_at", "is", null)
    .is("paid_at", null);
  if (e1) throw e1;

  let debiteurenOpen = 0;
  for (const inv of openSales ?? []) {
    const lines = (inv as { invoice_lines?: { unit_price_excl: number; quantity: number; vat_rate: number }[] }).invoice_lines ?? [];
    debiteurenOpen += sumInvoiceLines(lines);
  }
  debiteurenOpen = Math.round((debiteurenOpen + Number.EPSILON) * 100) / 100;

  const { data: openPur, error: e2 } = await supabase.from("purchase_invoices").select("amount_incl").is("paid_at", null);
  if (e2) throw e2;
  const crediteurenOpen = (openPur ?? []).reduce((s, r) => s + Number(r.amount_incl ?? 0), 0);

  const yearStart = new Date();
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);

  const sixMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  sixMonthStart.setHours(0, 0, 0, 0);
  const fromIso = sixMonthStart.toISOString();

  const { data: paidInv, error: e3 } = await supabase
    .from("invoices")
    .select("id, paid_at, invoice_lines(unit_price_excl, quantity, vat_rate)")
    .not("paid_at", "is", null)
    .gte("paid_at", fromIso);
  if (e3) throw e3;

  let debiteurenBetaaldYtd = 0;
  const debiteurenPerMonth: Record<string, number> = {};
  for (const inv of paidInv ?? []) {
    const lines = (inv as { invoice_lines?: { unit_price_excl: number; quantity: number; vat_rate: number }[] }).invoice_lines ?? [];
    const tot = sumInvoiceLines(lines);
    const paidAt = new Date((inv as { paid_at: string }).paid_at);
    if (paidAt >= yearStart) debiteurenBetaaldYtd += tot;
    const k = monthKey(paidAt);
    debiteurenPerMonth[k] = (debiteurenPerMonth[k] ?? 0) + tot;
  }
  debiteurenBetaaldYtd = Math.round((debiteurenBetaaldYtd + Number.EPSILON) * 100) / 100;

  const { data: paidPur, error: e4 } = await supabase
    .from("purchase_invoices")
    .select("amount_incl, paid_at")
    .not("paid_at", "is", null)
    .gte("paid_at", fromIso);
  if (e4) throw e4;

  let crediteurenBetaaldYtd = 0;
  const crediteurenPerMonth: Record<string, number> = {};
  for (const p of paidPur ?? []) {
    const a = Number(p.amount_incl ?? 0);
    const paid = new Date(p.paid_at!);
    if (paid >= yearStart) crediteurenBetaaldYtd += a;
    const k = monthKey(paid);
    crediteurenPerMonth[k] = (crediteurenPerMonth[k] ?? 0) + a;
  }
  crediteurenBetaaldYtd = Math.round((crediteurenBetaaldYtd + Number.EPSILON) * 100) / 100;

  const maandOverzicht: BookkeepingSummary["maandOverzicht"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = monthKey(d);
    const v = Math.round(((debiteurenPerMonth[k] ?? 0) + Number.EPSILON) * 100) / 100;
    const ink = Math.round(((crediteurenPerMonth[k] ?? 0) + Number.EPSILON) * 100) / 100;
    maandOverzicht.push({
      maandKey: k,
      maandLabel: monthLabel(d),
      debiteurenBetaald: v,
      crediteurenBetaald: ink,
      netto: Math.round((v - ink + Number.EPSILON) * 100) / 100,
    });
  }

  return {
    debiteurenOpen,
    crediteurenOpen,
    nettoLiquide: Math.round((debiteurenOpen - crediteurenOpen + Number.EPSILON) * 100) / 100,
    debiteurenBetaaldYtd,
    crediteurenBetaaldYtd,
    maandOverzicht,
  };
}

export type PurchaseRow = {
  id: string;
  supplier_name: string;
  supplier_reference: string | null;
  invoice_date: string;
  due_date: string | null;
  amount_incl: number;
  paid_at: string | null;
  file_path: string | null;
  file_name: string | null;
};

export async function listPurchaseInvoices(): Promise<PurchaseRow[]> {
  const { supabase } = await assertTreasurer();
  const { data, error } = await supabase
    .from("purchase_invoices")
    .select("id, supplier_name, supplier_reference, invoice_date, due_date, amount_incl, paid_at, file_path, file_name")
    .order("invoice_date", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as PurchaseRow[];
}

export async function createPurchaseInvoice(formData: FormData): Promise<{ id: string | null; error: string | null }> {
  try {
    const { supabase, user } = await assertTreasurer();

    const supplier_name = String(formData.get("supplier_name") ?? "").trim();
    const supplier_reference = String(formData.get("supplier_reference") ?? "").trim() || null;
    const invoice_date = String(formData.get("invoice_date") ?? "").trim();
    const due_date = String(formData.get("due_date") ?? "").trim() || null;
    const amount_incl = Number(String(formData.get("amount_incl") ?? "").replace(",", "."));
    const vat_rate = Number(String(formData.get("vat_rate") ?? "0.21"));
    const notes = String(formData.get("notes") ?? "").trim() || null;
    const file = formData.get("file");

    if (!supplier_name) return { id: null, error: "Leverancier is verplicht." };
    if (!invoice_date) return { id: null, error: "Factuurdatum is verplicht." };
    if (!Number.isFinite(amount_incl) || amount_incl < 0) return { id: null, error: "Bedrag incl. BTW is ongeldig." };

    const vr = vat_rate === 0 || vat_rate === 0.09 || vat_rate === 0.21 ? vat_rate : 0.21;
    const amount_excl = vr === 0 ? amount_incl : Math.round((amount_incl / (1 + vr) + Number.EPSILON) * 100) / 100;

    let file_path: string | null = null;
    let file_name: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (file.size > 12 * 1024 * 1024) return { id: null, error: "Bestand max. 12 MB." };
      const mime = file.type || "";
      if (mime && mime !== "application/pdf" && !mime.includes("pdf")) {
        return { id: null, error: "Alleen PDF-bestanden zijn toegestaan." };
      }
      const ext = file.name.toLowerCase().endsWith(".pdf") ? ".pdf" : ".pdf";
      const safeName = `${user.id}/${randomUUID()}${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(safeName, buf, {
        contentType: "application/pdf",
        upsert: false,
      });
      if (upErr) return { id: null, error: `Upload mislukt: ${upErr.message}` };
      file_path = safeName;
      file_name = file.name || "factuur.pdf";
    }

    const { data: row, error: insErr } = await supabase
      .from("purchase_invoices")
      .insert({
        supplier_name,
        supplier_reference,
        invoice_date,
        due_date: due_date || null,
        amount_incl,
        amount_excl,
        vat_rate: vr,
        notes,
        file_path,
        file_name,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insErr) {
      if (file_path) await supabase.storage.from(BUCKET).remove([file_path]);
      return { id: null, error: insErr.message };
    }

    revalidatePath("/beheer/boekhouding");
    revalidatePath("/beheer/boekhouding/crediteuren");
    revalidatePath("/beheer/boekhouding/crediteuren/nieuw");
    return { id: row.id, error: null };
  } catch (e) {
    return { id: null, error: e instanceof Error ? e.message : "Opslaan mislukt." };
  }
}

export async function setPurchasePaid(id: string, paid: boolean): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();
    const { error } = await supabase
      .from("purchase_invoices")
      .update({ paid_at: paid ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/beheer/boekhouding");
    revalidatePath("/beheer/boekhouding/crediteuren");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Opslaan mislukt." };
  }
}

export async function deletePurchaseInvoice(id: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = await assertTreasurer();
    const { data: row } = await supabase.from("purchase_invoices").select("file_path").eq("id", id).single();
    const { error } = await supabase.from("purchase_invoices").delete().eq("id", id);
    if (error) return { error: error.message };
    if (row?.file_path) await supabase.storage.from(BUCKET).remove([row.file_path]);
    revalidatePath("/beheer/boekhouding");
    revalidatePath("/beheer/boekhouding/crediteuren");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Verwijderen mislukt." };
  }
}
