import { STICHTING } from "@/lib/invoice-pdf";
import { escapeHtml } from "@/lib/send-invoice-email";

/** Weergavenaam penningmeester (ondertekening factuurmail). */
export const PENNINGMEESTER_NAME = "Ferdy Hulshof";

function formatInvoiceDateNl(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}-${m}-${y}`;
}

/** Naam voor aanhef: eerst recipient_name, anders betaler-naam, anders 'relatie'. */
export function greetingNameForEmail(recipientName: string | null, payerName: string): string {
  const r = (recipientName ?? "").trim();
  if (r) return r;
  const p = payerName.trim();
  if (p) return p;
  return "relatie";
}

/**
 * HTML-body voor factuurmail (SMTP/Resend), inclusief aanhef en handtekening penningmeester.
 */
export function buildInvoiceEmailBodyHtml(params: {
  invoiceNumber: string;
  invoiceDate: string;
  payerName: string;
  recipientName: string | null;
}): string {
  const { invoiceNumber, invoiceDate, payerName, recipientName } = params;
  const naam = escapeHtml(greetingNameForEmail(recipientName, payerName));
  const num = escapeHtml(invoiceNumber);
  const datum = escapeHtml(formatInvoiceDateNl(invoiceDate));
  const stichting = escapeHtml(STICHTING.name);
  const iban = escapeHtml(STICHTING.iban.replace(/\s+/g, " ").trim());
  const ferdy = escapeHtml(PENNINGMEESTER_NAME);
  const days = STICHTING.paymentTermDays;

  return `<p>Geachte ${naam},</p>
<p>Hierbij ontvangt u factuur <strong>${num}</strong> van ${stichting} als PDF-bijlage.</p>
<p>De factuur is uitgegeven op ${datum}. Wij verzoeken u het openstaande bedrag bij voorkeur binnen ${days} dagen over te maken op bankrekening <strong>${iban}</strong>, onder vermelding van het factuurnummer.</p>
<p>Heeft u vragen over deze factuur, neem dan gerust contact met ons op.</p>
<p>Met vriendelijke groet,</p>
<p><strong>${ferdy}</strong><br/>Penningmeester<br/>${stichting}</p>`;
}
