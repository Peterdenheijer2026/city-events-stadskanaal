import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import type { Readable } from "node:stream";

export const runtime = "nodejs";

const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

const STICHTING = {
  name: "Stichting City Events Stadskanaal",
  addressLines: ["Navolaan 7", "9501 CX Stadskanaal"],
  kvk: "01147116",
  btw: "NL820526861B01",
  iban: "NL45 RABO 0122 8828 22",
  paymentTermDays: 14,
};

function formatDate(d: string) {
  // Expect yyyy-mm-dd
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}-${m}-${y}`;
}

function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d;
}

function eur(n: number) {
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

async function toUint8Array(body: unknown): Promise<Uint8Array> {
  if (!body) return new Uint8Array();

  // Node Buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyBody = body as any;
  if (typeof anyBody?.byteLength === "number" && typeof anyBody?.slice === "function" && typeof anyBody?.toString === "function") {
    // Buffer-like
    return new Uint8Array(anyBody);
  }

  if (body instanceof ArrayBuffer) return new Uint8Array(body);
  if (ArrayBuffer.isView(body)) return new Uint8Array(body.buffer);

  // Node.js Readable stream (common for @react-pdf/renderer in Next dev)
  if (typeof anyBody?.on === "function" && typeof anyBody?.pipe === "function") {
    const stream = anyBody as Readable;
    const chunks: Uint8Array[] = [];
    let total = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of stream as any) {
      const u8 = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
      chunks.push(u8);
      total += u8.byteLength;
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }
    return out;
  }

  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        const u8 = value instanceof Uint8Array ? value : new Uint8Array(value);
        chunks.push(u8);
        total += u8.byteLength;
      }
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }
    return out;
  }

  throw new Error("PDF output format not supported.");
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  headerLeft: { maxWidth: "60%", alignItems: "flex-start" },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  small: { fontSize: 10, color: "#444" },
  blockTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  logo: { width: 140, height: 46, objectFit: "contain", marginBottom: 8, alignSelf: "flex-start", marginLeft: -40 },
  table: { marginTop: 14, borderWidth: 1, borderColor: "#ddd" },
  trHead: { flexDirection: "row", backgroundColor: "#f4f4f4", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
  th: { padding: 8, fontWeight: 700 },
  td: { padding: 8 },
  c1: { width: "7%" },
  c2: { width: "43%" },
  c3: { width: "10%", textAlign: "right" },
  c4: { width: "10%", textAlign: "right" },
  c5: { width: "10%", textAlign: "right" },
  c6: { width: "20%", textAlign: "right" },
  totals: { marginTop: 14, alignSelf: "flex-end", width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalGrand: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#ddd", fontWeight: 700 },
  footer: { position: "absolute", bottom: 28, left: 36, right: 36, fontSize: 9, color: "#666" },
});

type InvoiceData = {
  invoice: { id: string; invoice_number: string; invoice_date: string; subject: string | null; notes: string | null };
  customer: { name: string; postcode: string | null; house_number: string | null; house_number_addition: string | null; street: string | null; city: string | null; country: string };
  lines: { position: number; description: string; quantity: number; unit_price_excl: number; vat_rate: number }[];
};

function InvoicePdf({ data, logoUrl }: { data: InvoiceData; logoUrl: string }) {
  const { invoice, customer, lines } = data;
  const due = addDays(invoice.invoice_date, STICHTING.paymentTermDays);
  const totals = lines.reduce(
    (acc, l) => {
      const excl = l.unit_price_excl * l.quantity;
      const incl = Math.round((excl * (1 + l.vat_rate) + Number.EPSILON) * 100) / 100;
      acc.excl += excl;
      acc.incl += incl;
      acc.vat += incl - excl;
      return acc;
    },
    { excl: 0, vat: 0, incl: 0 }
  );

  return (
    <Document title={`Factuur ${invoice.invoice_number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoUrl} style={styles.logo} />
            <Text style={styles.small}>{STICHTING.name}</Text>
            {STICHTING.addressLines.map((l) => (
              <Text key={l} style={styles.small}>
                {l}
              </Text>
            ))}
          </View>
          <View style={{ alignItems: "flex-end", marginTop: 54 }}>
            <Text style={styles.small}>Factuurnummer: {invoice.invoice_number}</Text>
            <Text style={styles.small}>Factuurdatum: {formatDate(invoice.invoice_date)}</Text>
            <Text style={styles.small}>Betaaltermijn: {STICHTING.paymentTermDays} dagen</Text>
            {due ? (
              <Text style={styles.small}>
                Vervaldatum: {due.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 6 }}>
          <Text style={styles.blockTitle}>Factuur aan</Text>
          <Text>{customer.name}</Text>
          <Text>
            {customer.street ? `${customer.street} ` : ""}
            {customer.house_number ?? ""}
            {customer.house_number_addition ? ` ${customer.house_number_addition}` : ""}
          </Text>
          <Text>
            {customer.postcode ?? ""} {customer.city ?? ""}
          </Text>
        </View>

        {invoice.subject ? (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.small}>Onderwerp: {invoice.subject}</Text>
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, styles.c1]}>#</Text>
            <Text style={[styles.th, styles.c2]}>Omschrijving</Text>
            <Text style={[styles.th, styles.c3]}>Aantal</Text>
            <Text style={[styles.th, styles.c4]}>BTW</Text>
            <Text style={[styles.th, styles.c5]}>Excl.</Text>
            <Text style={[styles.th, styles.c6]}>Totaal incl.</Text>
          </View>
          {lines.map((l) => {
            const excl = l.unit_price_excl * l.quantity;
            const incl = Math.round((excl * (1 + l.vat_rate) + Number.EPSILON) * 100) / 100;
            return (
              <View key={l.position} style={styles.tr}>
                <Text style={[styles.td, styles.c1]}>{l.position}</Text>
                <Text style={[styles.td, styles.c2]}>{l.description}</Text>
                <Text style={[styles.td, styles.c3]}>{l.quantity}</Text>
                <Text style={[styles.td, styles.c4]}>{Math.round(l.vat_rate * 100)}%</Text>
                <Text style={[styles.td, styles.c5]}>{eur(excl)}</Text>
                <Text style={[styles.td, styles.c6]}>{eur(incl)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Totaal excl.</Text>
            <Text>{eur(totals.excl)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>BTW</Text>
            <Text>{eur(totals.vat)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalGrand]}>
            <Text>Totaal incl.</Text>
            <Text>{eur(totals.incl)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.blockTitle}>Opmerking</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          {STICHTING.name}
          {STICHTING.kvk ? ` • KvK: ${STICHTING.kvk}` : ""}
          {STICHTING.iban ? ` • IBAN: ${STICHTING.iban}` : ""}
          {STICHTING.btw ? ` • BTW-id: ${STICHTING.btw}` : ""}
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const origin = new URL(_req.url).origin;
  const logoUrl = `${origin}/assets/logo.png`;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return new Response("Not authenticated", { status: 401 });
  if (user.email?.toLowerCase() !== TREASURER_EMAIL) return new Response("Forbidden", { status: 403 });

  const { data: invoiceRow, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, subject, notes, customer_id")
    .eq("id", id)
    .single();
  if (invErr || !invoiceRow) return new Response("Not found", { status: 404 });

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

  const data: InvoiceData = {
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

  const instance = pdf(<InvoicePdf data={data} logoUrl={logoUrl} />);
  const raw = await instance.toBuffer();
  const bytes = await toUint8Array(raw);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"factuur-${data.invoice.invoice_number}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}

