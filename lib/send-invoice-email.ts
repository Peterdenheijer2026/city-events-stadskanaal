/**
 * Transactionele e-mail via Resend (https://resend.com).
 * Vereist in .env: RESEND_API_KEY en EMAIL_FROM (bijv. Facturen <facturen@jouwdomein.nl>).
 */
export function isInvoiceEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim() && !!process.env.EMAIL_FROM?.trim();
}

export async function sendInvoiceEmailResend(params: {
  to: string;
  subject: string;
  html: string;
  pdfFilename: string;
  pdfBytes: Uint8Array;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) {
    return {
      ok: false,
      error:
        "E-mail is niet geconfigureerd. Zet RESEND_API_KEY en EMAIL_FROM in .env.local (zie documentatie).",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      attachments: [
        {
          filename: params.pdfFilename,
          content: Buffer.from(params.pdfBytes).toString("base64"),
        },
      ],
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (!res.ok) {
    const msg = json.message || json.error || `E-mail versturen mislukt (${res.status}).`;
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
